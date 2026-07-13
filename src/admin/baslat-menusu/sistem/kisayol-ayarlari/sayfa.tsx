import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { AdminModulKabuk, AdminPanelKarti, BildirimKutusu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { kisayolAyarlariGetir, kisayolAyarlariGuncelle, kullaniciAyarlariVeritabaniModuMu } from '@/admin/baslat-menusu/sistem/kullanici-ayarlari/api';
import {
  KISAYOL_ISLEMLERI,
  kisayolAyarlariBellegeYaz,
  kisayolAyarlariOku,
  kisayolCakismaBul,
  tusKombinasyonuYakala,
  varsayilanKisayollar,
  type KisayolHaritasi,
  type KisayolIslemId,
} from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import { useAuth } from '@/baglamlar/AuthContext';

export function KisayolAyarlariSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { kullanici, yukleniyor: authYukleniyor } = useAuth();
  const [harita, setHarita] = useState<KisayolHaritasi>(() => kisayolAyarlariOku());
  const [sonKayitli, setSonKayitli] = useState<KisayolHaritasi>(() => kisayolAyarlariOku());
  const [dinlenen, setDinlenen] = useState<KisayolIslemId | null>(null);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const kirli = useMemo(() => JSON.stringify(harita) !== JSON.stringify(sonKayitli), [harita, sonKayitli]);

  const sunucudanYukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await kisayolAyarlariGetir();
      kisayolAyarlariBellegeYaz(veri.harita ?? {});
      const guncel = kisayolAyarlariOku();
      setHarita(guncel);
      setSonKayitli(guncel);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kısayol ayarları yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (authYukleniyor || !kullanici) return;
    void sunucudanYukle();
  }, [authYukleniyor, kullanici, sunucudanYukle]);

  useEffect(() => {
    function bellekGuncellendi() {
      const guncel = kisayolAyarlariOku();
      setHarita(guncel);
      setSonKayitli(guncel);
    }
    window.addEventListener('ap-kisayol-ayarlari-guncellendi', bellekGuncellendi);
    return () => window.removeEventListener('ap-kisayol-ayarlari-guncellendi', bellekGuncellendi);
  }, []);

  const kaydet = useCallback(async () => {
    setHata('');
    setBasari('');
    for (const islem of KISAYOL_ISLEMLERI) {
      const cakisma = kisayolCakismaBul(harita, islem.id, harita[islem.id]);
      if (cakisma) {
        setHata(
          `"${harita[islem.id]}" kombinasyonu hem ${islem.etiket} hem ${KISAYOL_ISLEMLERI.find((k) => k.id === cakisma)?.etiket} için atanmış.`
        );
        return;
      }
    }
    setKaydediliyor(true);
    try {
      const yanit = await kisayolAyarlariGuncelle(harita);
      const kayitli = yanit.harita;
      setHarita(kayitli);
      setSonKayitli(kayitli);
      const ozet = KISAYOL_ISLEMLERI.map((i) => `${i.etiket}: ${kayitli[i.id]}`).join(', ');
      logMesajiAyarla(logMesaj.kaydetti('Kısayol Ayarları', `klavye kısayollarını (${ozet})`));
      setBasari(
        kullaniciAyarlariVeritabaniModuMu()
          ? 'Kısayol ayarları veritabanına kaydedildi.'
          : 'Kısayol ayarları kaydedildi (oturum belleği).'
      );
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [harita, logMesajiAyarla]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli && !kaydediliyor }, kirli && !kaydediliyor);

  useEffect(() => {
    if (!dinlenen) return;
    function tusDinle(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      const komb = tusKombinasyonuYakala(e);
      if (!komb || ['Ctrl', 'Alt', 'Shift'].includes(komb)) return;
      const islem = dinlenen;
      if (!islem) return;
      const cakisma = kisayolCakismaBul(harita, islem, komb);
      if (cakisma) {
        setHata(`Bu kombinasyon zaten "${KISAYOL_ISLEMLERI.find((k) => k.id === cakisma)?.etiket}" için kullanılıyor.`);
        setDinlenen(null);
        return;
      }
      setHarita((h) => ({ ...h, [islem]: komb }));
      setDinlenen(null);
      setHata('');
      setBasari(`"${KISAYOL_ISLEMLERI.find((k) => k.id === islem)?.etiket}" kısayolu güncellendi. Kaydet ile veritabanına yazın.`);
    }
    window.addEventListener('keydown', tusDinle, true);
    return () => window.removeEventListener('keydown', tusDinle, true);
  }, [dinlenen, harita]);

  if (yukleniyor || authYukleniyor) {
    return (
      <AdminModulKabuk baslik="Kısayol Ayarları" aciklama="Panel kısayollarını özelleştirin." onizleGoster={false}>
        <YukleniyorDurumu />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk baslik="Kısayol Ayarları" aciklama="Panel kısayollarını özelleştirin." onizleGoster={false}>
      {hata && <BildirimKutusu mesaj={hata} tur="hata" />}
      {basari && <BildirimKutusu mesaj={basari} tur="basari" />}

      <AdminPanelKarti baslik="Klavye Kısayolları" altBaslik="Tuş dinle ile yeni kombinasyon atayın">
        <p className="ap-muted mb-3 text-xs">
          {kullaniciAyarlariVeritabaniModuMu()
            ? 'Ayarlar oturum açtığınız kullanıcı için veritabanına kaydedilir.'
            : 'Geliştirme modu: ayarlar yalnızca oturum belleğinde tutulur (sayfa yenilenince sıfırlanır).'}
        </p>
        <div className="space-y-3">
          {KISAYOL_ISLEMLERI.map((islem) => (
            <div
              key={islem.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--ap-border)] p-3"
            >
              <div>
                <p className="ap-heading text-sm font-medium">{islem.etiket}</p>
                <p className="ap-muted text-xs">{islem.aciklama}</p>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-[var(--ap-border)] bg-[var(--ap-input-bg)] px-2 py-1 font-mono text-xs">
                  {harita[islem.id]}
                </kbd>
                <button
                  type="button"
                  onClick={() => {
                    setDinlenen(islem.id);
                    setHata('');
                    setBasari('');
                  }}
                  className={`rounded px-2 py-1 text-xs ${
                    dinlenen === islem.id
                      ? 'bg-amber-600 text-white'
                      : 'border border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                  }`}
                >
                  {dinlenen === islem.id ? 'Tuşa basın...' : 'Tuş dinle'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setHarita(varsayilanKisayollar());
            setBasari('');
            setHata('');
          }}
          className="mt-4 text-xs text-blue-400 hover:underline"
        >
          Varsayılana sıfırla
        </button>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
