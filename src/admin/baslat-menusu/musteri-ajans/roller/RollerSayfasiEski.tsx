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
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  adminRolleriGetir,
  adminRolleriKaydet,
  baslikdanKodUret,
  modulYetkiListesi,
  rollerTemizle,
  type ModulTanimi,
  type RolTanimi,
  type YetkiKodu,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import { RolModulCubugu } from '@/admin/baslat-menusu/musteri-ajans/roller/bilesenler/RolModulCubugu';
import {
  bosRolSablonu,
  rolModulListesi,
  rolModulYetkiToggle,
  rollerEsitMi,
} from '@/admin/baslat-menusu/musteri-ajans/roller/rolYardimci';

export function RollerSayfasiEski() {
  const logMesajiAyarla = useAdminLogMesaji();
  const [taslakRoller, setTaslakRoller] = useState<RolTanimi[]>([]);
  const [kayitliRoller, setKayitliRoller] = useState<RolTanimi[]>([]);
  const [moduller, setModuller] = useState<ModulTanimi[]>([]);
  const [aktifModulPrefix, setAktifModulPrefix] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [ekleModalAcik, setEkleModalAcik] = useState(false);
  const [duzenleRol, setDuzenleRol] = useState<RolTanimi | null>(null);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliRolKod, setSeciliRolKod] = useState<string | null>(null);
  const kayitliRef = useRef<RolTanimi[]>([]);

  const { kullaniciModuluErisimiVar } = useYetkiler();
  const yetkili = kullaniciModuluErisimiVar;
  const duzenlenebilir = kullaniciModuluErisimiVar;
  const aktifModul =
    moduller.find((m) => m.prefix === aktifModulPrefix) ?? moduller[0] ?? null;
  const yetkiTanimlari = aktifModul ? modulYetkiListesi(aktifModul.prefix) : [];
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
      const liste = rolModulListesi(veri.moduller);
      const prefixler = liste.map((m) => m.prefix);
      const temiz = rollerTemizle(veri.roller, prefixler);
      setModuller(liste);
      setAktifModulPrefix((onceki) => onceki || liste[0]?.prefix || '');
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

  const yetkiToggle = useCallback((rolKod: string, modulPrefix: string, yetkiKod: YetkiKodu) => {
    setTaslakRoller((onceki) =>
      onceki.map((rol) => {
        if (rol.kod !== rolKod || korunmusRolMu(rol.kod)) return rol;
        return rolModulYetkiToggle(rol, modulPrefix, yetkiKod);
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
          ...bosRolSablonu(kod),
          baslik: deger.baslik,
          aciklama: deger.aciklama,
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
      const veri = await adminRolleriKaydet(rollerTemizle(taslakRoller, moduller.map((m) => m.prefix)));
      const temiz = rollerTemizle(veri.roller, moduller.map((m) => m.prefix));
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
      <YetkisizErisim aciklama="Rol ve yetki yönetimine yalnızca Süper Admin veya Kullanıcı Yönetimi yetkisine sahip kullanıcılar erişebilir." />
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
              Sayfa Seçimi
            </h2>
            <RolModulCubugu
              moduller={moduller}
              aktif={aktifModul?.prefix ?? ''}
              onDegistir={setAktifModulPrefix}
            />
          </section>

          {aktifModul ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Yetki Matrisi — {aktifModul.ad}
              </h2>
              <RolMatrisi
                roller={taslakRoller}
                yetkiler={yetkiTanimlari}
                aktifModul={aktifModul}
                duzenlenebilir={duzenlenebilir}
                onYetkiToggle={yetkiToggle}
              />
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Rol Tanımları
            </h2>
            <RolKartlari
              roller={taslakRoller}
              moduller={moduller}
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
