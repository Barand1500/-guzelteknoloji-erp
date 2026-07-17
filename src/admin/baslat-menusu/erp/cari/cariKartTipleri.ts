const ANAHTAR = 'erp-cari-kart-tipleri-v1';

export interface CariKartTipiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: CariKartTipiSecenek[] = [
  { value: 'ALICI', label: 'Alıcı' },
  { value: 'SATICI', label: 'Satıcı' },
  { value: 'HER_IKISI', label: 'Her İkisi' },
  { value: 'DIGER', label: 'Diğer' },
];

function oku(): CariKartTipiSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as CariKartTipiSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: CariKartTipiSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function cariKartTipleriGetir(): CariKartTipiSecenek[] {
  return oku();
}

export function cariKartTipiEkle(label: string): CariKartTipiSecenek | null {
  const ad = label.trim();
  if (!ad) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (mevcut.some((t) => t.value === value || t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'))) {
    return null;
  }
  const yeni = { value: value || `TIP_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function cariKartTipiSil(value: string): void {
  const korunacak = new Set(['ALICI', 'SATICI']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((t) => t.value !== value));
}

export function cariKartTipiEtiketi(value: string): string {
  return oku().find((t) => t.value === value)?.label ?? value;
}
