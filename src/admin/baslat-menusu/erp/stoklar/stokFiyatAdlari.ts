const ANAHTAR = 'erp-stok-fiyat-adlari-v1';

export interface StokFiyatAdiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokFiyatAdiSecenek[] = [
  { value: 'FIYAT', label: 'FİYAT' },
  { value: 'PERAKENDE', label: 'PERAKENDE' },
  { value: 'TOPTAN', label: 'TOPTAN' },
];

function oku(): StokFiyatAdiSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokFiyatAdiSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokFiyatAdiSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function stokFiyatAdlariGetir(): StokFiyatAdiSecenek[] {
  return oku();
}

export function stokFiyatAdiEkle(label: string): StokFiyatAdiSecenek | null {
  const ad = label.trim();
  if (!ad) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (
    mevcut.some(
      (t) => t.value === value || t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni = { value: value || `FIYAT_${Date.now()}`, label: ad.toLocaleUpperCase('tr') };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokFiyatAdiGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim();
  if (!ad) return false;
  const korunacak = new Set(['FIYAT']);
  const mevcut = oku();
  const hedef = mevcut.find((t) => t.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (t) => t.value !== value && t.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((t) =>
      t.value === value
        ? { ...t, label: korunacak.has(value) ? hedef.label : ad.toLocaleUpperCase('tr') }
        : t
    )
  );
  return true;
}

export function stokFiyatAdiSil(value: string): void {
  const korunacak = new Set(['FIYAT']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((t) => t.value !== value));
}

export function stokFiyatAdiEtiketi(value: string): string {
  return oku().find((t) => t.value === value)?.label ?? value;
}

/** Satır fiyatAdi alanı ile eşleşen etiket (FİYAT, PERAKENDE vb.) */
export function stokFiyatAdiDegeri(fiyatAdi: string): string {
  const normal = fiyatAdi.trim().toLocaleUpperCase('tr');
  const bulunan = oku().find(
    (t) =>
      t.label.toLocaleUpperCase('tr') === normal ||
      t.value.toLocaleUpperCase('tr') === normal.replace(/\s+/g, '_')
  );
  return bulunan?.label ?? (normal || 'FİYAT');
}
