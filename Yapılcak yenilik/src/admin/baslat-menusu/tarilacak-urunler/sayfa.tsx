import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { TartilacakUrunListesi } from '@/admin/baslat-menusu/tarilacak-urunler/bilesenler/TartilacakUrunListesi';
import {
  tartilacakKayitKopyala,
  tartilacakKayitlariEsit,
  type TartilacakUrunKayit,
} from '@/admin/baslat-menusu/tarilacak-urunler/tipler';
import { tartilacakUrunGruplari, tartilacakUrunListesi } from '@/admin/baslat-menusu/tarilacak-urunler/urunKaynagi';
import { tartilacakUrunKaydiKaydet, tartilacakUrunKaydiOku } from '@/admin/baslat-menusu/tarilacak-urunler/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function TarilacakUrunlerSayfasi() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const urunler = useMemo(() => tartilacakUrunListesi(), []);
  const gruplar = useMemo(() => tartilacakUrunGruplari(urunler), [urunler]);

  const [kayit, setKayit] = useState<TartilacakUrunKayit>(() => tartilacakUrunKaydiOku());
  const [sonKayitli, setSonKayitli] = useState<TartilacakUrunKayit>(() => tartilacakUrunKaydiOku());

  const kirli = useMemo(() => !tartilacakKayitlariEsit(kayit, sonKayitli), [kayit, sonKayitli]);

  const kaydet = useCallback(() => {
    tartilacakUrunKaydiKaydet(kayit);
    setSonKayitli(tartilacakKayitKopyala(kayit));
    basariBildir('Tartılacak ürünler kaydedildi.');
  }, [kayit, basariBildir]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli || kayit.tartilanUrunIdleri.length >= 0 }, kirli);

  return (
    <AdminModulKabuk
      baslik="Tartılacak Ürünler"
      aciklama="Tartı ile satılacak ürünleri işaretleyin — kasada gramaj girişi açılır"
      onizleGoster={false}
    >
      <div className="ap-tartilacak-sayfa">
        <AdminPanelKarti
          baslik="Ürün seçimi"
          altBaslik={
            kirli
              ? 'Kaydedilmemiş değişiklikler var — alt çubuktan Kaydet'
              : `${kayit.tartilanUrunIdleri.length} ürün tartılı olarak işaretli`
          }
        >
          <TartilacakUrunListesi
            urunler={urunler}
            gruplar={gruplar}
            kayit={kayit}
            onKayitDegistir={setKayit}
          />
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
