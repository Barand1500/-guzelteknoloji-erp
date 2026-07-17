import { useCallback, useEffect, useMemo, useState } from 'react';

import {

  KullaniciDuzenleFormuYeni,

  KullaniciListesiYeni,

} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleriYeni';

import type { AtanabilirRol } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleri';

import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';

import { AdminModulKabuk, AdminPanelKarti, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';

import { useAuth } from '@/baglamlar/AuthContext';

import { useKaydedilmemisBildirim } from '@/baglamlar/AdminUyariBildirimContext';

import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';

import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

import { panelRolYoneticisiMi } from '@/admin/ortak/panelRolYardimci';

import { useYetkiler } from '@/kancalar/useYetkiler';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';

import { adminRolleriGetir } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

import {

  depolariGetir,

  donemleriGetir,

  firmalariGetir,

  kasalariGetir,

  subeleriGetir,

} from '@/admin/baslat-menusu/tanimlar/api';

import {

  adminKullaniciGuncelle,

  adminKullaniciOlustur,

  adminKullaniciSil,

  adminKullanicilariGetir,

  bosKullaniciForm,

  kullanicidanForm,

  VARSAYILAN_ROL_ETIKETLERI,

  type AdminKullanici,

  type KullaniciFormDegeri,

} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';

import {

  varsayilanOturumAlanlari,

  type KullaniciOturumSecenekleri,

} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/kullaniciOturumYardimci';

import './kullanicilar.css';



const bosOturumSecenekleri: KullaniciOturumSecenekleri = {

  firmalar: [],

  donemler: [],

  subeler: [],

  depolar: [],

  kasalar: [],

};



function formKirliMi(

  form: KullaniciFormDegeri,

  kayitli: KullaniciFormDegeri | null,

  sifreDegisti: boolean

): boolean {

  if (kayitli) {

    return (

      sifreDegisti ||

      form.kullaniciKodu !== kayitli.kullaniciKodu ||

      form.ad !== kayitli.ad ||

      form.rol !== kayitli.rol ||

      form.aktif !== kayitli.aktif ||

      form.firmaId !== kayitli.firmaId ||

      form.donemId !== kayitli.donemId ||

      form.subeId !== kayitli.subeId ||

      form.depoId !== kayitli.depoId ||

      form.kasaId !== kayitli.kasaId ||

      JSON.stringify(form.oturumYetkileri) !== JSON.stringify(kayitli.oturumYetkileri) ||

      form.pin !== kayitli.pin

    );

  }

  return (

    form.kullaniciKodu.trim() !== '' ||

    form.ad.trim() !== '' ||

    form.sifre.trim() !== '' ||

    form.pin.trim() !== ''

  );

}



export function KullanicilarSayfasiYeni() {

  const logMesajiAyarla = useAdminLogMesaji();

  const { kullanici: oturum } = useAuth();

  const { kullaniciModuluErisimiVar } = useYetkiler();

  const [kullanicilar, setKullanicilar] = useState<AdminKullanici[]>([]);

  const [form, setForm] = useState<KullaniciFormDegeri>(bosKullaniciForm);

  const [seciliId, setSeciliId] = useState<string | null>(null);

  const [sifreDegisti, setSifreDegisti] = useState(false);

  const [yukleniyor, setYukleniyor] = useState(true);

  const [kaydediliyor, setKaydediliyor] = useState(false);

  const [hata, setHata] = useState('');

  const [silModalAcik, setSilModalAcik] = useState(false);

  const [tumRoller, setTumRoller] = useState<AtanabilirRol[]>([]);

  const [rolBasliklari, setRolBasliklari] = useState<Record<string, string>>(VARSAYILAN_ROL_ETIKETLERI);

  const [oturumSecenekleri, setOturumSecenekleri] = useState<KullaniciOturumSecenekleri>(bosOturumSecenekleri);



  const yetkili = kullaniciModuluErisimiVar;
  const saltOkunur = !kullaniciModuluErisimiVar;



  const atanabilirRoller = tumRoller.filter((r) => {

    if (panelRolYoneticisiMi(oturum?.rol)) return true;

    return r.kod !== 'SUPER_ADMIN' && r.kod !== 'AJANS_ADMIN' && r.kod !== 'YONETICI';

  });



  async function yukle() {

    setYukleniyor(true);

    setHata('');

    try {

      const [liste, rolVeri, firmalar, donemler, subeler, depolar, kasalar] = await Promise.all([

        adminKullanicilariGetir(),

        adminRolleriGetir(),

        firmalariGetir(),

        donemleriGetir(),

        subeleriGetir(),

        depolariGetir(),

        kasalariGetir(),

      ]);

      setKullanicilar(liste);

      const roller = rolVeri.roller.map((r) => ({ kod: r.kod, baslik: r.baslik }));

      setTumRoller(roller);

      setRolBasliklari(Object.fromEntries(rolVeri.roller.map((r) => [r.kod, r.baslik])));

      setOturumSecenekleri({ firmalar, donemler, subeler, depolar, kasalar });

    } catch (err) {

      setHata(err instanceof Error ? err.message : 'Kullanıcılar alınamadı');

    } finally {

      setYukleniyor(false);

    }

  }



  useEffect(() => {

    if (yetkili) void yukle();

    else setYukleniyor(false);

  }, [yetkili]);



  // Tanım verisi yüklendikten sonra oturum alanlarını doldur (firma görünür ama firmaId boş kalmasın)
  useEffect(() => {
    if (yukleniyor || !oturumSecenekleri.firmalar.length || form.firmaId) return;
    setForm((onceki) => ({
      ...onceki,
      ...varsayilanOturumAlanlari(oturumSecenekleri),
    }));
  }, [yukleniyor, oturumSecenekleri, form.firmaId]);



  const yeniBaslat = useCallback(() => {

    setSeciliId(null);

    const varsayilanRol = atanabilirRoller[0]?.kod ?? 'MUSTERI_ADMIN';

    setForm({

      ...bosKullaniciForm,

      rol: varsayilanRol,

      ...varsayilanOturumAlanlari(oturumSecenekleri),

    });

    setSifreDegisti(false);

    setHata('');

  }, [atanabilirRoller, oturumSecenekleri]);



  const seciliKullanici = useMemo(

    () => (seciliId ? kullanicilar.find((k) => k.id === seciliId) ?? null : null),

    [seciliId, kullanicilar]

  );



  const kirli = useMemo(() => {

    const kayitli = seciliKullanici ? kullanicidanForm(seciliKullanici) : null;

    return formKirliMi(form, kayitli, sifreDegisti);

  }, [seciliKullanici, form, sifreDegisti]);



  useKaydedilmemisBildirim(

    kirli && !kaydediliyor,

    'Kaydedilmemiş değişiklikler var.',

    'Kullanıcılar',

    'kullanicilar'

  );



  const kaydet = useCallback(async () => {

    if (!form.ad.trim() || !form.kullaniciKodu.trim()) {

      setHata('Ad ve kullanıcı kodu zorunludur');

      return;

    }
    if (form.oturumYetkileri.length === 0) {
      setHata('En az bir firma ve dönem yetkisi seçin');
      return;
    }
    if (
      !form.oturumYetkileri.some(
        (y) => y.firmaId === form.firmaId && y.donemId === form.donemId
      )
    ) {
      setHata('Default firma ve dönem, kullanıcıya eklenen yetkilerden biri olmalıdır');
      return;
    }

    const hedef = `«${form.ad.trim()}» (${form.kullaniciKodu.trim()}) kullanıcısını`;

    setKaydediliyor(true);

    setHata('');

    try {

      if (seciliId) {

        await adminKullaniciGuncelle(seciliId, form, sifreDegisti);

        logMesajiAyarla(logMesaj.guncelledi('Kullanıcılar', hedef));

      } else {

        await adminKullaniciOlustur(form);

        logMesajiAyarla(logMesaj.ekledi('Kullanıcılar', hedef));

      }

      yeniBaslat();

      await yukle();

    } catch (err) {

      setHata(err instanceof Error ? err.message : 'Kayıt başarısız');

    } finally {

      setKaydediliyor(false);

    }

  }, [form, seciliId, sifreDegisti, yeniBaslat, logMesajiAyarla]);



  const sil = useCallback(() => {

    if (seciliId) setSilModalAcik(true);

  }, [seciliId]);



  const silOnayla = useCallback(async () => {

    if (!seciliId) return;

    const silinen = kullanicilar.find((k) => k.id === seciliId);

    setSilModalAcik(false);

    setKaydediliyor(true);

    setHata('');

    try {

      await adminKullaniciSil(seciliId);

      if (silinen) {

        logMesajiAyarla(

          logMesaj.sildi('Kullanıcılar', `«${silinen.ad}» (${silinen.kullaniciKodu}) kullanıcısını`)

        );

      }

      yeniBaslat();

      await yukle();

    } catch (err) {

      setHata(err instanceof Error ? err.message : 'Silme başarısız');

    } finally {

      setKaydediliyor(false);

    }

  }, [seciliId, yeniBaslat, kullanicilar, logMesajiAyarla]);



  useModulAksiyonlari(

    { kaydet, ekle: yeniBaslat, sil },

    {

      kaydet: kirli && !kaydediliyor,

      ekle: !kaydediliyor,

      sil: !!seciliId && !kaydediliyor,

    },

    kirli

  );



  if (!yetkili) {
    return (
      <YetkisizErisim aciklama="Kullanıcı yönetimine yalnızca Süper Admin veya Kullanıcı Yönetimi yetkisine sahip kullanıcılar erişebilir." />
    );
  }



  return (

    <AdminModulKabuk

      baslik="Kullanıcılar"

      aciklama="Panel kullanıcılarını oluşturun, rollerini atayın ve erişimlerini yönetin."

      onizleGoster={false}

    >

      <div className="ap-kullanicilar-sayfa ap-kullanicilar-sayfa--yeni">

        {saltOkunur && (
          <div className="ap-bildirim ap-bildirim-uyari rounded-xl p-4 text-sm" role="status">
            Salt okunur mod — kullanıcıları görüntüleyebilirsiniz; değişiklik için Kullanıcı Yönetimi yetkisi gerekir.
          </div>
        )}

        {hata && <div className="ap-bildirim ap-bildirim-hata rounded-xl p-4 text-sm">{hata}</div>}



        {kirli && !kaydediliyor && (

          <div className="ap-kullanici-kirli-banner" role="status">

            <span aria-hidden>●</span>

            Kaydedilmemiş değişiklikler var — üst çubuktan Kaydet ile uygulayın.

          </div>

        )}



        {yukleniyor ? (

          <YukleniyorDurumu mesaj="Kullanıcılar yükleniyor..." />

        ) : (

          <div className="ap-kullanicilar-yeni-duzen">

            <AdminPanelKarti

              baslik={seciliId ? 'Kullanıcı düzenle' : 'Yeni kullanıcı'}

              altBaslik={

                seciliId

                  ? 'Bilgileri güncelleyin ve Kaydet ile uygulayın'

                  : 'Formu doldurup Kaydet ile oluşturun'

              }

            >

              <KullaniciDuzenleFormuYeni
                form={form}
                seciliId={seciliId}
                atanabilirRoller={atanabilirRoller}
                oturumSecenekleri={oturumSecenekleri}
                onSifreDegisti={setSifreDegisti}
                onChange={setForm}
                saltOkunur={saltOkunur}
              />

            </AdminPanelKarti>



            <div className="ap-kullanicilar-yeni-liste-alan">

              <KullaniciListesiYeni

                kullanicilar={kullanicilar}

                seciliId={seciliId}

                rolBasliklari={rolBasliklari}

                onSec={(k) => {

                  setSeciliId(k.id);

                  setForm(kullanicidanForm(k));

                  setSifreDegisti(false);

                  setHata('');

                }}

              />

            </div>

          </div>

        )}

      </div>



      <SilmeOnayModal

        acik={silModalAcik}

        onKapat={() => setSilModalAcik(false)}

        onOnayla={() => void silOnayla()}

        baslik="Bu kullanıcıyı silmek istiyor musunuz?"

        hedefMetin={

          seciliKullanici

            ? `${seciliKullanici.ad} (${seciliKullanici.kullaniciKodu})`

            : 'Seçili kullanıcı'

        }

        ariaLabel="Kullanıcı silme onayı"

      />

    </AdminModulKabuk>

  );

}

