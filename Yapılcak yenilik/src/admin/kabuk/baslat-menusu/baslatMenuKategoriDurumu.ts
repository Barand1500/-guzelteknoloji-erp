const STORAGE_KEY = 'restorant-baslat-menu-kat-kapali';
const SON_KATEGORI_KEY = 'restorant-baslat-menu-son-kategori';
const SCROLL_KEY = 'restorant-baslat-menu-scroll';

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

export function baslatMenuSonKategoriOku(): string | null {
  try {
    const ham = localStorage.getItem(SON_KATEGORI_KEY);
    return ham && typeof ham === 'string' ? ham : null;
  } catch {
    return null;
  }
}

export function baslatMenuSonKategoriKaydet(kategori: string) {
  localStorage.setItem(SON_KATEGORI_KEY, kategori);
}

export function baslatMenuScrollOku(): number {
  try {
    const ham = localStorage.getItem(SCROLL_KEY);
    const n = Number(ham);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function baslatMenuScrollKaydet(scrollTop: number) {
  localStorage.setItem(SCROLL_KEY, String(Math.max(0, scrollTop)));
}
