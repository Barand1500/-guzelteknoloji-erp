import hamKayitlar from '@/admin/baslat-menusu/tanimlar/veri/vergiDaireleri.json';

export interface VergiDairesiKaydi {
  plaka: string;
  il: string;
  ilce: string;
  muhasebe_birimi_kodu: string;
  vergi_dairesi: string;
}

export interface TurkiyeIlKaydi {
  plaka: string;
  ad: string;
}

const kayitlar = hamKayitlar as VergiDairesiKaydi[];

const ilHaritasi = new Map<string, TurkiyeIlKaydi>();
const dairelerIlPlaka = new Map<string, VergiDairesiKaydi[]>();
const daireAdlariSet = new Set<string>();
const ilcelerIlAd = new Map<string, Set<string>>();

for (const kayit of kayitlar) {
  if (!ilHaritasi.has(kayit.plaka)) {
    ilHaritasi.set(kayit.plaka, { plaka: kayit.plaka, ad: kayit.il });
  }
  const ilceSet = ilcelerIlAd.get(kayit.il) ?? new Set<string>();
  if (kayit.ilce?.trim()) ilceSet.add(kayit.ilce.trim());
  ilcelerIlAd.set(kayit.il, ilceSet);
  const mevcut = dairelerIlPlaka.get(kayit.plaka) ?? [];
  if (!mevcut.some((d) => d.vergi_dairesi === kayit.vergi_dairesi)) {
    mevcut.push(kayit);
    daireAdlariSet.add(kayit.vergi_dairesi);
  }
  dairelerIlPlaka.set(kayit.plaka, mevcut);
}

for (const [, liste] of dairelerIlPlaka) {
  liste.sort((a, b) => a.vergi_dairesi.localeCompare(b.vergi_dairesi, 'tr'));
}

/** 81 il — plaka sırasına göre */
export const TURKIYE_ILLERI: TurkiyeIlKaydi[] = [...ilHaritasi.values()].sort(
  (a, b) => Number(a.plaka) - Number(b.plaka)
);

export const TUM_VERGI_DAIRELERI: string[] = [...daireAdlariSet].sort((a, b) =>
  a.localeCompare(b, 'tr')
);

export function vergiDaireleriIlIle(plaka: string): string[] {
  if (!plaka) return TUM_VERGI_DAIRELERI;
  return (dairelerIlPlaka.get(plaka) ?? []).map((d) => d.vergi_dairesi);
}

export function vergiDairesiIlBul(vergiDairesi: string): string {
  const kayit = kayitlar.find((k) => k.vergi_dairesi === vergiDairesi);
  return kayit?.plaka ?? '';
}

/** Seçili ile ait ilçe listesi (yazarken filtrelenir). */
export function ilcelerIlIle(ilAd: string): string[] {
  const anahtar = ilAd.trim();
  if (!anahtar) return [];

  const dogrudan = ilcelerIlAd.get(anahtar);
  if (dogrudan) return [...dogrudan].sort((a, b) => a.localeCompare(b, 'tr'));

  const buyuk = anahtar.toLocaleUpperCase('tr');
  const buyukEslesen = ilcelerIlAd.get(buyuk);
  if (buyukEslesen) return [...buyukEslesen].sort((a, b) => a.localeCompare(b, 'tr'));

  const ilKayit = TURKIYE_ILLERI.find(
    (il) => il.ad.toLocaleLowerCase('tr') === anahtar.toLocaleLowerCase('tr')
  );
  if (ilKayit) {
    const set = ilcelerIlAd.get(ilKayit.ad);
    if (set) return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }

  return [];
}

export const TURKIYE_IL_ADLARI: string[] = TURKIYE_ILLERI.map((il) => il.ad);
