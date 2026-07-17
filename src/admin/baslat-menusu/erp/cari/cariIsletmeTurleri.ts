const ANAHTAR = 'erp-cari-isletme-turleri-v2';

export interface CariIsletmeTuruSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: CariIsletmeTuruSecenek[] = [
  { value: 'TUZEL', label: 'Tüzel' },
  { value: 'GERCEK', label: 'Gerçek' },
  { value: 'YABANCI', label: 'Yabancı' },
];

function oku(): CariIsletmeTuruSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as CariIsletmeTuruSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: CariIsletmeTuruSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function cariIsletmeTurleriGetir(): CariIsletmeTuruSecenek[] {
  return oku();
}

export function cariIsletmeTuruEkle(label: string): CariIsletmeTuruSecenek | null {
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
  const yeni = { value: value || `TUR_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function cariIsletmeTuruSil(value: string): void {
  const korunacak = new Set(['TUZEL', 'GERCEK', 'YABANCI']);
  if (korunacak.has(value)) return;
  yaz(oku().filter((t) => t.value !== value));
}

export function isletmeTuruKimlikModu(
  tur: string
): 'tuzel' | 'gercek' | 'yabanci' {
  const v = tur.trim().toUpperCase();
  if (v === 'GERCEK') return 'gercek';
  if (v === 'YABANCI') return 'yabanci';
  return 'tuzel';
}
