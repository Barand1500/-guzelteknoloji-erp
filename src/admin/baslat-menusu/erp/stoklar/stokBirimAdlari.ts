const ANAHTAR = 'erp-stok-birim-adlari-v1';

export interface StokBirimAdiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokBirimAdiSecenek[] = [
  { value: 'ADET', label: 'ADET' },
  { value: 'PAKET', label: 'PAKET' },
  { value: 'KOLI', label: 'KOLİ' },
  { value: 'KUTU', label: 'KUTU' },
  { value: 'SET', label: 'SET' },
  { value: 'KG', label: 'KG' },
  { value: 'LT', label: 'LT' },
];

function oku(): StokBirimAdiSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokBirimAdiSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokBirimAdiSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function stokBirimAdlariGetir(): StokBirimAdiSecenek[] {
  return oku();
}

export function stokBirimAdlariSecenekleri(): { value: string; label: string }[] {
  return oku().map((b) => ({ value: b.label, label: b.label }));
}

export function stokBirimAdiEkle(label: string): StokBirimAdiSecenek | null {
  const ad = label.trim().toLocaleUpperCase('tr');
  if (!ad) return null;
  if (!/^[A-Z0-9ÇĞİÖŞÜ]+$/i.test(ad.replace(/\s+/g, ''))) return null;
  const value = ad.replace(/\s+/g, '_');
  const mevcut = oku();
  if (
    mevcut.some(
      (t) =>
        t.value === value ||
        t.label.toLocaleUpperCase('tr') === ad
    )
  ) {
    return null;
  }
  const yeni = { value, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokBirimAdiGuncelle(value: string, yeniLabel: string): boolean {
  const ad = yeniLabel.trim().toLocaleUpperCase('tr');
  if (!ad || !/^[A-Z0-9ÇĞİÖŞÜ]+$/i.test(ad.replace(/\s+/g, ''))) return false;
  const korunacak = new Set(['ADET']);
  const mevcut = oku();
  const hedef = mevcut.find((t) => t.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (t) => t.value !== value && t.label.toLocaleUpperCase('tr') === ad
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

export function stokBirimAdiSil(value: string): void {
  const korunacak = new Set(['ADET']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((t) => t.value !== value));
}

export function stokBirimAdiGecerli(birim: string): string {
  const ad = birim.trim().toLocaleUpperCase('tr') || 'ADET';
  const bulunan = oku().find((t) => t.label.toLocaleUpperCase('tr') === ad);
  return bulunan?.label ?? ad;
}
