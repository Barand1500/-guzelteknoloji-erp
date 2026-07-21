import { urunleriGetir } from '@/admin/baslat-menusu/erp/urun-yonetimi/api';

const ANAHTAR = 'erp-stok-markalari-v1';

/** Marka aramasında en az bu kadar harf yazılınca öneri gösterilir. */
export const MIN_MARKA_ARAMA_UZUNLUGU = 2;

const MARKA_ONERI_LIMIT = 30;

function normalizeMarka(marka: string): string {
  return marka.trim().toLocaleUpperCase('tr');
}

function oku(): string[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as string[];
      if (Array.isArray(liste)) {
        return [...new Set(liste.map(normalizeMarka).filter(Boolean))];
      }
    }
  } catch {
    /* bozuk */
  }
  return [];
}

function yaz(liste: string[]) {
  localStorage.setItem(
    ANAHTAR,
    JSON.stringify([...new Set(liste.map(normalizeMarka).filter(Boolean))])
  );
}

export function stokMarkaEkle(marka: string): void {
  const ad = normalizeMarka(marka);
  if (!ad) return;
  const mevcut = oku();
  if (mevcut.some((m) => m.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'))) return;
  yaz([...mevcut, ad]);
}

let apiMarkaCache: string[] | null = null;
let apiMarkaPromise: Promise<string[]> | null = null;

async function urunMarkalariniGetir(): Promise<string[]> {
  if (apiMarkaCache) return apiMarkaCache;
  if (!apiMarkaPromise) {
    apiMarkaPromise = urunleriGetir()
      .then((urunler) => {
        const set = new Set<string>();
        for (const u of urunler) {
          const ad = normalizeMarka(u.marka ?? '');
          if (ad) set.add(ad);
        }
        apiMarkaCache = [...set];
        return apiMarkaCache;
      })
      .catch(() => []);
  }
  return apiMarkaPromise;
}

export function markaCacheSifirla(): void {
  apiMarkaCache = null;
  apiMarkaPromise = null;
}

/** Yazılan metni içeren markaları (Türkçe duyarlı) döndürür. */
export async function markaAra(arama: string): Promise<string[]> {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (q.length < MIN_MARKA_ARAMA_UZUNLUGU) return [];

  const yerel = oku();
  const urunMarkalari = await urunMarkalariniGetir();
  const birlesik = [...new Set([...yerel, ...urunMarkalari])];

  return birlesik
    .filter((m) => m.toLocaleLowerCase('tr').includes(q))
    .sort((a, b) => a.localeCompare(b, 'tr'))
    .slice(0, MARKA_ONERI_LIMIT);
}
