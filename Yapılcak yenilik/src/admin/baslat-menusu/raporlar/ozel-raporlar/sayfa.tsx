import { RaporYazdirSayfa } from '@/admin/baslat-menusu/raporlar/ortak/RaporYazdirSayfa';
import { OzelRaporOnizleme } from '@/admin/baslat-menusu/raporlar/ozel-raporlar/bilesenler/OzelRaporOnizleme';

export function OzelRaporlarSayfasi() {
  return (
    <RaporYazdirSayfa
      raporTipi="ozel-raporlar"
      baslik="Özel Raporlar"
      aciklama="Özelleştirilmiş rapor şablonlarını yazdırın veya PDF olarak kaydedin"
      panelBaslik="Yazdır"
      panelAltBaslik="Yazıcı ve rapor şablonu seçimi"
      onizlemeBaslik="Özel Rapor Önizleme"
      onizlemeAltBaslik="Tanımlı rapor şablonları"
      bilgiMetni="Yazıcı ve tasarım şablonunu seçerek özel rapor çıktısı alın. Yeni şablon ekleyebilir, önizleyebilir veya doğrudan yazdırabilirsiniz."
      onizlemeIcerik={<OzelRaporOnizleme />}
    />
  );
}
