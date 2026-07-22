import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

export type StokCokluFiyatTur = 'alis' | 'satis';

const ALIS_ALANLARI = [
  'alisFiyati',
  'alisFiyati2',
  'alisFiyati3',
  'alisFiyati4',
  'alisFiyati5',
  'alisFiyati6',
] as const;

const SATIS_ALANLARI = [
  'satisFiyati1',
  'satisFiyati2',
  'satisFiyati3',
  'satisFiyati4',
  'satisFiyati5',
  'satisFiyati6',
] as const;

export const STOK_COKLU_FIYAT_ADET = 6;

export function stokCokluFiyatDegeri(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur,
  sira: number
): number | null {
  if (sira < 1 || sira > STOK_COKLU_FIYAT_ADET) return null;
  const alan = tur === 'alis' ? ALIS_ALANLARI[sira - 1] : SATIS_ALANLARI[sira - 1];
  return (satir[alan as keyof StokFiyatDuzenleSatir] as number | null | undefined) ?? null;
}

export function stokCokluFiyatPatch(
  tur: StokCokluFiyatTur,
  sira: number,
  deger: number | null
): Partial<StokFiyatDuzenleSatir> {
  if (sira < 1 || sira > STOK_COKLU_FIYAT_ADET) return {};
  const alan = tur === 'alis' ? ALIS_ALANLARI[sira - 1] : SATIS_ALANLARI[sira - 1];
  return { [alan]: deger } as Partial<StokFiyatDuzenleSatir>;
}

/** Fiyatı başka sıra numarasına taşır (eski slot temizlenir). */
export function stokCokluFiyatTasi(
  tur: StokCokluFiyatTur,
  eskiSira: number,
  yeniSira: number,
  deger: number | null
): Partial<StokFiyatDuzenleSatir> {
  if (eskiSira < 1 || eskiSira > STOK_COKLU_FIYAT_ADET) return {};
  if (yeniSira < 1 || yeniSira > STOK_COKLU_FIYAT_ADET) return {};
  if (eskiSira === yeniSira) return stokCokluFiyatPatch(tur, yeniSira, deger);
  return {
    ...stokCokluFiyatPatch(tur, eskiSira, null),
    ...stokCokluFiyatPatch(tur, yeniSira, deger),
  };
}

export function stokCokluFiyatSiraGecerliMi(sira: number): boolean {
  return Number.isInteger(sira) && sira >= 1 && sira <= STOK_COKLU_FIYAT_ADET;
}

export function stokCokluFiyatEtiketi(tur: StokCokluFiyatTur, sira: number): string {
  const kok = tur === 'alis' ? 'Alış Fiyatı' : 'Satış Fiyatı';
  return `${sira}. ${kok}`;
}

export function stokCokluFiyatDoluSiralar(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number[] {
  const siralar: number[] = [];
  for (let sira = 1; sira <= STOK_COKLU_FIYAT_ADET; sira += 1) {
    if (stokCokluFiyatDegeri(satir, tur, sira) !== null) siralar.push(sira);
  }
  return siralar;
}

export function stokCokluFiyatIlkBosSira(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number | null {
  for (let sira = 1; sira <= STOK_COKLU_FIYAT_ADET; sira += 1) {
    if (stokCokluFiyatDegeri(satir, tur, sira) === null) return sira;
  }
  return null;
}
