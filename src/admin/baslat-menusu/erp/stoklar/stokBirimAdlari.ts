/**
 * Stok birim adları uyumluluk katmanı — Özel Tanımlar ölçü birimleri kaynağına delege eder.
 */
import {
  gecerliOlcuBirim,
  olcuBirimEkle,
  olcuBirimFormSecenekleri,
  olcuBirimGuncelle,
  olcuBirimSil,
  type OlcuBirimSecenek,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/olcuBirimleri';

export type StokBirimAdiSecenek = OlcuBirimSecenek;

export function stokBirimAdlariGetir(): StokBirimAdiSecenek[] {
  return olcuBirimFormSecenekleri(true);
}

export function stokBirimAdlariSecenekleri(): { value: string; label: string }[] {
  return olcuBirimFormSecenekleri(true);
}

export function stokBirimAdiEkle(label: string): StokBirimAdiSecenek | null {
  const sonuc = olcuBirimEkle(label);
  if (!sonuc) return null;
  return { value: sonuc.adi, label: sonuc.adi };
}

export function stokBirimAdiGuncelle(value: string, yeniLabel: string): boolean {
  return olcuBirimGuncelle(value, yeniLabel);
}

export function stokBirimAdiSil(value: string): void {
  olcuBirimSil(value);
}

export function stokBirimAdiGecerli(birim: string): string {
  return gecerliOlcuBirim(birim);
}
