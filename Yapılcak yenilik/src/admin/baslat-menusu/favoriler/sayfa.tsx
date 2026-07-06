import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { FavoriUrunTablosu } from '@/admin/baslat-menusu/favoriler/bilesenler/FavoriUrunTablosu';
import {
  favoriKayitKopyala,
  favoriKayitlariEsit,
  type FavoriKayit,
} from '@/admin/baslat-menusu/favoriler/tipler';
import { favoriUrunListesi } from '@/admin/baslat-menusu/favoriler/urunKaynagi';
import { favoriKaydiKaydet, favoriKaydiOku } from '@/admin/baslat-menusu/favoriler/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function FavorilerSayfasi() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const urunler = useMemo(() => favoriUrunListesi(), []);

  const [kayit, setKayit] = useState<FavoriKayit>(() => favoriKaydiOku());
  const [sonKayitli, setSonKayitli] = useState<FavoriKayit>(() => favoriKaydiOku());

  const kirli = useMemo(() => !favoriKayitlariEsit(kayit, sonKayitli), [kayit, sonKayitli]);

  const kaydet = useCallback(() => {
    favoriKaydiKaydet(kayit);
    setSonKayitli(favoriKayitKopyala(kayit));
    basariBildir('Favori menü atamaları kaydedildi.');
  }, [kayit, basariBildir]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli || Object.keys(kayit.atamalar).length >= 0 }, kirli);

  const atanmisSayisi = useMemo(
    () => Object.values(kayit.atamalar).filter((f) => f && f !== 'Yok').length,
    [kayit.atamalar]
  );

  return (
    <AdminModulKabuk
      baslik="Favoriler"
      aciklama="Ürünleri kasa veya garson favori menüsüne atayın — hızlı satış ekranında görünür"
      onizleGoster={false}
    >
      <div className="ap-favoriler-sayfa">
        <AdminPanelKarti
          baslik="Favori Menüsü Düzenle"
          altBaslik={
            kirli
              ? 'Kaydedilmemiş değişiklikler var — alt çubuktan Kaydet'
              : `${atanmisSayisi} ürün favori menüsüne atanmış`
          }
        >
          <FavoriUrunTablosu urunler={urunler} kayit={kayit} onKayitDegistir={setKayit} />
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
