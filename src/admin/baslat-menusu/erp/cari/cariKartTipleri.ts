/**
 * Cari kart tipi uyumluluk katmanı — Özel Tanımlar cari tipleri kaynağına delege eder.
 */
import {
  cariTipiEkle,
  cariTipiEtiketi,
  cariTipiFormSecenekleri,
  cariTipiGuncelle,
  cariTipiSil,
  type CariTipiSecenek,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/cariTipleri';

export type CariKartTipiSecenek = CariTipiSecenek;

export function cariKartTipleriGetir(): CariKartTipiSecenek[] {
  return cariTipiFormSecenekleri(true);
}

export function cariKartTipiEkle(label: string): CariKartTipiSecenek | null {
  const sonuc = cariTipiEkle(label);
  if (!sonuc) return null;
  return { value: sonuc.kod, label: sonuc.adi };
}

export function cariKartTipiGuncelle(value: string, yeniLabel: string): boolean {
  return cariTipiGuncelle(value, yeniLabel);
}

export function cariKartTipiSil(value: string): void {
  cariTipiSil(value);
}

export function cariKartTipiEtiketi(value: string): string {
  return cariTipiEtiketi(value);
}
