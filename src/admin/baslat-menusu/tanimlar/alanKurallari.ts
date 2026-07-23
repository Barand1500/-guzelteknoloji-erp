/** Tanımlar modülü alan giriş kuralları (şema + GİB/MERSİS pratikleri). */

export type AlanKuralTipi =
  | 'kod'
  | 'stokKod'
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
}

export const ALAN_KURALLARI: Record<AlanKuralTipi, AlanKurali> = {
  kod: { max: 20 },
  stokKod: { max: 30 },
  ad: { max: 150 },
  vergiNo: { max: 10 },
  postaKodu: { max: 5 },
  ebelgeSeri: { max: 3 },
  mersis: { max: 16 },
  ticaretSicil: { max: 30 },
  binaNo: { max: 20 },
  serbestMetin: { max: 255 },
};

/** Kod / e-belge: ASCII + Türkçe harfler; İ/ı/i doğru büyük harfe döner */
const HARF_RAKAM =
  /[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g;

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
      return ham.replace(HARF_RAKAM, '').toLocaleUpperCase('tr').slice(0, max);
    case 'stokKod':
      return ham.replace(/[^a-zA-Z0-9.çğıöşüÇĞİÖŞÜ]/g, '').toLocaleUpperCase('tr').slice(0, max);
    case 'ad':
    case 'serbestMetin':
    case 'binaNo':
      return ham.toLocaleUpperCase('tr').slice(0, max);
    default:
      return ham.toLocaleUpperCase('tr').slice(0, max);
  }
}

/** Tanımlar ekranı serbest metin — yazarken Türkçe büyük harf */
export function tanimBuyukHarf(ham: string): string {
  return ham.toLocaleUpperCase('tr');
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
  const v = deger.trim().toLocaleUpperCase('tr');
  return v === '' || /^[A-Z0-9ÇĞİÖŞÜ]{3}$/.test(v);
}

export function kodGecerliMi(deger: string): boolean {
  const v = deger.trim().toLocaleUpperCase('tr');
  return v.length > 0 && v.length <= 20 && /^[A-Z0-9ÇĞİÖŞÜ]+$/.test(v);
}

export function adGecerliMi(deger: string, max = 150): boolean {
  const v = deger.trim();
  return v.length > 0 && v.length <= max;
}

export function donemAdGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v.length > 0 && v.length <= 100;
}
