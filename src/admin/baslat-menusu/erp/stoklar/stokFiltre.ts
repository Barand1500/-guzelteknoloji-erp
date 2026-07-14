import type { AdminStok, StokGelismisFiltre } from './tipler';

export function stoklariFiltrele(
  kayitlar: AdminStok[],
  metin: string,
  gelismis: StokGelismisFiltre
): AdminStok[] {
  const q = metin.trim().toLowerCase();
  return kayitlar.filter((s) => {
    if (q) {
      const birlesik = `${s.urunKodu} ${s.urunAdi} ${s.urunTipi} ${s.marka}`.toLowerCase();
      if (!birlesik.includes(q)) return false;
    }
    if (gelismis.urunTipi && s.urunTipi !== gelismis.urunTipi) return false;
    if (gelismis.urunKodu.trim()) {
      if (!s.urunKodu.toLowerCase().includes(gelismis.urunKodu.trim().toLowerCase())) return false;
    }
    if (gelismis.urunAdi.trim()) {
      if (!s.urunAdi.toLowerCase().includes(gelismis.urunAdi.trim().toLowerCase())) return false;
    }
    if (gelismis.durum === 'aktif' && !s.aktif) return false;
    if (gelismis.durum === 'pasif' && s.aktif) return false;
    // sinifGrup: placeholder — DB alanı yok, filtre şimdilik yok sayılır
    return true;
  });
}

export function gelismisFiltreAktifMi(f: StokGelismisFiltre): boolean {
  return Boolean(f.urunTipi || f.urunKodu.trim() || f.sinifGrup.trim() || f.urunAdi.trim() || f.durum);
}

export function stokAramaKriteriVarMi(metin: string, gelismis: StokGelismisFiltre): boolean {
  return Boolean(metin.trim()) || gelismisFiltreAktifMi(gelismis);
}
