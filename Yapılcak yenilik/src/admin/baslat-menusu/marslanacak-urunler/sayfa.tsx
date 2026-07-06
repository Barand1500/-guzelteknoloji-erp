import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { MarslanacakUrunTablo } from '@/admin/baslat-menusu/marslanacak-urunler/bilesenler/MarslanacakUrunTablo';
import type { MarslanacakUrunKayit } from '@/admin/baslat-menusu/marslanacak-urunler/tipler';
import {
  marslanacakDegisimOzeti,
  marslanacakKaydiKaydet,
  marslanacakKaydiOku,
  marslanacakKayitEsit,
} from '@/admin/baslat-menusu/marslanacak-urunler/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitKopyala(k: MarslanacakUrunKayit): MarslanacakUrunKayit {
  return JSON.parse(JSON.stringify(k)) as MarslanacakUrunKayit;
}

export function MarslanacakUrunlerSayfa() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<MarslanacakUrunKayit>(() => marslanacakKaydiOku());
  const [taslak, setTaslak] = useState<MarslanacakUrunKayit>(() => kayitKopyala(marslanacakKaydiOku()));

  const kirli = useMemo(() => !marslanacakKayitEsit(kayit, taslak), [kayit, taslak]);

  const urunDegistir = useCallback((id: string, marslanmayacak: boolean) => {
    setTaslak((onceki) => ({
      urunler: onceki.urunler.map((u) => (u.id === id ? { ...u, marslanmayacak } : u)),
    }));
  }, []);

  const tumunuDegistir = useCallback((marslanmayacak: boolean) => {
    setTaslak((onceki) => ({
      urunler: onceki.urunler.map((u) => ({ ...u, marslanmayacak })),
    }));
  }, []);

  const kaydet = useCallback(() => {
    if (!kirli) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Bilgi');
      return;
    }
    const ozet = marslanacakDegisimOzeti(kayit, taslak);
    marslanacakKaydiKaydet(taslak);
    setKayit(kayitKopyala(taslak));
    basariBildir(ozet, 'Marş ayarları kaydedildi');
  }, [kirli, kayit, taslak, basariBildir]);

  useModulAksiyonlari(
    { kaydet },
    {
      kaydet: kirli,
      ekle: false,
      guncelle: false,
      sil: false,
      yayinla: false,
      onizle: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Marşlanacak Ürünler"
      aciklama="Otomatik marşlanmayacak ürün tanımları"
      onizleGoster={false}
    >
      <AdminPanelKarti>
        <section className="ap-marslanacak-modul">
          <h2 className="ap-tanimlar-hesap-pusula-baslik">Otomatik Marşlanmayacak Ürünler</h2>
          <p className="ap-marslanacak-aciklama">
            İşaretlenen ürünler mutfak marş sistemine otomatik gönderilmez.
          </p>
          <MarslanacakUrunTablo urunler={taslak.urunler} onUrunDegistir={urunDegistir} onTumunuDegistir={tumunuDegistir} />
        </section>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
