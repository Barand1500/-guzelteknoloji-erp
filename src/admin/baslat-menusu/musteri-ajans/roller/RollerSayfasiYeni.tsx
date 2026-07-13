import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {

  RolKartlari,

  RolMatrisi,

  rolSilinebilirMi,

  rolTaslakMi,

} from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/RolBilesenleri';

import { RolDuzenleModal } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/RolDuzenleModal';

import { RolGorunumCubugu } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/RolGorunumCubugu';

import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';

import { AdminModulKabuk, AdminPanelKarti, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';

import { useKaydedilmemisBildirim } from '@/baglamlar/AdminUyariBildirimContext';

import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';

import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useYetkiler } from '@/kancalar/useYetkiler';

import {

  adminRolleriGetir,

  adminRolleriKaydet,

  baslikdanKodUret,

  GECERLI_YETKI_LISTESI,

  rollerTemizle,

  type RolTanimi,

  type YetkiKodu,

} from '@/admin/baslat-menusu/musteri-ajans/roller/api';

import './roller.css';



const GORUNUM_SEKMELER = [

  { id: 'matris', ad: 'Yetki Matrisi', ikon: '⊞' },

  { id: 'kartlar', ad: 'Rol Tanımları', ikon: '🛡️' },

] as const;



type RolGorunumId = (typeof GORUNUM_SEKMELER)[number]['id'];



function rollerEsitMi(a: RolTanimi[], b: RolTanimi[]): boolean {

  if (a.length !== b.length) return false;

  return a.every((rol, i) => {

    const diger = b[i];

    if (rol.kod !== diger.kod || rol.baslik !== diger.baslik || rol.aciklama !== diger.aciklama) {

      return false;

    }

    if (rol.yetkiler.length !== diger.yetkiler.length) return false;

    return rol.yetkiler.every((y, j) => y === diger.yetkiler[j]);

  });

}



function kaydaHazirRoller(roller: RolTanimi[]): RolTanimi[] {

  return roller

    .filter((r) => !rolTaslakMi(r.kod) || r.baslik.trim())

    .map((r) => {

      if (!rolTaslakMi(r.kod)) return r;

      const digerKodlar = roller.filter((x) => x.kod !== r.kod).map((x) => x.kod);

      return {

        ...r,

        kod: baslikdanKodUret(r.baslik, digerKodlar),

        baslik: r.baslik.trim(),

        aciklama: r.aciklama.trim(),

      };

    });

}



export function RollerSayfasiYeni() {

  const logMesajiAyarla = useAdminLogMesaji();

  const { kullaniciModuluErisimiVar } = useYetkiler();

  const [taslakRoller, setTaslakRoller] = useState<RolTanimi[]>([]);

  const [kayitliRoller, setKayitliRoller] = useState<RolTanimi[]>([]);

  const yetkiTanimlari = GECERLI_YETKI_LISTESI;

  const [yukleniyor, setYukleniyor] = useState(true);

  const [kaydediliyor, setKaydediliyor] = useState(false);

  const [hata, setHata] = useState('');

  const [duzenleRol, setDuzenleRol] = useState<RolTanimi | null>(null);

  const [silModalAcik, setSilModalAcik] = useState(false);

  const [seciliRolKod, setSeciliRolKod] = useState<string | null>(null);

  const [yeniRolKaynagi, setYeniRolKaynagi] = useState<Map<string, 'matris' | 'kartlar'>>(new Map());

  const [gorunum, setGorunum] = useState<RolGorunumId>('matris');

  const [gorunumYonu, setGorunumYonu] = useState<'ileri' | 'geri'>('ileri');

  const matrisSarmalRef = useRef<HTMLDivElement>(null);

  const kayitliRef = useRef<RolTanimi[]>([]);



  const yetkili = kullaniciModuluErisimiVar;
  const duzenlenebilir = kullaniciModuluErisimiVar;

  const degisti = !rollerEsitMi(taslakRoller, kayitliRoller);

  const acikTaslakVar = yeniRolKaynagi.size > 0;

  const yeniMatrisKodlari = useMemo(

    () => new Set([...yeniRolKaynagi.entries()].filter(([, k]) => k === 'matris').map(([kod]) => kod)),

    [yeniRolKaynagi]

  );

  const yeniKartKodlari = useMemo(

    () => new Set([...yeniRolKaynagi.entries()].filter(([, k]) => k === 'kartlar').map(([kod]) => kod)),

    [yeniRolKaynagi]

  );

  const matrisRoller = useMemo(

    () => taslakRoller.filter((r) => !rolTaslakMi(r.kod) || yeniRolKaynagi.get(r.kod) === 'matris'),

    [taslakRoller, yeniRolKaynagi]

  );

  const kartRoller = useMemo(

    () =>

      taslakRoller.filter(

        (r) => !rolTaslakMi(r.kod) || yeniRolKaynagi.get(r.kod) === 'kartlar' || r.baslik.trim()

      ),

    [taslakRoller, yeniRolKaynagi]

  );



  useKaydedilmemisBildirim(

    duzenlenebilir && degisti && !kaydediliyor,

    'Kaydedilmemiş değişiklikler var.',

    'Roller ve Yetkiler',

    'roller'

  );



  const seciliRol = taslakRoller.find((r) => r.kod === seciliRolKod) ?? null;

  const silAktif = duzenlenebilir && !!seciliRol && rolSilinebilirMi(seciliRol);



  async function yukle() {

    setYukleniyor(true);

    setHata('');

    try {

      const veri = await adminRolleriGetir();

      const temiz = rollerTemizle(veri.roller);

      setTaslakRoller(temiz);

      setKayitliRoller(temiz);

      kayitliRef.current = temiz;

      setYeniRolKaynagi(new Map());

    } catch (err) {

      setHata(err instanceof Error ? err.message : 'Roller alınamadı');

    } finally {

      setYukleniyor(false);

    }

  }



  useEffect(() => {

    if (!yetkili) {

      setYukleniyor(false);

      return;

    }

    void yukle();

  }, [yetkili]);



  useEffect(() => {

    if (yeniMatrisKodlari.size === 0) return;

    const sarmal = matrisSarmalRef.current;

    if (!sarmal) return;

    sarmal.scrollTop = sarmal.scrollHeight;

  }, [yeniMatrisKodlari.size, matrisRoller.length]);



  const gorunumDegistir = useCallback(

    (yeni: RolGorunumId) => {

      if (yeni === gorunum) return;

      const eskiIdx = GORUNUM_SEKMELER.findIndex((s) => s.id === gorunum);

      const yeniIdx = GORUNUM_SEKMELER.findIndex((s) => s.id === yeni);

      if (eskiIdx >= 0 && yeniIdx >= 0) {

        setGorunumYonu(yeniIdx > eskiIdx ? 'ileri' : 'geri');

      }

      setGorunum(yeni);

    },

    [gorunum]

  );



  const yetkiToggle = useCallback((rolKod: string, yetkiKod: YetkiKodu) => {

    setTaslakRoller((onceki) =>

      onceki.map((rol) => {

        if (rol.kod !== rolKod || korunmusRolMu(rol.kod)) return rol;

        const varMi = rol.yetkiler.includes(yetkiKod);

        const yeniYetkiler = varMi

          ? rol.yetkiler.filter((y) => y !== yetkiKod)

          : [...rol.yetkiler, yetkiKod];

        return { ...rol, yetkiler: yeniYetkiler };

      })

    );

  }, []);



  const rolDuzenle = useCallback((kod: string, deger: { baslik: string; aciklama: string }) => {

    setTaslakRoller((onceki) =>

      onceki.map((rol) => (rol.kod === kod ? { ...rol, ...deger } : rol))

    );

  }, []);



  const rolAlanDegis = useCallback((kod: string, alan: 'baslik' | 'aciklama', deger: string) => {

    setTaslakRoller((onceki) =>

      onceki.map((rol) => (rol.kod === kod ? { ...rol, [alan]: deger } : rol))

    );

  }, []);



  const rolBaslikBlur = useCallback((kod: string, baslik: string) => {

    const trimmed = baslik.trim();

    if (!trimmed || !rolTaslakMi(kod)) return;



    setTaslakRoller((onceki) => {

      const digerKodlar = onceki.filter((r) => r.kod !== kod).map((r) => r.kod);

      const yeniKod = baslikdanKodUret(trimmed, digerKodlar);

      if (yeniKod === kod) {

        return onceki.map((r) => (r.kod === kod ? { ...r, baslik: trimmed } : r));

      }

      setYeniRolKaynagi((onceki) => {

        const n = new Map(onceki);

        const kaynak = onceki.get(kod);

        n.delete(kod);

        if (yeniKod.startsWith('TASLAK_') && kaynak) {

          n.set(yeniKod, kaynak);

        }

        return n;

      });

      setSeciliRolKod((oncekiSecili) => (oncekiSecili === kod ? yeniKod : oncekiSecili));

      return onceki.map((r) =>

        r.kod === kod ? { ...r, kod: yeniKod, baslik: trimmed } : r

      );

    });

  }, []);



  const yeniRolIptal = useCallback((kod: string) => {

    setTaslakRoller((onceki) => onceki.filter((r) => r.kod !== kod));

    setYeniRolKaynagi((onceki) => {

      const n = new Map(onceki);

      n.delete(kod);

      return n;

    });

    setSeciliRolKod((onceki) => (onceki === kod ? null : onceki));

  }, []);



  const ekleAc = useCallback(() => {

    if (acikTaslakVar) return;

    const kod = `TASLAK_${Date.now()}`;

    setTaslakRoller((onceki) => [

      ...onceki,

      {

        kod,

        baslik: '',

        aciklama: '',

        yetkiler: ['goruntuleme'] as YetkiKodu[],

        sistemRolu: false,

      },

    ]);

    setYeniRolKaynagi((onceki) => new Map(onceki).set(kod, gorunum));

    setSeciliRolKod(kod);

  }, [acikTaslakVar, gorunum]);



  const rolSec = useCallback((rol: RolTanimi) => {

    setSeciliRolKod((onceki) => (onceki === rol.kod ? null : rol.kod));

  }, []);



  const silIste = useCallback(() => {

    if (!seciliRol || !rolSilinebilirMi(seciliRol)) return;

    if (rolTaslakMi(seciliRol.kod)) {

      yeniRolIptal(seciliRol.kod);

      return;

    }

    setSilModalAcik(true);

  }, [seciliRol, yeniRolIptal]);



  const rolSilOnayla = useCallback(() => {

    if (!seciliRolKod) return;

    setTaslakRoller((onceki) => onceki.filter((r) => r.kod !== seciliRolKod));

    setSeciliRolKod(null);

    setSilModalAcik(false);

  }, [seciliRolKod]);



  const kaydet = useCallback(async () => {

    const hazir = kaydaHazirRoller(taslakRoller);

    const bosTaslak = taslakRoller.some((r) => rolTaslakMi(r.kod) && !r.baslik.trim());

    if (bosTaslak) {

      setHata('Boş yeni rol alanını doldurun veya ✕ ile kaldırın.');

      return;

    }



    setKaydediliyor(true);

    setHata('');

    try {

      const veri = await adminRolleriKaydet(rollerTemizle(hazir));

      const temiz = rollerTemizle(veri.roller);

      logMesajiAyarla(

        logMesaj.kaydetti('Roller ve Yetkiler', `${temiz.length} rol ve yetki matrisini`)

      );

      setTaslakRoller(temiz);

      setKayitliRoller(temiz);

      kayitliRef.current = temiz;

      setYeniRolKaynagi(new Map());

    } catch (err) {

      setHata(err instanceof Error ? err.message : 'Kaydetme başarısız');

    } finally {

      setKaydediliyor(false);

    }

  }, [taslakRoller, logMesajiAyarla]);



  useModulAksiyonlari(

    { kaydet, ekle: ekleAc, sil: silIste },

    {

      kaydet: duzenlenebilir && degisti && !kaydediliyor,

      ekle: duzenlenebilir && !kaydediliyor && !acikTaslakVar,

      sil: silAktif && !kaydediliyor,

    },

    duzenlenebilir && degisti

  );



  if (!yetkili) {
    return (
      <YetkisizErisim aciklama="Rol ve yetki yönetimine yalnızca Süper Admin veya Kullanıcı Yönetimi yetkisine sahip kullanıcılar erişebilir." />
    );
  }



  return (

    <AdminModulKabuk

      baslik="Roller ve Yetkiler"

      aciklama="Sistemdeki roller ve her role ait yetki matrisi. Kullanıcılara rol atamak için Kullanıcılar modülünü kullanın."

      onizleGoster={false}

      ustAksiyon={

        <RolGorunumCubugu

          sekmeler={GORUNUM_SEKMELER}

          aktif={gorunum}

          onDegistir={(id) => gorunumDegistir(id as RolGorunumId)}

          ariaLabel="Rol görünümü"

        />

      }

    >

      <div className="ap-roller-sayfa">

        {hata && <div className="ap-bildirim ap-bildirim-hata rounded-xl p-4 text-sm">{hata}</div>}



        {duzenlenebilir && degisti && !kaydediliyor && (

          <div className="ap-roller-kirli-banner" role="status">

            <span aria-hidden>●</span>

            Kaydedilmemiş değişiklikler var — üst çubuktan Kaydet ile uygulayın.

          </div>

        )}



        {yukleniyor ? (

          <YukleniyorDurumu mesaj="Roller yükleniyor..." />

        ) : (

          <div className={`ap-roller-icerik ap-roller-icerik--${gorunumYonu}`} key={gorunum}>

            {gorunum === 'matris' ? (

              <AdminPanelKarti

                baslik="Yetki Matrisi"

                altBaslik="Ekle ile tablonun altına satır açılır. Yetkileri hücrelere tıklayarak işaretleyin."

              >

                <RolMatrisi

                  roller={matrisRoller}

                  yetkiler={yetkiTanimlari}

                  duzenlenebilir={duzenlenebilir}

                  yeniRolKodlari={yeniMatrisKodlari}

                  sarmalRef={matrisSarmalRef}

                  onYetkiToggle={yetkiToggle}

                  onRolAlanDegis={rolAlanDegis}

                  onRolBaslikBlur={rolBaslikBlur}

                  onYeniRolIptal={yeniRolIptal}

                />

              </AdminPanelKarti>

            ) : (

              <AdminPanelKarti

                baslik="Rol Tanımları"

                altBaslik="Ekle ile gridde boş kart açılır. Rol adı ve açıklamayı kart üzerinde doldurun."

              >

                <RolKartlari

                  roller={kartRoller}

                  seciliKod={seciliRolKod}

                  duzenlenebilir={duzenlenebilir}

                  yeniKartKodlari={yeniKartKodlari}

                  onSec={rolSec}

                  onDuzenle={setDuzenleRol}

                  onRolAlanDegis={rolAlanDegis}

                  onRolBaslikBlur={rolBaslikBlur}

                  onYeniRolIptal={yeniRolIptal}

                />

              </AdminPanelKarti>

            )}

          </div>

        )}

      </div>



      <RolDuzenleModal

        acik={!!duzenleRol}

        rol={duzenleRol}

        onKapat={() => setDuzenleRol(null)}

        onKaydet={rolDuzenle}

      />

      <SilmeOnayModal

        acik={silModalAcik}

        onKapat={() => setSilModalAcik(false)}

        onOnayla={rolSilOnayla}

        baslik="Bu rolü silmek istiyor musunuz?"

        hedefMetin={seciliRol ? `${seciliRol.baslik} (${seciliRol.kod})` : 'Seçili rol'}

        ariaLabel="Rol silme onayı"

      />

    </AdminModulKabuk>

  );

}


