import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { SistemSekmeCubugu } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  PanelDilSekme,
  SistemBakimSekme,
  SistemGenelSekme,
} from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeleri';
import {
  Sistem404Sekme,
  SistemBilgiPaneli,
  SistemGuvenlikSekme,
} from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/Sistem404VeGuvenlik';
import { SistemScriptSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemScriptSekme';
import { SistemEklentiSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemEklentiSekme';
import {
  AdminModulKabuk,
  AdminPanelKarti,
  YukleniyorDurumu,
} from '@/admin/ortak/AdminBilesenleri';
import { adminSayfalariGetir, type AdminSayfa } from '@/admin/ortak/api/sayfaApi';
import { sistemAyarlariGetir, sistemAyarlariGuncelle } from '@/admin/baslat-menusu/sistem/ayarlar/api';
import { bosSistemForm, sistemdenForm, type SistemAyarlariForm, type SistemSekmeId } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { SagTikPaneliYonetimSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SagTikPaneliYonetimSekme';
import { sagTikAyarlariYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
import { siteVerisiGuncellendiYayinla } from '@/araclar/siteVerisiOlaylari';

export function SistemAyarlariSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { dilAyarla, cevirileriAyarla } = usePanelDil();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { aksiyonGeriBildirimiGoster } = useAdminAksiyon();
  const [form, setForm] = useState<SistemAyarlariForm>(bosSistemForm);
  const [sayfalar, setSayfalar] = useState<AdminSayfa[]>([]);
  const [siteAdi, setSiteAdi] = useState('');
  const [siteSlug, setSiteSlug] = useState('');
  const [surum, setSurum] = useState('');
  const [sekme, setSekme] = useState<SistemSekmeId>('genel');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [sonKayitliForm, setSonKayitliForm] = useState<SistemAyarlariForm>(bosSistemForm);

  const kirli = useMemo(() => JSON.stringify(form) !== JSON.stringify(sonKayitliForm), [form, sonKayitliForm]);

  const kaydet = useCallback(async () => {
    logMesajiAyarla(
      logMesaj.kaydetti('Sistem Ayarları', `«${SEKME_BASLIK[sekme]}» sekmesindeki ayarları`)
    );
    setKaydediliyor(true);
    try {
      const veri = await sistemAyarlariGuncelle(form);
      basariBildir('Sistem ayarları kaydedildi.');
      setSiteAdi(veri.site.ad);
      setSiteSlug(veri.site.slug);
      setSurum(veri.surum);
      const yeniForm = sistemdenForm(veri.site, veri.sistem);
      setForm(yeniForm);
      setSonKayitliForm(yeniForm);
      dilAyarla(yeniForm.panelDili);
      cevirileriAyarla(yeniForm.panelCeviriler);
      siteVerisiGuncellendiYayinla();
      sagTikAyarlariYayinla();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, dilAyarla, cevirileriAyarla, basariBildir, hataBildir, sekme, logMesajiAyarla]);

  const siteAktifToggle = useCallback(
    async (aktif: boolean) => {
      const onceki = form;
      const guncel = { ...form, siteAktif: aktif };
      setForm(guncel);

      setKaydediliyor(true);
      try {
        const veri = await sistemAyarlariGuncelle(guncel);
        basariBildir(aktif ? 'Site yayına alındı.' : 'Site kapatıldı. Ziyaretçiler erişemez.');
        aksiyonGeriBildirimiGoster('kaydet');
        setSiteAdi(veri.site.ad);
        setSiteSlug(veri.site.slug);
        setSurum(veri.surum);
        const yeniForm = sistemdenForm(veri.site, veri.sistem);
        setForm(yeniForm);
        dilAyarla(yeniForm.panelDili);
        cevirileriAyarla(yeniForm.panelCeviriler);
        siteVerisiGuncellendiYayinla();
        sagTikAyarlariYayinla();
      } catch (err) {
        setForm(onceki);
        hataBildir(err instanceof Error ? err.message : 'Site durumu güncellenemedi');
      } finally {
        setKaydediliyor(false);
      }
    },
    [form, dilAyarla, cevirileriAyarla, basariBildir, hataBildir, aksiyonGeriBildirimiGoster]
  );

  const bakimModuToggle = useCallback(async () => {
    const yeniBakim = !form.bakimModu;
    const guncel = { ...form, bakimModu: yeniBakim };
    setForm(guncel);
    if (yeniBakim) setSekme('bakim');

    setKaydediliyor(true);
    try {
      const veri = await sistemAyarlariGuncelle(guncel);
      basariBildir(yeniBakim ? 'Bakım modu açıldı.' : 'Bakım modu kapatıldı.');
      aksiyonGeriBildirimiGoster('kaydet');
      setSiteAdi(veri.site.ad);
      setSiteSlug(veri.site.slug);
      setSurum(veri.surum);
      const yeniForm = sistemdenForm(veri.site, veri.sistem);
      setForm(yeniForm);
      setSonKayitliForm(yeniForm);
      dilAyarla(yeniForm.panelDili);
      cevirileriAyarla(yeniForm.panelCeviriler);
      siteVerisiGuncellendiYayinla();
      sagTikAyarlariYayinla();
    } catch (err) {
      setForm(form);
      hataBildir(err instanceof Error ? err.message : 'Bakım modu güncellenemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, dilAyarla, cevirileriAyarla, basariBildir, hataBildir, aksiyonGeriBildirimiGoster]);

  useEffect(() => {
    void (async () => {
      try {
        const [veri, sayfaListesi] = await Promise.all([
          sistemAyarlariGetir(),
          adminSayfalariGetir().catch(() => [] as AdminSayfa[]),
        ]);
        setSayfalar(sayfaListesi);
        setSiteAdi(veri.site.ad);
        setSiteSlug(veri.site.slug);
        setSurum(veri.surum);
        const yuklenen = sistemdenForm(veri.site, veri.sistem);
        setForm(yuklenen);
        setSonKayitliForm(yuklenen);
        dilAyarla(yuklenen.panelDili);
        cevirileriAyarla(yuklenen.panelCeviriler);
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Ayarlar alınamadı');
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [dilAyarla, cevirileriAyarla, hataBildir]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli && !kaydediliyor }, kirli);

  if (yukleniyor) return <YukleniyorDurumu mesaj="Sistem ayarları yükleniyor..." />;

  return (
    <AdminModulKabuk baslik="Sistem Ayarları" aciklama={`${siteAdi} — site durumu, bakım, 404 ve panel tercihleri`}>

      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <SistemSekmeCubugu aktif={sekme} onDegistir={setSekme} />
            <div className="mt-4">
              <SistemBilgiPaneli
                siteSlug={siteSlug}
                surum={surum}
                siteAdi={siteAdi}
                form={form}
                onBakimToggle={bakimModuToggle}
                bakimIslemYukleniyor={kaydediliyor}
              />
            </div>
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti
              baslik={SEKME_BASLIK[sekme]}
              altBaslik={SEKME_ALT[sekme]}
            >
              {sekme === 'genel' && (
                <SistemGenelSekme
                  form={form}
                  onChange={setForm}
                  onSiteAktifDegis={siteAktifToggle}
                  siteAktifIslemde={kaydediliyor}
                />
              )}
              {sekme === 'bakim' && <SistemBakimSekme form={form} onChange={setForm} siteAdi={siteAdi} />}
              {sekme === 'sayfa404' && <Sistem404Sekme form={form} sayfalar={sayfalar} onChange={setForm} />}
              {sekme === 'dil' && <PanelDilSekme form={form} onChange={setForm} />}
              {sekme === 'guvenlik' && <SistemGuvenlikSekme form={form} onChange={setForm} />}
              {sekme === 'script' && <SistemScriptSekme form={form} onChange={setForm} />}
              {sekme === 'eklentiler' && <SistemEklentiSekme />}
              {sekme === 'sagTik' && <SagTikPaneliYonetimSekme form={form} onChange={setForm} />}
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}

const SEKME_BASLIK: Record<SistemSekmeId, string> = {
  genel: 'Genel Ayarlar',
  bakim: 'Bakım Modu',
  sayfa404: '404 Sayfası',
  dil: 'Panel Dili & Çeviriler',
  guvenlik: 'Güvenlik',
  script: 'Script Ayarları',
  eklentiler: 'Eklentiler',
  sagTik: 'Sağ Tık Paneli',
};

const SEKME_ALT: Record<SistemSekmeId, string> = {
  genel: 'Yayın durumu ve domain',
  bakim: 'Bakım ekranı ve görsel',
  sayfa404: 'Menü ve içerik yapılandırması',
  dil: 'JSON çeviri editörü',
  guvenlik: 'HTTP güvenlik başlıkları ve arama motoru ayarları',
  script: 'Google Analytics ve özel script kodları',
  eklentiler: 'Site eklentilerini kur, etkinleştir veya kaldır',
  sagTik: 'Admin panel sağ tık menüsü öğeleri ve modül listesi',
};