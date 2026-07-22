const ANAHTAR = 'erp-stok-tipleri-v1';

export interface StokTipiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokTipiSecenek[] = [
  { value: 'EMTIA', label: 'Emtia' },
  { value: 'HIZMET', label: 'Hizmet' },
];

function oku(): StokTipiSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokTipiSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokTipiSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function stokTipleriGetir(): StokTipiSecenek[] {
  return oku();
}

export function stokTipiEkle(label: string): StokTipiSecenek | null {
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
        t.value === value ||
        t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni = { value: value || `TIP_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokTipiGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim();
  if (!ad) return false;
  const korunacak = new Set(['EMTIA', 'HIZMET']);
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
  yaz(
    mevcut.map((t) =>
      t.value === value ? { ...t, label: korunacak.has(value) ? hedef.label : ad } : t
    )
  );
  return true;
}

export function stokTipiSil(value: string): void {
  const korunacak = new Set(['EMTIA', 'HIZMET']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((t) => t.value !== value));
}

export function stokTipiEtiketi(value: string): string {
  return oku().find((t) => t.value === value)?.label ?? value;
}
