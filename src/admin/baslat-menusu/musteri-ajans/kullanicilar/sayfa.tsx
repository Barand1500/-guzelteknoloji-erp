import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KullaniciDuzenleFormu,
  KullaniciListesi,
  type AtanabilirRol,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useAuth } from '@/baglamlar/AuthContext';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { panelRolYoneticisiMi } from '@/admin/ortak/panelRolYardimci';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { adminRolleriGetir } from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import {
  adminKullaniciGuncelle,
  adminKullaniciOlustur,
  adminKullaniciSil,
  adminKullanicilariGetir,
  VARSAYILAN_ROL_ETIKETLERI,
  type AdminKullanici,
  type KullaniciFormDegeri,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';

const bosForm: KullaniciFormDegeri = {
  email: '',
  ad: '',
  sifre: '',
  rol: 'MUSTERI_ADMIN',
  aktif: true,
};

function kullanicidanForm(k: AdminKullanici): KullaniciFormDegeri {
  return {
    email: k.email,
    ad: k.ad,
    sifre: '',
    rol: k.rol,
    aktif: k.aktif,
  };
}

export function KullanicilarSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { kullanici: oturum } = useAuth();
  const { kullaniciYonetimiVar } = useYetkiler();
  const [kullanicilar, setKullanicilar] = useState<AdminKullanici[]>([]);
  const [form, setForm] = useState<KullaniciFormDegeri>(bosForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [sifreDegisti, setSifreDegisti] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [tumRoller, setTumRoller] = useState<AtanabilirRol[]>([]);
  const [rolBasliklari, setRolBasliklari] = useState<Record<string, string>>(VARSAYILAN_ROL_ETIKETLERI);

  const yetkili = kullaniciYonetimiVar;

  const atanabilirRoller = tumRoller.filter((r) => {
    if (panelRolYoneticisiMi(oturum?.rol)) return true;
    return r.kod !== 'SUPER_ADMIN' && r.kod !== 'AJANS_ADMIN' && r.kod !== 'YONETICI';
  });

  async function yukle() {
    setYukleniyor(true);
    setHata('');
    try {
      const [liste, rolVeri] = await Promise.all([adminKullanicilariGetir(), adminRolleriGetir()]);
      setKullanicilar(liste);
      const roller = rolVeri.roller.map((r) => ({ kod: r.kod, baslik: r.baslik }));
      setTumRoller(roller);
      setRolBasliklari(Object.fromEntries(rolVeri.roller.map((r) => [r.kod, r.baslik])));
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

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    const varsayilanRol = atanabilirRoller[0]?.kod ?? 'MUSTERI_ADMIN';
    setForm({ ...bosForm, rol: varsayilanRol });
    setSifreDegisti(false);
  }, [atanabilirRoller]);

  const kaydet = useCallback(async () => {
    if (!form.ad.trim() || !form.email.trim()) {
      setHata('Ad ve E-Posta zorunludur');
      return;
    }
    const hedef = `«${form.ad.trim()}» (${form.email.trim()}) kullanıcısını`;
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
          logMesaj.sildi('Kullanıcılar', `«${silinen.ad}» (${silinen.email}) kullanıcısını`)
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

  const seciliKullanici = useMemo(
    () => (seciliId ? kullanicilar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kullanicilar]
  );

  const kirli = useMemo(() => {
    if (seciliKullanici) {
      const kayitli = kullanicidanForm(seciliKullanici);
      return (
        sifreDegisti ||
        form.email !== kayitli.email ||
        form.ad !== kayitli.ad ||
        form.rol !== kayitli.rol ||
        form.aktif !== kayitli.aktif
      );
    }
    return form.email.trim() !== '' || form.ad.trim() !== '' || form.sifre.trim() !== '';
  }, [seciliKullanici, form, sifreDegisti]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet: kirli && !kaydediliyor,
      ekle: true,
      sil: !!seciliId && !kaydediliyor,
    },
    kirli
  );

  if (!yetkili) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-xl font-bold text-white">Yetkisiz Erişim</h1>
        <p className="mt-2 text-sm text-slate-400">
          Kullanıcı yönetimi için Kullanıcı Yönetimi yetkisi gerekir.
        </p>
      </div>
    );
  }

  return (
    <div className="ap-kullanicilar-sayfa">
      <div className="ap-kullanicilar-sayfa-ust">
        <h1 className="text-xl font-bold text-white">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Panel kullanıcılarını oluşturun, rollerini atayın ve erişimlerini yönetin.
        </p>
        {hata && <p className="mt-4 text-sm text-red-400">{hata}</p>}
        {kaydediliyor && <p className="mt-4 text-sm text-slate-400">İşlem yapılıyor...</p>}
      </div>

      {yukleniyor ? (
        <p className="mt-6 text-sm text-slate-400">Yükleniyor...</p>
      ) : (
        <div className="ap-kullanicilar-sayfa-govde">
          <div className="ap-kullanicilar-sayfa-grid">
            <KullaniciListesi
              kullanicilar={kullanicilar}
              seciliId={seciliId}
              rolBasliklari={rolBasliklari}
              onSec={(k) => {
                setSeciliId(k.id);
                setForm(kullanicidanForm(k));
                setSifreDegisti(false);
              }}
            />
            <KullaniciDuzenleFormu
              form={form}
              seciliId={seciliId}
              atanabilirRoller={atanabilirRoller}
              onSifreDegisti={setSifreDegisti}
              onChange={setForm}
            />
          </div>
        </div>
      )}

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu kullanıcıyı silmek istiyor musunuz?"
        hedefMetin={
          seciliKullanici
            ? `${seciliKullanici.ad} (${seciliKullanici.email})`
            : 'Seçili kullanıcı'
        }
        ariaLabel="Kullanıcı silme onayı"
      />
    </div>
  );
}
