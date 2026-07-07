export type RaporSablonTipi = 'fiyat-listesi' | 'acik-hesap-listesi' | 'ozel-raporlar';

export interface RaporYazdirAyar {
  yazici: string;
  sablon: string;
}

export interface RaporSablon {
  id: string;
  ad: string;
  dosya: string;
}

export const RAPOR_YAZICILARI = [
  'HP LaserJet MFP M232-M237',
  'Kasa Yazıcısı',
  'Mutfak Yazıcısı',
  'PDF Olarak Kaydet',
] as const;

export function raporSablonlari(tip: RaporSablonTipi): RaporSablon[] {
  if (tip === 'fiyat-listesi') {
    return [
      { id: 'fl-default', ad: 'Varsayılan', dosya: 'Default.frx' },
      { id: 'fl-salon', ad: 'Salon Fiyatları', dosya: 'Salon.frx' },
      { id: 'fl-paket', ad: 'Paket Fiyatları', dosya: 'Paket.frx' },
    ];
  }
  if (tip === 'ozel-raporlar') {
    return [
      { id: 'or-default', ad: 'Varsayılan', dosya: 'Default.frx' },
      { id: 'or-gunsonu', ad: 'Gün Sonu Özet', dosya: 'GunSonuOzel.frx' },
      { id: 'or-personel', ad: 'Personel Satış', dosya: 'PersonelSatis.frx' },
      { id: 'or-urungrup', ad: 'Ürün Grup Analizi', dosya: 'UrunGrupAnaliz.frx' },
      { id: 'or-masa', ad: 'Masa Performans', dosya: 'MasaPerformans.frx' },
    ];
  }
  return [
    { id: 'ah-default', ad: 'Varsayılan', dosya: 'Default.frx' },
    { id: 'ah-ozet', ad: 'Özet Liste', dosya: 'AcikHesapOzet.frx' },
    { id: 'ah-detay', ad: 'Detaylı Liste', dosya: 'AcikHesapDetay.frx' },
  ];
}

export function varsayilanRaporYazdirAyar(tip: RaporSablonTipi): RaporYazdirAyar {
  const ilk = raporSablonlari(tip)[0];
  return {
    yazici: RAPOR_YAZICILARI[0],
    sablon: ilk.dosya,
  };
}
