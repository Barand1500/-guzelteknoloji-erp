import type { AdminCari } from './tipler';

function kucuk(s: string) {
  return s.trim().toLocaleLowerCase('tr');
}

export function carileriFiltrele(kayitlar: AdminCari[], metin: string): AdminCari[] {
  const q = kucuk(metin);
  if (!q) return [];
  return kayitlar.filter((c) => {
    const alanlar = [c.cariKodu, c.cariAdi, c.unvan, c.yetkili, c.vergiNo, c.telefon, c.eposta];
    return alanlar.some((a) => kucuk(a ?? '').includes(q));
  });
}

export function cariAramaKriteriVarMi(metin: string): boolean {
  return metin.trim().length > 0;
}
