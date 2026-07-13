import { useState } from 'react';
import { cariAdimDogrula, cariFormDogrula } from '@/admin/baslat-menusu/erp/cari/alanKurallari';
import { cariOlustur } from '@/admin/baslat-menusu/erp/cari/api';
import {
  CariEbelgeAlanlari,
  CariTemelAlanlar,
  CariVergiIletisimAlanlari,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/cariFormAlanlari';
import { bosCariForm, type CariFormDegeri } from '@/admin/baslat-menusu/erp/cari/tipler';
import { TanimSihirbaz } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

interface CariKurulumSihirbaziProps {
  onTamamlandi: () => void;
  onIptal: () => void;
}

export function CariKurulumSihirbazi({ onTamamlandi, onIptal }: CariKurulumSihirbaziProps) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [form, setForm] = useState<CariFormDegeri>(bosCariForm);
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function kaydet() {
    const hata = cariFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      return;
    }
    const hedef = `«${form.cariAdi.trim()}» (${form.cariKodu.trim()}) cari kartını`;
    setKaydediliyor(true);
    try {
      await cariOlustur({ ...form, aktif: true });
      logMesajiAyarla(logMesaj.ekledi('Cari Kartlar', hedef));
      basariBildir('Cari kart eklendi.');
      onTamamlandi();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <TanimSihirbaz
      baslik="Yeni Cari Kart"
      aktifAdim={sihirbazAdim}
      onAdimDegistir={setSihirbazAdim}
      onIptal={onIptal}
      onTamamla={() => void kaydet()}
      adimDogrula={(adim) => cariAdimDogrula(adim, form)}
      onHata={hataBildir}
      tamamlaniyor={kaydediliyor}
      adimlar={[
        {
          baslik: 'Temel Bilgiler',
          aciklama: 'Cari tipi, kod ve unvan bilgilerini girin',
          icerik: <CariTemelAlanlar form={form} setForm={setForm} />,
        },
        {
          baslik: 'Vergi ve İletişim',
          aciklama: 'Vergi, adres ve iletişim bilgilerini girin',
          icerik: <CariVergiIletisimAlanlari form={form} setForm={setForm} />,
        },
        {
          baslik: 'E-Belge',
          aciklama: 'E-fatura ayarlarını belirleyin',
          icerik: <CariEbelgeAlanlari form={form} setForm={setForm} />,
        },
      ]}
    />
  );
}
