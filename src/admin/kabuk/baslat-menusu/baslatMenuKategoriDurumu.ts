const STORAGE_KEY = 'erp-baslat-menu-kat-kapali';

export function baslatMenuKapaliKategorileriOku(): Set<string> {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return new Set();
    const dizi = JSON.parse(ham) as unknown;
    return new Set(Array.isArray(dizi) ? dizi.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function baslatMenuKapaliKategorileriKaydet(kapali: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...kapali]));
}
