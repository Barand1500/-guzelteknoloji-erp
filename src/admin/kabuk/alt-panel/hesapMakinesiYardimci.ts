import { ifadeHesapla, iskontoIfadesiHesapla, sayiIfadesiHesapla } from '@/admin/ortak/datagrid/formulaYardimci';

export function sayiCoz(girdi: string, varsayilan = 0): number | null {
  const temiz = girdi.trim();
  if (!temiz) return varsayilan;
  return sayiIfadesiHesapla(temiz) ?? (Number.isFinite(parseFloat(temiz.replace(',', '.'))) ? parseFloat(temiz.replace(',', '.')) : null);
}

export function sayiGoster(deger: number, ondalik = 2): string {
  if (!Number.isFinite(deger)) return '—';
  return deger.toLocaleString('tr-TR', { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });
}

export function kdvMatrahtanDahil(matrah: number, oran: number) {
  const kdv = (matrah * oran) / 100;
  return { matrah, kdv, toplam: matrah + kdv };
}

export function kdvDahildenHariç(toplam: number, oran: number) {
  const matrah = toplam / (1 + oran / 100);
  const kdv = toplam - matrah;
  return { matrah, kdv, toplam };
}

export function iskontoUygula(tutar: number, iskontoGirdi: string) {
  const yuzde = iskontoIfadesiHesapla(iskontoGirdi.trim()) ?? sayiCoz(iskontoGirdi, 0) ?? 0;
  const indirim = (tutar * yuzde) / 100;
  return { yuzde, indirim, net: tutar - indirim };
}

export function karMarjiSatisFiyati(maliyet: number, karYuzde: number) {
  return maliyet * (1 + karYuzde / 100);
}

export function karMarjiYuzdesi(maliyet: number, satis: number) {
  if (!maliyet) return 0;
  return ((satis - maliyet) / maliyet) * 100;
}

export function birimTutarHesapla(birimFiyat: number, miktar: number, iskontoGirdi?: string) {
  const brut = birimFiyat * miktar;
  if (!iskontoGirdi?.trim()) return { brut, indirim: 0, net: brut };
  const { indirim, net } = iskontoUygula(brut, iskontoGirdi);
  return { brut, indirim, net };
}

export function ifadeSonucu(girdi: string): number | null {
  return ifadeHesapla(girdi.trim(), 'sayi');
}
