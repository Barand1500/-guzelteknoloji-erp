export type BirimAciklamaGorunumu = 'hicbiri' | 'kisa' | 'uzun';

export interface StokBirimListeSatir {
  id: string;
  fiyatAd: string;
  birim: string;
  carpan: number;
  satisFiyati1: number | null;
  satisFiyati2: number | null;
  satisFiyati3: number | null;
  kdvYuzde: number;
  kdvDahil: boolean;
}

export const BIRIM_ACIKLAMA_GORUNUMLERI: { value: BirimAciklamaGorunumu; label: string }[] = [
  { value: 'hicbiri', label: 'Hiçbiri' },
  { value: 'kisa', label: 'Kısa' },
  { value: 'uzun', label: 'Uzun' },
];
