import { SatisRaporKabuk } from '@/admin/baslat-menusu/raporlar/satis-ortak/SatisRaporKabuk';

export function SatisToplamlariSayfasi() {
  return (
    <SatisRaporKabuk
      mod="toplam"
      baslik="Satış Toplamları"
      aciklama="Ürün ve ürün grubu bazında toplam miktar ve tutar özeti"
      panelBaslik="Satış Toplamları"
    />
  );
}
