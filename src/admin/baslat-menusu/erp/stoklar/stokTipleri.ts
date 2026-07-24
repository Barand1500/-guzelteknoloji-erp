/**
 * Stok tipi uyumluluk katmanı — Özel Tanımlar stok tipleri kaynağına delege eder.
 */
import {
  stokTipiFormSecenekleri,
  stokTipiOtEkle,
  stokTipiOtEtiketi,
  stokTipiOtGuncelle,
  stokTipiOtSil,
  type StokTipiSecenek,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/stokTipleriOt';

export type { StokTipiSecenek };

export function stokTipleriGetir(): StokTipiSecenek[] {
  return stokTipiFormSecenekleri(true);
}

export function stokTipiEkle(label: string): StokTipiSecenek | null {
  const sonuc = stokTipiOtEkle(label);
  if (!sonuc) return null;
  return { value: sonuc.kod, label: sonuc.adi };
}

export function stokTipiGuncelle(value: string, yeniLabel: string): boolean {
  return stokTipiOtGuncelle(value, yeniLabel);
}

export function stokTipiSil(value: string): void {
  stokTipiOtSil(value);
}

export function stokTipiEtiketi(value: string): string {
  return stokTipiOtEtiketi(value);
}
