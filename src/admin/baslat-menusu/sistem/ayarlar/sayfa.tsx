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
  SEKME_ALT,
  SEKME_BASLIK,
  type SistemAyarlariForm,
  type SistemSekmeId,
} from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { kenarlikAyariNormalize, kenarlikRenkYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/kenarlikRenkYardimci';
import { SagTikPaneliYonetimSekme } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SagTikPaneliYonetimSekme';
import { sagTikAyarlariYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
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
    <AdminModulKabuk baslik="Sistem Ayarları">
      <div className="ap-ayarlar-sayfa">
        <header className="ap-ayarlar-ust">
          <SistemSekmeCubugu aktif={sekme} onDegistir={setSekme} />
          <div className="ap-ayarlar-ust-metin" key={sekme}>
            <h2 className="ap-ayarlar-ust-baslik">{SEKME_BASLIK[sekme]}</h2>
            <p className="ap-ayarlar-ust-aciklama">{SEKME_ALT[sekme]}</p>
          </div>
        </header>

        <div className="ap-ayarlar-icerik" key={sekme}>
          <div className="ap-ayarlar-panel">
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
