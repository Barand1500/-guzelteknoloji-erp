import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { FirmaDonemSecimForm } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/bilesenler/FirmaDonemSecimForm';
import type { FirmaDonemKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/tipler';
import {
  firmaDonemKaydiKaydet,
  firmaDonemKaydiOku,
  firmaDonemKayitEsit,
  firmaDonemSecimGecerli,
} from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitKopyala(k: FirmaDonemKayit): FirmaDonemKayit {
  return { ...k };
}

export function FirmaDonemSecimiSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<FirmaDonemKayit>(() => firmaDonemKaydiOku());
  const [taslak, setTaslak] = useState<FirmaDonemKayit>(() => kayitKopyala(firmaDonemKaydiOku()));
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const kirli = useMemo(() => !firmaDonemKayitEsit(kayit, taslak), [kayit, taslak]);

  const kaydet = useCallback(() => {
    if (!firmaDonemSecimGecerli(taslak)) {
      hataBildir('Tüm alanları seçmeniz gerekiyor.');
      return;
    }
    if (!kirli) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Bilgi');
      return;
    }

    setKaydediliyor(true);
    window.setTimeout(() => {
      firmaDonemKaydiKaydet(taslak);
      setKayit(kayitKopyala(taslak));
      setKaydediliyor(false);
      basariBildir('Firma / dönem seçimi kaydedildi.');
    }, 220);
  }, [taslak, kirli, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet },
    {
      kaydet: !kaydediliyor,
      ekle: false,
      guncelle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Firma/Dönem Seçimi"
      aciklama="Aktif firma, muhasebe dönemi ve operasyon birimlerini seçin"
      onizleGoster={false}
    >
      <AdminPanelKarti>
        <FirmaDonemSecimForm kayit={taslak} onKayitDegistir={setTaslak} />
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
