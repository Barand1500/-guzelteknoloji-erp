import type { AdminCari } from './tipler';

export interface CariGelismisFiltre {
  cariKodu: string;
  cariAdi: string;
  unvan: string;
  vergiNo: string;
  telefon: string;
  cariTipi: string;
  /** '' = tümü, 'aktif' | 'pasif' */
  durum: string;
}

export const bosCariGelismisFiltre = (): CariGelismisFiltre => ({
  cariKodu: '',
  cariAdi: '',
  unvan: '',
  vergiNo: '',
  telefon: '',
  cariTipi: '',
  durum: '',
});

function kucuk(s: string) {
  return s.trim().toLocaleLowerCase('tr');
}

export function gelismisFiltreAktifMi(f: CariGelismisFiltre): boolean {
  return Boolean(
    f.cariKodu.trim() ||
      f.cariAdi.trim() ||
      f.unvan.trim() ||
      f.vergiNo.trim() ||
      f.telefon.trim() ||
      f.cariTipi ||
      f.durum
  );
}

export function cariAramaKriteriVarMi(metin: string, gelismis?: CariGelismisFiltre): boolean {
  return Boolean(metin.trim()) || (gelismis ? gelismisFiltreAktifMi(gelismis) : false);
}

export function carileriFiltrele(
  kayitlar: AdminCari[],
  metin: string,
  gelismis: CariGelismisFiltre = bosCariGelismisFiltre()
): AdminCari[] {
  const q = kucuk(metin);
  return kayitlar.filter((c) => {
    if (q) {
      const alanlar = [c.cariKodu, c.cariAdi, c.unvan, c.yetkili, c.vergiNo, c.telefon, c.eposta];
      if (!alanlar.some((a) => kucuk(a ?? '').includes(q))) return false;
    }
    if (gelismis.cariKodu.trim() && !kucuk(c.cariKodu).includes(kucuk(gelismis.cariKodu))) return false;
    if (gelismis.cariAdi.trim() && !kucuk(c.cariAdi).includes(kucuk(gelismis.cariAdi))) return false;
    if (gelismis.unvan.trim() && !kucuk(c.unvan).includes(kucuk(gelismis.unvan))) return false;
    if (gelismis.vergiNo.trim() && !kucuk(c.vergiNo).includes(kucuk(gelismis.vergiNo))) return false;
    if (gelismis.telefon.trim()) {
      const tel = `${c.telefon} ${c.gsm}`;
      if (!kucuk(tel).includes(kucuk(gelismis.telefon))) return false;
    }
    if (gelismis.cariTipi && c.cariTipi !== gelismis.cariTipi) return false;
    if (gelismis.durum === 'aktif' && !c.aktif) return false;
    if (gelismis.durum === 'pasif' && c.aktif) return false;
    return true;
  });
}
