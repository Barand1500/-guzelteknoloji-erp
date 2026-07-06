import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { WebApiAyarlariForm } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/bilesenler/WebApiAyarlariForm';
import type { WebApiKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/tipler';
import {
  webApiKaydiKaydet,
  webApiKaydiOku,
  webApiKayitEsit,
  webApiKayitGecerli,
} from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitKopyala(k: WebApiKayit): WebApiKayit {
  return { ...k };
}

export function WebApiAyarlariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<WebApiKayit>(() => webApiKaydiOku());
  const [taslak, setTaslak] = useState<WebApiKayit>(() => kayitKopyala(webApiKaydiOku()));
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [servisBaslatiliyor, setServisBaslatiliyor] = useState(false);

  const kirli = useMemo(() => !webApiKayitEsit(kayit, taslak), [kayit, taslak]);

  const kaydetVeBaslat = useCallback(() => {
    if (!webApiKayitGecerli(taslak)) {
      hataBildir('Sunucu IP, veritabanı adı, Token URL ve Servis URL zorunludur.');
      return;
    }

    setKaydediliyor(true);
    window.setTimeout(() => {
      webApiKaydiKaydet(taslak);
      setKayit(kayitKopyala(taslak));
      setKaydediliyor(false);
      setServisBaslatiliyor(true);

      window.setTimeout(() => {
        setServisBaslatiliyor(false);
        basariBildir('Web API ayarları kaydedildi ve servis başlatıldı.', 'Servis aktif');
      }, 900);
    }, 280);
  }, [taslak, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet: kaydetVeBaslat },
    {
      kaydet: !kaydediliyor && !servisBaslatiliyor,
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
      baslik="Web Api Ayarları"
      aciklama="Web API servis bağlantısı ve entegrasyon seçenekleri"
      onizleGoster={false}
    >
      <AdminPanelKarti>
        <WebApiAyarlariForm kayit={taslak} onKayitDegistir={setTaslak} />
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
