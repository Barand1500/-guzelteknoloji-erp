export type StokFiyatPb = 'TL' | 'USD' | 'EUR';

export type StokFiyatKdvTipi = 'dahil' | 'haric';

export type IsaretliFiyatAlani =
  | 'satisFiyati1'
  | 'satisFiyati2'
  | 'satisFiyati3'
  | 'satisFiyati4'
  | 'satisFiyati5';

export interface StokFiyatDuzenleSatir {
  id: string;
  fiyatAdi: string;
  birim: string;
  carpan: number;
  barkod: string;
  kdv: number;
  kdvTipi: StokFiyatKdvTipi;
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
}

export const STOK_FIYAT_PB_SECENEKLERI: { deger: StokFiyatPb; etiket: string }[] = [
  { deger: 'TL', etiket: 'TL' },
  { deger: 'USD', etiket: 'USD' },
  { deger: 'EUR', etiket: 'EUR' },
];

export const STOK_FIYAT_KDV_TIPI_SECENEKLERI: { deger: StokFiyatKdvTipi; etiket: string }[] = [
  { deger: 'dahil', etiket: 'D' },
  { deger: 'haric', etiket: 'H' },
];

export const ISARETLI_FIYAT_ALANLARI: { value: IsaretliFiyatAlani; label: string }[] = [
  { value: 'satisFiyati1', label: '1. Satış Fiyatı' },
  { value: 'satisFiyati2', label: '2. Satış Fiyatı' },
  { value: 'satisFiyati3', label: '3. Satış Fiyatı' },
  { value: 'satisFiyati4', label: '4. Satış Fiyatı' },
  { value: 'satisFiyati5', label: '5. Satış Fiyatı' },
];

export const FIYAT_ALAN_CARPANLARI: Record<IsaretliFiyatAlani, number> = {
  satisFiyati1: 1,
  satisFiyati2: 1.05,
  satisFiyati3: 1.1,
  satisFiyati4: 1.15,
  satisFiyati5: 1.2,
};
