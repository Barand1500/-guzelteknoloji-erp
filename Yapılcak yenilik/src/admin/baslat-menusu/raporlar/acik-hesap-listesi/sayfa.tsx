import { RaporYazdirSayfa } from '@/admin/baslat-menusu/raporlar/ortak/RaporYazdirSayfa';
import { AcikHesapOnizleme } from '@/admin/baslat-menusu/raporlar/acik-hesap-listesi/bilesenler/AcikHesapOnizleme';

export function AcikHesapListesiSayfasi() {
  return (
    <RaporYazdirSayfa
      raporTipi="acik-hesap-listesi"
      baslik="Açık Hesap Listesi"
      aciklama="Ödenmemiş cari hesapları listeleyin ve yazdırın"
      panelBaslik="Yazdır"
      panelAltBaslik="Yazıcı ve rapor şablonu seçimi"
      onizlemeBaslik="Açık Hesap Önizleme"
      onizlemeAltBaslik="Bakiyesi olan cari hesaplar"
      bilgiMetni="Açık hesap listesini seçtiğiniz şablona göre yazdırın. Özet veya detaylı şablon kullanabilirsiniz."
      onizlemeIcerik={<AcikHesapOnizleme />}
    />
  );
}
