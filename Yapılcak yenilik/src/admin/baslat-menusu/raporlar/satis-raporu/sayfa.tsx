import { SatisRaporKabuk } from '@/admin/baslat-menusu/raporlar/satis-ortak/SatisRaporKabuk';

export function SatisRaporuSayfasi() {
  return (
    <SatisRaporKabuk
      mod="detay"
      baslik="Satış Raporu"
      aciklama="Sipariş kalemlerini tarih, ürün ve şube kriterlerine göre listeleyin"
      panelBaslik="Satışlar"
    />
  );
}
