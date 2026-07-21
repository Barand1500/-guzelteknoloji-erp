export type StokFiyatPb = 'TL' | 'USD' | 'EUR';

export type StokFiyatKdvTipi = 'dahil' | 'haric';

/** İşaretli alan — diğer fiyatları buna göre kopyalamak için */
export type IsaretliFiyatAlani =
  | 'satisFiyati1'
  | 'satisFiyati2'
  | 'satisFiyati3'
  | 'satisFiyati4'
  | 'satisFiyati5'
  | 'satisFiyati6'
  | 'alisFiyati';

export type StokFiyatPbAlani = 'pb1' | 'pb2' | 'pb3' | 'pb4' | 'pb5' | 'pb6';

export interface StokFiyatDuzenleSatir {
  id: string;
  fiyatAdi: string;
  birim: string;
  carpan: number;
  barkod: string;
  kdv: number;
  kdvTipi: StokFiyatKdvTipi;
  alisFiyati: number | null;
  satisFiyati1: number | null;
  pb1: StokFiyatPb;
  satisFiyati2: number | null;
  pb2: StokFiyatPb;
  satisFiyati3: number | null;
  pb3: StokFiyatPb;
  satisFiyati4: number | null;
  pb4: StokFiyatPb;
  satisFiyati5: number | null;
  pb5: StokFiyatPb;
  satisFiyati6: number | null;
  pb6: StokFiyatPb;
  alisKdv?: number;
  alisKdvTipi?: StokFiyatKdvTipi;
  aktif?: boolean;
  /* Yeni stok ekranı (F001 birimler karti) — UI alanları */
  isk1?: string;
  isk2?: string;
  isk3?: string;
  desi?: string;
  agirlikKg?: string;
  anaBirimMi?: boolean;
  varsayilanMi?: boolean;
  birimAciklama?: string;
}

export const STOK_FIYAT_PB_SECENEKLERI: {
  deger: StokFiyatPb;
  etiket: string;
  sembol: string;
}[] = [
  { deger: 'TL', etiket: '₺ TL', sembol: '₺' },
  { deger: 'USD', etiket: '$ USD', sembol: '$' },
  { deger: 'EUR', etiket: '€ EUR', sembol: '€' },
];

export function stokPbSembolu(kod: StokFiyatPb | string): string {
  return STOK_FIYAT_PB_SECENEKLERI.find((p) => p.deger === kod)?.sembol ?? kod;
}

export function stokPbEtiketi(kod: StokFiyatPb | string): string {
  return STOK_FIYAT_PB_SECENEKLERI.find((p) => p.deger === kod)?.etiket ?? kod;
}

export const STOK_FIYAT_KDV_TIPI_SECENEKLERI: { deger: StokFiyatKdvTipi; etiket: string }[] = [
  { deger: 'dahil', etiket: 'D' },
  { deger: 'haric', etiket: 'H' },
];

export const ISARETLI_FIYAT_ALANLARI: { value: IsaretliFiyatAlani; label: string }[] = [
  { value: 'satisFiyati1', label: '1. Satış Fiyatı' },
  { value: 'alisFiyati', label: 'Alış Fiyatı' },
];
