/** Türkiye il / ilçe / mahalle — TurkiyeAPI, isteğe bağlı arama (≥2 harf) */

const API = 'https://api.turkiyeapi.dev/v2';
const MIN_ARAMA = 2;
const ARAMA_LIMIT = 25;

type IlKaydi = { id: number; name: string };
type IlceKaydi = { id: number; name: string };
type MahalleKaydi = { id: number; name: string; postalCode?: string };

const ilKayitlari = new Map<string, IlKaydi>();
const ilceKayitlari = new Map<string, IlceKaydi[]>();
const mahalleKayitlari = new Map<string, MahalleKaydi>();
const ilceAdlariOnbellegi = new Map<string, string[]>();
const mahalleAramaOnbellegi = new Map<string, string[]>();

let tumIllerYukleniyor: Promise<string[]> | null = null;

function ilAnahtar(il: string) {
  return il.trim().toLocaleLowerCase('tr');
}

function mahalleAnahtar(il: string, ilce: string, mahalle: string) {
  return `${ilAnahtar(il)}|${ilce.trim().toLocaleLowerCase('tr')}|${mahalle.trim().toLocaleLowerCase('tr')}`;
}

function mahalleKayitlariniYaz(il: string, ilce: string, kayitlar: MahalleKaydi[]) {
  for (const kayit of kayitlar) {
    mahalleKayitlari.set(mahalleAnahtar(il, ilce, kayit.name), kayit);
  }
}

function yerelAra(liste: string[], arama: string): string[] {
  const q = arama.trim().toLocaleLowerCase('tr');
  return liste.filter((ad) => ad.toLocaleLowerCase('tr').includes(q)).slice(0, ARAMA_LIMIT);
}

async function tumIlleriYukle(): Promise<string[]> {
  if (tumIllerYukleniyor) return tumIllerYukleniyor;

  tumIllerYukleniyor = apiGet<{ data: { id: number; name: string }[] }>(
    `/provinces?fields=id,name&limit=100&sort=name`
  ).then((yanit) => {
    illeriOnbellegeYaz(yanit.data);
    return trSirala(yanit.data.map((p) => p.name));
  });

  try {
    return await tumIllerYukleniyor;
  } catch {
    tumIllerYukleniyor = null;
    return [];
  }
}

async function ilceAdlariniYukle(il: string): Promise<string[]> {
  const anahtar = ilAnahtar(il);
  const onbellek = ilceAdlariOnbellegi.get(anahtar);
  if (onbellek) return onbellek;

  const ilKaydi = await ilKaydiniCoz(il);
  if (!ilKaydi) return [];

  const yanit = await apiGet<{ data: { id: number; name: string }[] }>(
    `/districts?provinceId=${ilKaydi.id}&fields=id,name&limit=1000&sort=name`
  );
  ilceleriOnbellegeYaz(ilKaydi.name, yanit.data);
  const liste = trSirala(yanit.data.map((d) => d.name));
  ilceAdlariOnbellegi.set(anahtar, liste);
  return liste;
}

void tumIlleriYukle().catch(() => {
  /* ilk yükleme isteğe bağlı; arama sırasında tekrar denenir */
});

function trSirala(liste: string[]) {
  return [...liste].sort((a, b) => a.localeCompare(b, 'tr'));
}

function metinBenzer(metin: string, arama: string) {
  const m = metin.trim().toLocaleLowerCase('tr');
  const q = arama.trim().toLocaleLowerCase('tr');
  return m === q || m.includes(q) || q.includes(m);
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error('Adres verisi alinamadi');
  return res.json() as Promise<T>;
}

function ilKaydiBul(il: string): IlKaydi | undefined {
  return ilKayitlari.get(ilAnahtar(il));
}

function ilceKaydiBul(il: string, ilce: string): IlceKaydi | undefined {
  const liste = ilceKayitlari.get(ilAnahtar(il));
  if (!liste?.length) return undefined;
  const q = ilce.trim().toLocaleLowerCase('tr');
  const tam = liste.find((d) => d.name.toLocaleLowerCase('tr') === q);
  if (tam) return tam;
  const benzer = liste.filter((d) => metinBenzer(d.name, ilce));
  return benzer.length === 1 ? benzer[0] : undefined;
}

function illeriOnbellegeYaz(kayitlar: { id: number; name: string }[]) {
  for (const p of kayitlar) {
    ilKayitlari.set(ilAnahtar(p.name), { id: p.id, name: p.name });
  }
}

function ilceleriOnbellegeYaz(il: string, kayitlar: { id: number; name: string }[]) {
  const mevcut = ilceKayitlari.get(ilAnahtar(il)) ?? [];
  const birlesik = new Map<number, IlceKaydi>();
  for (const k of [...mevcut, ...kayitlar.map((d) => ({ id: d.id, name: d.name }))]) {
    birlesik.set(k.id, k);
  }
  ilceKayitlari.set(ilAnahtar(il), [...birlesik.values()]);
}

async function ilKaydiniCoz(il: string): Promise<IlKaydi | undefined> {
  const mevcut = ilKaydiBul(il);
  if (mevcut) return mevcut;

  await tumIlleriYukle();
  const tam = ilKaydiBul(il);
  if (tam) return tam;

  const benzer = [...ilKayitlari.values()].filter((k) => metinBenzer(k.name, il));
  return benzer.length === 1 ? benzer[0] : undefined;
}

async function ilceKaydiniCoz(il: string, ilce: string): Promise<IlceKaydi | undefined> {
  const ilKaydi = await ilKaydiniCoz(il);
  if (!ilKaydi) return undefined;

  await ilceAdlariniYukle(ilKaydi.name);
  const mevcut = ilceKaydiBul(ilKaydi.name, ilce);
  if (mevcut) return mevcut;

  const q = ilce.trim();
  if (q.length < MIN_ARAMA) return undefined;

  const liste = ilceKayitlari.get(ilAnahtar(ilKaydi.name)) ?? [];
  const benzer = liste.filter((d) => metinBenzer(d.name, q));
  if (benzer.length === 1) return benzer[0];

  const yanit = await apiGet<{ data: { id: number; name: string }[] }>(
    `/districts?provinceId=${ilKaydi.id}&search=${encodeURIComponent(q)}&fields=id,name&limit=10`
  );
  ilceleriOnbellegeYaz(ilKaydi.name, yanit.data);

  const kesin = ilceKaydiBul(ilKaydi.name, ilce);
  if (kesin) return kesin;

  const apiBenzer = yanit.data.filter((d) => metinBenzer(d.name, q));
  if (apiBenzer.length === 1) return { id: apiBenzer[0].id, name: apiBenzer[0].name };
  if (yanit.data.length === 1) return { id: yanit.data[0].id, name: yanit.data[0].name };
  return undefined;
}

/** İl araması — önbellekten yerel filtre */
export async function turkiyeIlAra(arama: string): Promise<string[]> {
  const q = arama.trim();
  if (q.length < MIN_ARAMA) return [];
  const liste = await tumIlleriYukle();
  return yerelAra(liste, q);
}

/** İlçe araması — il seçili; önbellekten yerel filtre */
export async function turkiyeIlceAra(il: string, arama: string): Promise<string[]> {
  const q = arama.trim();
  if (!il.trim() || q.length < MIN_ARAMA) return [];
  const liste = await ilceAdlariniYukle(il);
  return yerelAra(liste, q);
}

/** Mahalle araması — en az 2 harf; ilçe tam seçilmese de benzer eşleşir */
export async function turkiyeMahalleAra(il: string, ilce: string, arama: string): Promise<string[]> {
  const q = arama.trim();
  if (!il.trim() || !ilce.trim() || q.length < MIN_ARAMA) return [];

  const onbellekAnahtar = `${ilAnahtar(il)}|${ilce.trim().toLocaleLowerCase('tr')}|${q.toLocaleLowerCase('tr')}`;
  const onbellek = mahalleAramaOnbellegi.get(onbellekAnahtar);
  if (onbellek) return onbellek;

  const ilKaydi = await ilKaydiniCoz(il);
  if (!ilKaydi) return [];

  const ilceKaydi = await ilceKaydiniCoz(il, ilce);

  const params = new URLSearchParams({
    search: q,
    fields: 'id,name,postalCode',
    limit: String(ARAMA_LIMIT),
  });

  if (ilceKaydi) {
    params.set('districtId', String(ilceKaydi.id));
  } else {
    params.set('provinceId', String(ilKaydi.id));
  }

  const yanit = await apiGet<{ data: MahalleKaydi[] }>(`/neighborhoods?${params.toString()}`);
  mahalleKayitlariniYaz(ilKaydi.name, ilceKaydi?.name ?? ilce, yanit.data);
  const sonuc = trSirala(yanit.data.map((m) => m.name));
  mahalleAramaOnbellegi.set(onbellekAnahtar, sonuc);
  return sonuc;
}

/** İl kayıtlı mı (önbellekte tam eşleşme) */
export function turkiyeIlKayitliMi(il: string): boolean {
  return !!ilKaydiBul(il);
}

/** Önbellekteki kanonik il adını döndürür */
export function turkiyeIlAdiniDuzelt(il: string): string {
  return ilKaydiBul(il)?.name ?? il;
}

/** İl seçildiğinde ilçe listesini önceden yükler */
export async function turkiyeIlceOnbellekYukle(il: string): Promise<void> {
  if (!il.trim()) return;
  await ilceAdlariniYukle(il);
}

/** Seçilen mahallenin posta kodunu TurkiyeAPI'den döndürür */
export async function turkiyeMahallePostaKoduBul(
  il: string,
  ilce: string,
  mahalle: string
): Promise<string> {
  const ad = mahalle.trim();
  if (!il.trim() || !ilce.trim() || !ad) return '';

  const onbellek = mahalleKayitlari.get(mahalleAnahtar(il, ilce, ad));
  if (onbellek?.postalCode) return onbellek.postalCode;

  const ilceKaydi = await ilceKaydiniCoz(il, ilce);
  if (!ilceKaydi) return '';

  const yanit = await apiGet<{ data: MahalleKaydi[] }>(
    `/neighborhoods?districtId=${ilceKaydi.id}&search=${encodeURIComponent(ad)}&fields=id,name,postalCode&limit=10`
  );
  mahalleKayitlariniYaz(il, ilceKaydi.name, yanit.data);

  const q = ad.toLocaleLowerCase('tr');
  const tam = yanit.data.find((m) => m.name.toLocaleLowerCase('tr') === q);
  if (tam?.postalCode) return tam.postalCode;

  const benzer = yanit.data.filter((m) => metinBenzer(m.name, ad));
  if (benzer.length === 1 && benzer[0].postalCode) return benzer[0].postalCode;

  return onbellek?.postalCode ?? '';
}

/**
 * Sokak araması — TurkiyeAPI'de sokak verisi yok; OSM Nominatim kullanılır.
 * İl ve ilçe seçili olmalı; mahalle varsa sonuçlar daraltılır.
 */
export async function turkiyeSokakAra(
  il: string,
  ilce: string,
  mahalle: string,
  arama: string
): Promise<string[]> {
  const q = arama.trim();
  if (!il.trim() || !ilce.trim() || q.length < MIN_ARAMA) return [];

  try {
    const params = new URLSearchParams({
      street: q,
      city: ilce.trim(),
      county: il.trim(),
      countrycodes: 'tr',
      format: 'json',
      addressdetails: '1',
      limit: '20',
    });
    if (mahalle.trim()) params.set('suburb', mahalle.trim());

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'Accept-Language': 'tr',
        'User-Agent': 'GuzelTeknoloji-ERP/1.0 (address-autocomplete)',
      },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as Array<{ address?: Record<string, string> }>;
    const yollar = new Set<string>();
    const qKucuk = q.toLocaleLowerCase('tr');

    for (const oge of data) {
      const adres = oge.address;
      if (!adres) continue;
      for (const alan of ['road', 'pedestrian', 'residential', 'footway', 'path'] as const) {
        const yol = adres[alan]?.trim();
        if (yol && yol.toLocaleLowerCase('tr').includes(qKucuk)) yollar.add(yol);
      }
    }

    return trSirala([...yollar]).slice(0, ARAMA_LIMIT);
  } catch {
    return [];
  }
}

/** Vergi dairesi filtresi için plaka (01, 34 …) */
export function ilAdindanPlaka(ilAd: string): string {
  const kayit = ilKaydiBul(ilAd);
  return kayit ? String(kayit.id).padStart(2, '0') : '';
}

/** Plakadan il adı */
export function plakadanIlAd(plaka: string): string {
  const id = Number.parseInt(plaka, 10);
  if (!Number.isFinite(id)) return '';
  for (const kayit of ilKayitlari.values()) {
    if (kayit.id === id) return kayit.name;
  }
  return '';
}

/** Plakadan il adı (gerekirse API'den tek kayıt yükler) */
export async function turkiyeIlAdiniPlakadanYukle(plaka: string): Promise<string> {
  const mevcut = plakadanIlAd(plaka);
  if (mevcut) return mevcut;

  const id = Number.parseInt(plaka, 10);
  if (!Number.isFinite(id)) return '';

  try {
    const yanit = await apiGet<{ data: { id: number; name: string } }>(
      `/provinces/${id}?fields=id,name`
    );
    illeriOnbellegeYaz([yanit.data]);
    return yanit.data.name;
  } catch {
    return '';
  }
}

export const MIN_ADRES_ARAMA_UZUNLUGU = MIN_ARAMA;
