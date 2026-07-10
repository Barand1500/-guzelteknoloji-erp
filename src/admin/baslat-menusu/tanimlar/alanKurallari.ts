/** Tanımlar modülü alan giriş kuralları (şema + GİB/MERSİS pratikleri). */

export type AlanKuralTipi =
  | 'kod'
  | 'ad'
  | 'vergiNo'
  | 'postaKodu'
  | 'ebelgeSeri'
  | 'mersis'
  | 'ticaretSicil'
  | 'binaNo'
  | 'serbestMetin';

export interface AlanKurali {
  max: number;
  aciklama?: string;
}

export const ALAN_KURALLARI: Record<AlanKuralTipi, AlanKurali> = {
  kod: { max: 20, aciklama: 'En fazla 20 karakter; harf ve rakam' },
  ad: { max: 150, aciklama: 'En fazla 150 karakter' },
  vergiNo: { max: 10, aciklama: '10 haneli vergi kimlik numarası (yalnızca rakam)' },
  postaKodu: { max: 5, aciklama: '5 haneli posta kodu (yalnızca rakam)' },
  ebelgeSeri: { max: 3, aciklama: '3 karakter; büyük harf veya rakam (e-belge birim kodu)' },
  mersis: { max: 16, aciklama: '16 haneli MERSİS numarası (yalnızca rakam)' },
  ticaretSicil: { max: 30, aciklama: 'En fazla 30 karakter; harf ve rakam' },
  binaNo: { max: 20, aciklama: 'En fazla 20 karakter' },
  serbestMetin: { max: 255 },
};

export function alanDegeriniFiltrele(tip: AlanKuralTipi, ham: string): string {
  const { max } = ALAN_KURALLARI[tip];
  switch (tip) {
    case 'vergiNo':
    case 'postaKodu':
    case 'mersis':
      return ham.replace(/\D/g, '').slice(0, max);
    case 'kod':
    case 'ebelgeSeri':
    case 'ticaretSicil':
      return ham.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, max);
    case 'binaNo':
      return ham.slice(0, max);
    default:
      return ham.slice(0, max);
  }
}

export function vergiNoGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v === '' || /^\d{10}$/.test(v);
}

export function mersisGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v === '' || /^\d{16}$/.test(v);
}

export function postaKoduGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v === '' || /^\d{5}$/.test(v);
}

export function ebelgeSeriGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v === '' || /^[A-Z0-9]{3}$/.test(v);
}

export function kodGecerliMi(deger: string): boolean {
  return deger.trim().length > 0 && /^[A-Z0-9]{1,20}$/.test(deger.trim().toUpperCase());
}

export function adGecerliMi(deger: string, max = 150): boolean {
  const v = deger.trim();
  return v.length > 0 && v.length <= max;
}

export function donemAdGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v.length > 0 && v.length <= 100;
}
