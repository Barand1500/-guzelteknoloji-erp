import type { AdminBankaAnlasma } from './tipler';

export interface BankaGelismisFiltre {
  hesapKodu: string;
  hesapIsmi: string;
  bankaAdi: string;
  iban: string;
  hesapTipi: string;
  /** '' = tümü, 'aktif' | 'pasif' */
  durum: string;
}

export const bosBankaGelismisFiltre = (): BankaGelismisFiltre => ({
  hesapKodu: '',
  hesapIsmi: '',
  bankaAdi: '',
  iban: '',
  hesapTipi: '',
  durum: '',
});

function kucuk(s: string) {
  return s.trim().toLocaleLowerCase('tr');
}

export function gelismisFiltreAktifMi(f: BankaGelismisFiltre): boolean {
  return Boolean(
    f.hesapKodu.trim() ||
      f.hesapIsmi.trim() ||
      f.bankaAdi.trim() ||
      f.iban.trim() ||
      f.hesapTipi ||
      f.durum
  );
}

export function bankaAramaKriteriVarMi(metin: string, gelismis?: BankaGelismisFiltre): boolean {
  return Boolean(metin.trim()) || (gelismis ? gelismisFiltreAktifMi(gelismis) : false);
}

export function bankalariFiltrele(
  kayitlar: AdminBankaAnlasma[],
  metin: string,
  gelismis: BankaGelismisFiltre = bosBankaGelismisFiltre()
): AdminBankaAnlasma[] {
  const q = kucuk(metin);
  return kayitlar.filter((k) => {
    const iban = k.ibanModu === 'TR' ? `tr${k.iban}` : k.iban;
    if (q) {
      const alanlar = [
        k.hesapIsmi,
        k.hesapKodu ?? '',
        k.bankaAdi,
        iban,
        k.hesapNumarasi,
      ];
      if (!alanlar.some((a) => kucuk(a).includes(q))) return false;
    }
    if (gelismis.hesapKodu.trim() && !kucuk(k.hesapKodu ?? '').includes(kucuk(gelismis.hesapKodu))) {
      return false;
    }
    if (gelismis.hesapIsmi.trim() && !kucuk(k.hesapIsmi).includes(kucuk(gelismis.hesapIsmi))) {
      return false;
    }
    if (gelismis.bankaAdi.trim() && !kucuk(k.bankaAdi).includes(kucuk(gelismis.bankaAdi))) {
      return false;
    }
    if (gelismis.iban.trim() && !kucuk(iban).includes(kucuk(gelismis.iban))) return false;
    if (gelismis.hesapTipi && k.hesapTipi !== gelismis.hesapTipi) return false;
    if (gelismis.durum === 'aktif' && !k.aktif) return false;
    if (gelismis.durum === 'pasif' && k.aktif) return false;
    return true;
  });
}
