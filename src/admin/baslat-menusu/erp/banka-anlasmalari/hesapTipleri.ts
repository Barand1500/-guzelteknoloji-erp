const ANAHTAR = 'erp-banka-anlasmalari-hesap-tipleri-v1';

export interface HesapTipiSecenek {
  value: string;
  label: string;
}

/** Sistem varsayılanları — silinemez */
export const SABIT_HESAP_TIPLERI = ['BANKA', 'KREDI', 'POS'] as const;

const VARSAYILAN: HesapTipiSecenek[] = [
  { value: 'BANKA', label: 'Banka' },
  { value: 'KREDI', label: 'Kredi' },
  { value: 'POS', label: 'POS' },
];

function oku(): HesapTipiSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as HesapTipiSecenek[];
      if (Array.isArray(liste) && liste.length > 0) {
        const map = new Map(liste.map((t) => [t.value, t]));
        for (const v of VARSAYILAN) {
          if (!map.has(v.value)) map.set(v.value, v);
        }
        return [...map.values()];
      }
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: HesapTipiSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function hesapTipleriGetir(): HesapTipiSecenek[] {
  return oku();
}

export function hesapTipiEkle(label: string): HesapTipiSecenek | null {
  const ad = label.trim();
  if (!ad) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (
    mevcut.some(
      (t) =>
        t.value === value || t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni = { value: value || `TIP_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function hesapTipiGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim();
  if (!ad) return false;
  const mevcut = oku();
  const hedef = mevcut.find((t) => t.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (t) =>
        t.value !== value && t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(mevcut.map((t) => (t.value === value ? { ...t, label: ad } : t)));
  return true;
}

export function hesapTipiSil(value: string): boolean {
  if ((SABIT_HESAP_TIPLERI as readonly string[]).includes(value)) return false;
  yaz(oku().filter((t) => t.value !== value));
  return true;
}

export function hesapTipiEtiketi(value: string): string {
  return oku().find((t) => t.value === value)?.label ?? value;
}
