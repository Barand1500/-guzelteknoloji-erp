export type StokFiyatPb = 'TL' | 'USD' | 'EUR';

export type StokFiyatKdvTipi = 'dahil' | 'haric';

/** Mevcut şemada kalıcı alanlar: satış + alış */
export type IsaretliFiyatAlani = 'satisFiyati1' | 'alisFiyati';

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
  /** Şemada yok — kaydedilmez */
  satisFiyati2: number | null;
  pb2: StokFiyatPb;
  satisFiyati3: number | null;
  pb3: StokFiyatPb;
  satisFiyati4: number | null;
  pb4: StokFiyatPb;
  satisFiyati5: number | null;
  pb5: StokFiyatPb;
  alisKdv?: number;
  aktif?: boolean;
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
  { value: 'satisFiyati1', label: 'Satış Fiyatı' },
  { value: 'alisFiyati', label: 'Alış Fiyatı' },
];
