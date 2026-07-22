const ANAHTAR = 'erp-stok-nevileri-v1';

export interface StokNeviSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokNeviSecenek[] = [
  { value: 'RESMI', label: 'Resmî' },
  { value: 'GAYRIRESMI', label: 'Gayriresmî' },
];

function oku(): StokNeviSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokNeviSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokNeviSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function stokNevileriGetir(): StokNeviSecenek[] {
  return oku();
}

export function stokNeviEkle(label: string): StokNeviSecenek | null {
  const ad = label.trim();
  if (!ad) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (
    mevcut.some(
      (n) =>
        n.value === value ||
        n.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni = { value: value || `NEVI_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokNeviGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim();
  if (!ad) return false;
  const korunacak = new Set(['RESMI', 'GAYRIRESMI']);
  const mevcut = oku();
  const hedef = mevcut.find((n) => n.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (n) =>
        n.value !== value && n.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((n) =>
      n.value === value ? { ...n, label: korunacak.has(value) ? hedef.label : ad } : n
    )
  );
  return true;
}

export function stokNeviSil(value: string): void {
  const korunacak = new Set(['RESMI', 'GAYRIRESMI']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((n) => n.value !== value));
}

export function stokNeviEtiketi(value: string): string {
  return oku().find((n) => n.value === value)?.label ?? value;
}
