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
  SistemGuvenlikSekme,
} from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/Sistem404VeGuvenlik';
import { SistemScriptSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemScriptSekme';
import { SistemEklentiSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemEklentiSekme';
import { AdminModulKabuk, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { adminSayfalariGetir, type AdminSayfa } from '@/admin/ortak/api/sayfaApi';
import { sistemAyarlariGetir, sistemAyarlariGuncelle } from '@/admin/baslat-menusu/sistem/ayarlar/api';
import {
  bosSistemForm,
  sistemdenForm,
  SEKME_BASLIK,
  SISTEM_SEKMELER,
  type SistemAyarlariForm,
  type SistemSekmeId,
} from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { kenarlikAyariNormalize, kenarlikRenkYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/kenarlikRenkYardimci';
import { SagTikPaneliYonetimSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SagTikPaneliYonetimSekme';
import { sagTikAyarlariYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
import { varsayilanAyarlarYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';
import { panelGorunumYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/panelGorunum';
import { SistemGorunumSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemGorunumSekme';
import { siteVerisiGuncellendiYayinla } from '@/araclar/siteVerisiOlaylari';
import './ayarlar.css';

function SekmeIcerik({
  sekme,
  form,
  onChange,
  sayfalar,
  siteAdi,
  onSiteAktifDegis,
  siteAktifIslemde,
}: {
  sekme: SistemSekmeId;
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
  sayfalar: AdminSayfa[];
  siteAdi: string;
  onSiteAktifDegis: (aktif: boolean) => void;
  siteAktifIslemde: boolean;
}) {
  switch (sekme) {
    case 'genel':
      return (
        <SistemGenelSekme
          form={form}
          onChange={onChange}
          onSiteAktifDegis={onSiteAktifDegis}
          siteAktifIslemde={siteAktifIslemde}
        />
      );
    case 'gorunum':
      return <SistemGorunumSekme form={form} onChange={onChange} />;
    case 'bakim':
      return <SistemBakimSekme form={form} onChange={onChange} siteAdi={siteAdi} />;
    case 'sayfa404':
      return <Sistem404Sekme form={form} sayfalar={sayfalar} onChange={onChange} />;
    case 'dil':
      return <PanelDilSekme form={form} onChange={onChange} />;
    case 'guvenlik':
      return <SistemGuvenlikSekme form={form} onChange={onChange} />;
    case 'script':
      return <SistemScriptSekme form={form} onChange={onChange} />;
    case 'eklentiler':
      return <SistemEklentiSekme />;
    case 'sagTik':
      return <SagTikPaneliYonetimSekme form={form} onChange={onChange} />;
  }
}

export function SistemAyarlariSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { dilAyarla, cevirileriAyarla } = usePanelDil();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { aksiyonGeriBildirimiGoster } = useAdminAksiyon();
  const [form, setForm] = useState<SistemAyarlariForm>(bosSistemForm);
  const [sayfalar, setSayfalar] = useState<AdminSayfa[]>([]);
  const [siteAdi, setSiteAdi] = useState('');
  const [sekme, setSekme] = useState<SistemSekmeId>('genel');
  const [sekmeYonu, setSekmeYonu] = useState<'ileri' | 'geri'>('ileri');
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
      const yeniForm = sistemdenForm(veri.site, veri.sistem);
      setForm(yeniForm);
      setSonKayitliForm(yeniForm);
      kenarlikRenkYayinla(
        kenarlikAyariNormalize({ renk: yeniForm.kenarlikRenk, neon: yeniForm.kenarlikNeon })
      );
      dilAyarla(yeniForm.panelDili);
      cevirileriAyarla(yeniForm.panelCeviriler);
      siteVerisiGuncellendiYayinla();
      sagTikAyarlariYayinla();
      varsayilanAyarlarYayinla(yeniForm.varsayilanAyarlar);
      panelGorunumYayinla(yeniForm.panelGorunum);
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
        const yeniForm = sistemdenForm(veri.site, veri.sistem);
        setForm(yeniForm);
        dilAyarla(yeniForm.panelDili);
        cevirileriAyarla(yeniForm.panelCeviriler);
        siteVerisiGuncellendiYayinla();
        sagTikAyarlariYayinla();
        varsayilanAyarlarYayinla(yeniForm.varsayilanAyarlar);
      panelGorunumYayinla(yeniForm.panelGorunum);
      } catch (err) {
        setForm(onceki);
        hataBildir(err instanceof Error ? err.message : 'Site durumu güncellenemedi');
      } finally {
        setKaydediliyor(false);
      }
    },
    [form, dilAyarla, cevirileriAyarla, basariBildir, hataBildir, aksiyonGeriBildirimiGoster]
  );

  useEffect(() => {
    void (async () => {
      try {
        const [veri, sayfaListesi] = await Promise.all([
          sistemAyarlariGetir(),
          adminSayfalariGetir().catch(() => [] as AdminSayfa[]),
        ]);
        setSayfalar(sayfaListesi);
        setSiteAdi(veri.site.ad);
        const yuklenen = sistemdenForm(veri.site, veri.sistem);
        setForm(yuklenen);
        setSonKayitliForm(yuklenen);
        kenarlikRenkYayinla(
          kenarlikAyariNormalize({ renk: yuklenen.kenarlikRenk, neon: yuklenen.kenarlikNeon })
        );
        dilAyarla(yuklenen.panelDili);
        cevirileriAyarla(yuklenen.panelCeviriler);
        varsayilanAyarlarYayinla(yuklenen.varsayilanAyarlar);
        panelGorunumYayinla(yuklenen.panelGorunum);
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Ayarlar alınamadı');
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [dilAyarla, cevirileriAyarla, hataBildir]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli && !kaydediliyor }, kirli);

  const sekmeDegistir = useCallback((yeni: SistemSekmeId) => {
    if (yeni === sekme) return;
    const eskiIdx = SISTEM_SEKMELER.findIndex((s) => s.id === sekme);
    const yeniIdx = SISTEM_SEKMELER.findIndex((s) => s.id === yeni);
    if (eskiIdx >= 0 && yeniIdx >= 0) {
      setSekmeYonu(yeniIdx > eskiIdx ? 'ileri' : 'geri');
    }
    setSekme(yeni);
  }, [sekme]);

  const aktifSekme = SISTEM_SEKMELER.find((s) => s.id === sekme);

  if (yukleniyor) return <YukleniyorDurumu mesaj="Sistem ayarları yükleniyor..." />;

  return (
    <AdminModulKabuk
      baslik="Sistem Ayarları"
      aciklama="Site, güvenlik, dil ve panel davranış ayarlarını buradan yönetirsiniz."
      ustAksiyon={<SistemSekmeCubugu aktif={sekme} onDegistir={sekmeDegistir} />}
    >
      <div className="ap-ayarlar-sayfa">
        <div className={`ap-ayarlar-icerik ap-ayarlar-icerik--${sekmeYonu}`} key={sekme}>
          <div className="ap-ayarlar-panel">
            <div className="ap-ayarlar-panel-baslik">
              <div className="ap-ayarlar-ust-metin" key={`baslik-${sekme}`}>
                <span className="ap-ayarlar-ust-ikon" aria-hidden>
                  {aktifSekme?.ikon}
                </span>
                <div>
                  <h2 className="ap-ayarlar-ust-baslik">{SEKME_BASLIK[sekme]}</h2>
                  <p className="ap-ayarlar-ust-aciklama">
                    {sekme === 'genel' && 'Site durumu, domain ve log saklama'}
                    {sekme === 'gorunum' && 'Panel sürümü, tema ve varsayılan davranışlar'}
                    {sekme === 'bakim' && 'Ziyaretçilere gösterilecek bakım ekranı ve erişim kuralları'}
                    {sekme === 'sayfa404' && 'Bulunamayan sayfa görünümü ve yönlendirme'}
                    {sekme === 'dil' && 'Admin panel dili ve çeviri dosyaları'}
                    {sekme === 'guvenlik' && 'Oturum, erişim ve güvenlik politikaları'}
                    {sekme === 'script' && 'Head ve body script enjeksiyonları'}
                    {sekme === 'eklentiler' && 'Katalog eklentileri kurulum ve yönetim'}
                    {sekme === 'sagTik' && 'Sağ tık menüsü öğeleri ve davranışı'}
                  </p>
                </div>
              </div>
            </div>
            <div className="ap-ayarlar-panel-govde ap-ayarlar-govde">
              <SekmeIcerik
                sekme={sekme}
                form={form}
                onChange={setForm}
                sayfalar={sayfalar}
                siteAdi={siteAdi}
                onSiteAktifDegis={siteAktifToggle}
                siteAktifIslemde={kaydediliyor}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
