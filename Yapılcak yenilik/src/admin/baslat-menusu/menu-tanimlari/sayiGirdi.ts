/** Master paket paneli ile uyumlu metin tabanlı sayı girişi */

export function tamSayiKabul(metin: string): boolean {
  return metin === '' || /^\d+$/.test(metin);
}

export function ondalikKabul(metin: string): boolean {
  const v = metin.replace(',', '.');
  return v === '' || /^\d*\.?\d*$/.test(v);
}

export function isaretliOndalikKabul(metin: string): boolean {
  if (metin === '' || metin === '-' || metin === '+') return true;
  const v = metin.replace(',', '.');
  return /^[+-]?\d*\.?\d*$/.test(v);
}

export function ondalikGosterTr(deger: number): string {
  if (!Number.isFinite(deger)) return '0';
  return String(deger).replace('.', ',');
}

export function tamSayiGoster(deger: number): string {
  if (!Number.isFinite(deger)) return '1';
  return String(Math.max(0, Math.trunc(deger)));
}

export function sayiParseTr(metin: string): number {
  const s = metin.trim().replace(',', '.');
  if (s === '' || s === '-' || s === '+' || s === '.') return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

export function tamSayiParseTr(metin: string): number {
  const n = Number.parseInt(metin.trim(), 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

export type MetinSayiTipi = 'tam' | 'ondalik' | 'isaretli-ondalik';

export function metinSayiKabul(metin: string, tip: MetinSayiTipi): boolean {
  if (tip === 'tam') return tamSayiKabul(metin);
  if (tip === 'isaretli-ondalik') return isaretliOndalikKabul(metin);
  return ondalikKabul(metin);
}

export function metinSayiParse(metin: string, tip: MetinSayiTipi): number {
  if (tip === 'tam') return tamSayiParseTr(metin);
  return sayiParseTr(metin);
}

export function metinSayiGoster(deger: number, tip: MetinSayiTipi): string {
  if (tip === 'tam') return tamSayiGoster(deger);
  return ondalikGosterTr(deger);
}
