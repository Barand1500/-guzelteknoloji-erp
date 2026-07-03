/** Türkiye il / ilçe — TurkiyeAPI önbelleği (ilk kullanımda yüklenir) */

const API = 'https://api.turkiyeapi.dev/v2';

let illerCache: string[] | null = null;
let ilIdMap: Map<string, number> | null = null;
const ilceCache = new Map<string, string[]>();

function trSirala(liste: string[]) {
  return [...liste].sort((a, b) => a.localeCompare(b, 'tr'));
}

function metinEslestir(metin: string, arama: string) {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return metin.toLocaleLowerCase('tr').includes(q);
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error('Il/ilce verisi alinamadi');
  return res.json() as Promise<T>;
}

export async function turkiyeIlleriniYukle(): Promise<string[]> {
  if (illerCache) return illerCache;
  const yanit = await apiGet<{ data: { id: number; name: string }[] }>('/provinces?fields=id,name&limit=100');
  ilIdMap = new Map(yanit.data.map((p) => [p.name, p.id]));
  illerCache = trSirala(yanit.data.map((p) => p.name));
  return illerCache;
}

export async function turkiyeIlceleriniYukle(il: string): Promise<string[]> {
  const anahtar = il.trim();
  const onbellek = ilceCache.get(anahtar);
  if (onbellek) return onbellek;

  if (!ilIdMap) await turkiyeIlleriniYukle();
  let ilId = ilIdMap?.get(anahtar);
  if (!ilId && ilIdMap) {
    const q = anahtar.toLocaleLowerCase('tr');
    for (const [ad, id] of ilIdMap.entries()) {
      if (ad.toLocaleLowerCase('tr') === q) {
        ilId = id;
        break;
      }
    }
  }
  if (!ilId) return [];

  const yanit = await apiGet<{ data: { name: string }[] }>(
    `/provinces/${ilId}/districts?fields=name&limit=200`
  );
  const liste = trSirala(yanit.data.map((d) => d.name));
  ilceCache.set(anahtar, liste);
  return liste;
}

export function illeriFiltrele(iller: string[], arama: string, limit = 12) {
  return iller.filter((il) => metinEslestir(il, arama)).slice(0, limit);
}

export function ilceleriFiltrele(ilceler: string[], arama: string, limit = 12) {
  return ilceler.filter((ilce) => metinEslestir(ilce, arama)).slice(0, limit);
}

/** API erişilemezse minimum yedek liste */
export const YEDEK_ILLER = trSirala([
  'Adana',
  'Ankara',
  'Antalya',
  'Bursa',
  'Denizli',
  'Gaziantep',
  'Istanbul',
  'Izmir',
  'Kayseri',
  'Kocaeli',
  'Mersin',
  'Samsun',
]);
