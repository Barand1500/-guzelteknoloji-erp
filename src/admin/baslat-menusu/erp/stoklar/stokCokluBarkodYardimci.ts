import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

const BARKOD_ALANLARI = ['barkod', 'barkod2', 'barkod3', 'barkod4', 'barkod5', 'barkod6'] as const;

export const STOK_COKLU_BARKOD_ADET = BARKOD_ALANLARI.length;

export function stokCokluBarkodDegeri(satir: StokFiyatDuzenleSatir, sira: number): string {
  if (sira < 1 || sira > STOK_COKLU_BARKOD_ADET) return '';
  const alan = BARKOD_ALANLARI[sira - 1];
  return (satir[alan as keyof StokFiyatDuzenleSatir] as string | undefined) ?? '';
}

export function stokCokluBarkodDoluMu(satir: StokFiyatDuzenleSatir, sira: number): boolean {
  return stokCokluBarkodDegeri(satir, sira).trim() !== '';
}

export function stokCokluBarkodPatch(sira: number, deger: string): Partial<StokFiyatDuzenleSatir> {
  if (sira < 1 || sira > STOK_COKLU_BARKOD_ADET) return {};
  const alan = BARKOD_ALANLARI[sira - 1];
  return { [alan]: deger.trim() } as Partial<StokFiyatDuzenleSatir>;
}

export function stokCokluBarkodTasi(
  eskiSira: number,
  yeniSira: number,
  deger: string
): Partial<StokFiyatDuzenleSatir> {
  if (eskiSira < 1 || eskiSira > STOK_COKLU_BARKOD_ADET) return {};
  if (yeniSira < 1 || yeniSira > STOK_COKLU_BARKOD_ADET) return {};
  if (eskiSira === yeniSira) return stokCokluBarkodPatch(yeniSira, deger);
  return {
    ...stokCokluBarkodPatch(eskiSira, ''),
    ...stokCokluBarkodPatch(yeniSira, deger),
  };
}

export function stokCokluBarkodSiraGecerliMi(sira: number): boolean {
  return Number.isInteger(sira) && sira >= 1 && sira <= STOK_COKLU_BARKOD_ADET;
}

export function stokCokluBarkodEtiketi(sira: number): string {
  return `${sira}. Barkod`;
}

export function stokCokluBarkodIlkBosSira(satir: StokFiyatDuzenleSatir): number | null {
  for (let sira = 1; sira <= STOK_COKLU_BARKOD_ADET; sira += 1) {
    if (!stokCokluBarkodDoluMu(satir, sira)) return sira;
  }
  return null;
}
