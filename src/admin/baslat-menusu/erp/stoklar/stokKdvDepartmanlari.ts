const ANAHTAR = 'erp-stok-kdv-departmanlari-v1';

export interface StokKdvDepartmaniSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokKdvDepartmaniSecenek[] = [
  { value: 'ICECEKLER', label: 'İÇECEKLER' },
  { value: 'YIYECEKLER', label: 'YİYECEKLER' },
  { value: 'MERCH', label: 'MERCH' },
  { value: 'CEKIRDEK_KAHVE', label: 'ÇEKİRDEK KAHVE' },
];

const KORUNACAK = new Set(VARSAYILAN.map((d) => d.value));

function oku(): StokKdvDepartmaniSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokKdvDepartmaniSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokKdvDepartmaniSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function stokKdvDepartmanlariGetir(): StokKdvDepartmaniSecenek[] {
  return oku();
}

export function stokKdvDepartmaniEkle(label: string): StokKdvDepartmaniSecenek | null {
  const ad = label.trim();
  if (!ad) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (
    mevcut.some(
      (d) =>
        d.value === value ||
        d.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni = { value: value || `KDV_${Date.now()}`, label: ad.toLocaleUpperCase('tr') };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokKdvDepartmaniGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim();
  if (!ad) return false;
  const mevcut = oku();
  const hedef = mevcut.find((d) => d.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (d) =>
        d.value !== value && d.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((d) =>
      d.value === value
        ? { ...d, label: KORUNACAK.has(value) ? hedef.label : ad.toLocaleUpperCase('tr') }
        : d
    )
  );
  return true;
}

export function stokKdvDepartmaniSil(value: string): void {
  if (KORUNACAK.has(value)) return;
  yaz(oku().filter((d) => d.value !== value));
}

export function stokKdvDepartmaniEtiketi(value: string): string {
  return oku().find((d) => d.value === value)?.label ?? value;
}
