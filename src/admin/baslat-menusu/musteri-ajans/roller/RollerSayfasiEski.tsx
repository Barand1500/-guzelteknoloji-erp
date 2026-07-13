import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RolKartlari,
  RolMatrisi,
  rolSilinebilirMi,
} from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/eski/RolBilesenleriEski';
import { RolDuzenleModal } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/RolDuzenleModal';
import { RolEkleModal } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/eski/RolEkleModal';
import { RolSilModal } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/eski/RolSilModal';
import { useKaydedilmemisBildirim } from '@/baglamlar/AdminUyariBildirimContext';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { kullaniciModuluErisimVar, useYetkiler } from '@/kancalar/useYetkiler';
import {
  adminRolleriGetir,
  adminRolleriKaydet,
  baslikdanKodUret,
  GECERLI_YETKI_LISTESI,
  rollerTemizle,
  type RolTanimi,
  type YetkiKodu,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';

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

export function RollerSayfasiEski() {
  const logMesajiAyarla = useAdminLogMesaji();
  const [taslakRoller, setTaslakRoller] = useState<RolTanimi[]>([]);
  const [kayitliRoller, setKayitliRoller] = useState<RolTanimi[]>([]);
  const yetkiTanimlari = GECERLI_YETKI_LISTESI;
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [ekleModalAcik, setEkleModalAcik] = useState(false);
  const [duzenleRol, setDuzenleRol] = useState<RolTanimi | null>(null);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliRolKod, setSeciliRolKod] = useState<string | null>(null);
  const kayitliRef = useRef<RolTanimi[]>([]);

  const { yetkiler: oturumYetkileri, kullaniciYonetimiVar } = useYetkiler();
  const yetkili = kullaniciModuluErisimVar(oturumYetkileri);
  const duzenlenebilir = kullaniciYonetimiVar;
  const degisti = !rollerEsitMi(taslakRoller, kayitliRoller);

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

  const rolEkle = useCallback((deger: { baslik: string; aciklama: string }) => {
    setTaslakRoller((onceki) => {
      const kod = baslikdanKodUret(
        deger.baslik,
        onceki.map((r) => r.kod)
      );
      setSeciliRolKod(kod);
      return [
        ...onceki,
        {
          kod,
          baslik: deger.baslik,
          aciklama: deger.aciklama,
          yetkiler: ['goruntuleme'] as YetkiKodu[],
          sistemRolu: false,
        },
      ];
    });
  }, []);

  const rolSec = useCallback((rol: RolTanimi) => {
    setSeciliRolKod((onceki) => (onceki === rol.kod ? null : rol.kod));
  }, []);

  const silIste = useCallback(() => {
    if (!seciliRol || !rolSilinebilirMi(seciliRol)) return;
    setSilModalAcik(true);
  }, [seciliRol]);

  const rolSilOnayla = useCallback(() => {
    if (!seciliRolKod) return;
    setTaslakRoller((onceki) => onceki.filter((r) => r.kod !== seciliRolKod));
    setSeciliRolKod(null);
  }, [seciliRolKod]);

  const kaydet = useCallback(async () => {
    setKaydediliyor(true);
    setHata('');
    try {
      const veri = await adminRolleriKaydet(rollerTemizle(taslakRoller));
      const temiz = rollerTemizle(veri.roller);
      logMesajiAyarla(
        logMesaj.kaydetti('Roller ve Yetkiler', `${temiz.length} rol ve yetki matrisini`)
      );
      setTaslakRoller(temiz);
      setKayitliRoller(temiz);
      kayitliRef.current = temiz;
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kaydetme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [taslakRoller, logMesajiAyarla]);

  const ekleAc = useCallback(() => setEkleModalAcik(true), []);

  useModulAksiyonlari(
    { kaydet, ekle: ekleAc, sil: silIste },
    {
      kaydet: duzenlenebilir && degisti && !kaydediliyor,
      ekle: duzenlenebilir && !kaydediliyor,
      sil: silAktif && !kaydediliyor,
    },
    duzenlenebilir && degisti
  );

  if (!yetkili) {
    return (
      <YetkisizErisim aciklama="Rol ve yetki bilgilerini görmek için Görüntüleme veya Kullanıcı Yönetimi yetkisi gerekir." />
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white">Roller ve Yetkiler</h1>
      <p className="mt-1 text-sm text-slate-400">
        Sistemdeki roller ve her role ait yetki matrisi. Kullanıcılara rol atamak için{' '}
        <strong className="text-slate-300">Kullanıcılar</strong> modülünü kullanın.
      </p>
      {hata && <p className="mt-4 text-sm text-red-400">{hata}</p>}
      {kaydediliyor && <p className="mt-4 text-sm text-slate-400">Kaydediliyor...</p>}

      {yukleniyor ? (
        <p className="mt-6 text-sm text-slate-400">Yükleniyor...</p>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Yetki Matrisi
            </h2>
            <RolMatrisi
              roller={taslakRoller}
              yetkiler={yetkiTanimlari}
              duzenlenebilir={duzenlenebilir}
              onYetkiToggle={yetkiToggle}
            />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Rol Tanımları
            </h2>
            <RolKartlari
              roller={taslakRoller}
              seciliKod={seciliRolKod}
              duzenlenebilir={duzenlenebilir}
              onSec={rolSec}
              onDuzenle={setDuzenleRol}
            />
          </section>
        </div>
      )}

      <RolEkleModal
        acik={ekleModalAcik}
        onKapat={() => setEkleModalAcik(false)}
        onEkle={rolEkle}
      />
      <RolDuzenleModal
        acik={!!duzenleRol}
        rol={duzenleRol}
        onKapat={() => setDuzenleRol(null)}
        onKaydet={rolDuzenle}
      />
      <RolSilModal
        acik={silModalAcik}
        rol={seciliRol}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={rolSilOnayla}
      />
    </div>
  );
}
