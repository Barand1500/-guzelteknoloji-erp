import { RaporYazdirSayfa } from '@/admin/baslat-menusu/raporlar/ortak/RaporYazdirSayfa';
import { FiyatListesiOnizleme } from '@/admin/baslat-menusu/raporlar/fiyat-listesi/bilesenler/FiyatListesiOnizleme';

export function FiyatListesiSayfasi() {
  return (
    <RaporYazdirSayfa
      raporTipi="fiyat-listesi"
      baslik="Fiyat Listesi"
      aciklama="Ürün fiyat listesini yazdırın veya PDF olarak kaydedin"
      panelBaslik="Yazdır"
      panelAltBaslik="Yazıcı ve rapor şablonu seçimi"
      onizlemeBaslik="Fiyat Listesi Önizleme"
      onizlemeAltBaslik="Güncel ürün fiyatları"
      bilgiMetni="Salon, paket veya varsayılan şablona göre fiyat listesi çıktısı alabilirsiniz. Şablon seçimini kaydeder; bir sonraki açılışta hatırlanır."
      onizlemeIcerik={<FiyatListesiOnizleme />}
    />
  );
}
