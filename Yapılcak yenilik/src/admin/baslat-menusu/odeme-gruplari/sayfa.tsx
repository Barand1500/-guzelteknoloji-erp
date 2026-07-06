import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { OdemeGrupTablosu } from '@/admin/baslat-menusu/odeme-gruplari/bilesenler/OdemeGrupTablosu';
import {
  odemeGruplariKayitKopyala,
  odemeGruplariKayitlariEsit,
  yeniOdemeGrupSatiri,
  type OdemeGrupAlan,
  type OdemeGruplariKayit,
} from '@/admin/baslat-menusu/odeme-gruplari/tipler';
import { odemeGruplariKaydet, odemeGruplariOku } from '@/admin/baslat-menusu/odeme-gruplari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function OdemeGruplariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();

  const [kayit, setKayit] = useState<OdemeGruplariKayit>(() => odemeGruplariOku());
  const [sonKayitli, setSonKayitli] = useState<OdemeGruplariKayit>(() => odemeGruplariOku());
  const [seciliId, setSeciliId] = useState<string | null>(() => odemeGruplariOku().satirlar[0]?.id ?? null);

  const kirli = useMemo(() => !odemeGruplariKayitlariEsit(kayit, sonKayitli), [kayit, sonKayitli]);

  const satirDegistir = useCallback((id: string, alan: OdemeGrupAlan, deger: string) => {
    setKayit((k) => ({
      satirlar: k.satirlar.map((s) => (s.id === id ? { ...s, [alan]: deger } : s)),
    }));
  }, []);

  const yeniSatir = useCallback(() => {
    const yeni = yeniOdemeGrupSatiri();
    setKayit((k) => ({ satirlar: [...k.satirlar, yeni] }));
    setSeciliId(yeni.id);
  }, []);

  const satirSil = useCallback(() => {
    if (!seciliId) return;
    setKayit((k) => {
      const yeni = k.satirlar.filter((s) => s.id !== seciliId);
      setSeciliId(yeni[0]?.id ?? null);
      return { satirlar: yeni };
    });
    basariBildir('Satır silindi.');
  }, [seciliId, basariBildir]);

  const kaydet = useCallback(() => {
    const dolu = kayit.satirlar.filter(
      (s) => s.odemeGrubu.trim() || s.odemeYontemi.trim() || s.uygulama.trim()
    );

    for (const s of dolu) {
      if (!s.odemeGrubu.trim() || !s.odemeYontemi.trim() || !s.uygulama.trim()) {
        hataBildir('Her satırda ödeme grubu, ödeme yöntemi ve uygulama dolu olmalıdır.');
        return;
      }
    }

    const temiz = { satirlar: dolu };
    odemeGruplariKaydet(temiz);
    setKayit(temiz);
    setSonKayitli(odemeGruplariKayitKopyala(temiz));
    if (seciliId && !temiz.satirlar.some((s) => s.id === seciliId)) {
      setSeciliId(temiz.satirlar[0]?.id ?? null);
    }
    basariBildir('Ödeme grubu tanımları kaydedildi.');
  }, [kayit, seciliId, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniSatir, sil: satirSil },
    {
      kaydet: kirli || kayit.satirlar.length >= 0,
      ekle: true,
      sil: seciliId != null,
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Ödeme Grupları"
      aciklama="Ödeme grubu, yöntem ve uygulama eşleştirmelerini tanımlayın"
      onizleGoster={false}
    >
      <div className="ap-odeme-gruplari-sayfa">
        <AdminPanelKarti
          baslik="Ödeme Grup Tanımları"
          altBaslik={
            kirli
              ? 'Kaydedilmemiş değişiklikler var — alt çubuktan Kaydet'
              : `${kayit.satirlar.length} tanım kayıtlı`
          }
        >
          <p className="ap-odeme-grup-aciklama ap-muted text-xs">
            Her satır bir ödeme grubunun hangi yöntemle ve hangi uygulamada kullanılacağını belirler.
            Alanlara yazarken önerilerden seçebilir veya kendi değerinizi girebilirsiniz.
          </p>

          <OdemeGrupTablosu
            satirlar={kayit.satirlar}
            seciliId={seciliId}
            onSatirSec={setSeciliId}
            onSatirDegistir={satirDegistir}
          />
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
