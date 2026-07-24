const ANAHTAR = 'erp-banka-anlasmalari-bankalar-v2';

export interface BankaSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: BankaSecenek[] = [
  { value: 'AKBANK', label: 'Akbank' },
  { value: 'DENIZBANK', label: 'DenizBank' },
  { value: 'GARANTI', label: 'Garanti BBVA' },
  { value: 'HALKBANK', label: 'Halkbank' },
  { value: 'ISBANK', label: 'İş Bankası' },
  { value: 'QNB', label: 'QNB Finansbank' },
  { value: 'TEB', label: 'TEB' },
  { value: 'VAKIFBANK', label: 'VakıfBank' },
  { value: 'YAPIKREDI', label: 'Yapı Kredi' },
  { value: 'ZIRAAT', label: 'Ziraat Bankası' },
];

function alfabetikSirala(liste: BankaSecenek[]): BankaSecenek[] {
  return [...liste].sort((a, b) =>
    a.label.localeCompare(b.label, 'tr', { sensitivity: 'base' })
  );
}

function oku(): BankaSecenek[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as BankaSecenek[];
      if (Array.isArray(liste) && liste.length > 0) return alfabetikSirala(liste);
    }
  } catch {
    /* bozuk */
  }
  return alfabetikSirala(VARSAYILAN);
}

function yaz(liste: BankaSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(alfabetikSirala(liste)));
}

export function bankalariGetir(): BankaSecenek[] {
  return alfabetikSirala(oku());
}

export function bankaEkle(label: string): BankaSecenek | null {
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
  const yeni = { value: value || `BANKA_${Date.now()}`, label: ad };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function bankaGuncelle(value: string, yeniLabel: string): boolean {
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

export function bankaSil(value: string): void {
  yaz(oku().filter((t) => t.value !== value));
}

export function bankaEtiketi(value: string): string {
  return bankalariGetir().find((t) => t.value === value)?.label ?? value;
}
