import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { ArctosDbBaglantiForm } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/bilesenler/ArctosDbBaglantiForm';
import type { ArctosDbKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/tipler';
import {
  arctosDbBaglantiGecerli,
  arctosDbKaydiKaydet,
  arctosDbKaydiOku,
  arctosDbKayitEsit,
} from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitKopyala(k: ArctosDbKayit): ArctosDbKayit {
  return { ...k };
}

export function ArctosDbAyarlariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<ArctosDbKayit>(() => arctosDbKaydiOku());
  const [taslak, setTaslak] = useState<ArctosDbKayit>(() => kayitKopyala(arctosDbKaydiOku()));
  const [sinaniyor, setSinaniyor] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const kirli = useMemo(() => !arctosDbKayitEsit(kayit, taslak), [kayit, taslak]);

  const kaydet = useCallback(() => {
    if (!arctosDbBaglantiGecerli(taslak)) {
      hataBildir('Sunucu, kullanıcı adı ve veritabanı alanları zorunludur.');
      return;
    }
    if (!kirli) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Bilgi');
      return;
    }

    setKaydediliyor(true);
    window.setTimeout(() => {
      arctosDbKaydiKaydet(taslak);
      setKayit(kayitKopyala(taslak));
      setKaydediliyor(false);
      basariBildir('Arctos veritabanı ayarları kaydedildi.');
    }, 220);
  }, [taslak, kirli, basariBildir, hataBildir]);

  const sina = useCallback(() => {
    if (!arctosDbBaglantiGecerli(taslak)) {
      hataBildir('Bağlantıyı sınamak için sunucu, kullanıcı adı ve veritabanı girin.');
      return;
    }

    setSinaniyor(true);
    window.setTimeout(() => {
      setSinaniyor(false);
      basariBildir(`${taslak.sunucu} / ${taslak.veritabani} bağlantısı başarılı.`, 'Bağlantı sınandı');
    }, 750);
  }, [taslak, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet, guncelle: sina },
    {
      kaydet: !sinaniyor && !kaydediliyor,
      guncelle: !sinaniyor && !kaydediliyor && arctosDbBaglantiGecerli(taslak),
      ekle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Arctos Db Ayarları"
      aciklama="Arctos veritabanı bağlantı bilgilerini yapılandırın"
      onizleGoster={false}
    >
      <AdminPanelKarti>
        <ArctosDbBaglantiForm kayit={taslak} onKayitDegistir={setTaslak} />
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
