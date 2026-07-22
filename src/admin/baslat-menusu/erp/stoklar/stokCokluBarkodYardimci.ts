import type {
  StokBarkodTipi,
  StokCokluBarkodKayit,
  StokFiyatDuzenleSatir,
} from './fiyatDuzenleTipler';

/** Ek barkodlar (ana form `barkod` / `barkodTip` hariç) */
const LEGACY_EK_BARKOD_ALANLARI = [
  'barkod2',
  'barkod3',
  'barkod4',
  'barkod5',
  'barkod6',
] as const;
const LEGACY_EK_TIP_ALANLARI = [
  'barkodTip2',
  'barkodTip3',
  'barkodTip4',
  'barkodTip5',
  'barkodTip6',
] as const;

export const STOK_COKLU_BARKOD_MAX_SIRA = 99;
export const STOK_COKLU_BARKOD_ADET = STOK_COKLU_BARKOD_MAX_SIRA;

function tipNormalize(tip: StokBarkodTipi | undefined): StokBarkodTipi {
  return tip ?? '';
}

/** Eski birleşik listede 1. sıra ana barkod ile aynıysa çıkar (migrasyon). */
function anaBarkoduAyikla(
  liste: StokCokluBarkodKayit[],
  anaBarkod: string
): StokCokluBarkodKayit[] {
  const ana = anaBarkod.trim();
  if (!ana || liste.length === 0) return liste;
  const ilk = liste[0];
  if (ilk.deger.trim() === ana) return liste.slice(1);
  return liste;
}

function legacyEkBarkodListesi(satir: StokFiyatDuzenleSatir): StokCokluBarkodKayit[] {
  const liste: StokCokluBarkodKayit[] = [];
  for (let i = 0; i < LEGACY_EK_BARKOD_ALANLARI.length; i += 1) {
    const deger = String(
      (satir[LEGACY_EK_BARKOD_ALANLARI[i] as keyof StokFiyatDuzenleSatir] as string | undefined) ??
        ''
    ).trim();
    if (!deger) continue;
    const tip = tipNormalize(
      satir[LEGACY_EK_TIP_ALANLARI[i] as keyof StokFiyatDuzenleSatir] as StokBarkodTipi | undefined
    );
    liste.push({ sira: i + 1, deger, tip });
  }
  return liste;
}

function numaralandir(liste: StokCokluBarkodKayit[]): StokCokluBarkodKayit[] {
  return liste
    .filter((x) => x.deger.trim() !== '')
    .map((x, i) => ({ ...x, sira: i + 1, tip: tipNormalize(x.tip) }));
}

function legacyEkAlanlarinaYaz(liste: StokCokluBarkodKayit[]): Partial<StokFiyatDuzenleSatir> {
  const patch: Record<string, unknown> = {};
  for (let i = 0; i < LEGACY_EK_BARKOD_ALANLARI.length; i += 1) {
    const kayit = liste.find((x) => x.sira === i + 1);
    patch[LEGACY_EK_BARKOD_ALANLARI[i]] = kayit?.deger ?? '';
    patch[LEGACY_EK_TIP_ALANLARI[i]] = kayit?.tip ?? '';
  }
  return patch as Partial<StokFiyatDuzenleSatir>;
}

/** Modal patch — ana `barkod` / `barkodTip` dokunulmaz */
function listePatch(liste: StokCokluBarkodKayit[]): Partial<StokFiyatDuzenleSatir> {
  const sirali = numaralandir(liste);
  return {
    barkodlar: sirali,
    ...legacyEkAlanlarinaYaz(sirali),
  };
}

/** Modalda görünen ek barkod listesi (ana form barkodu hariç) */
export function stokCokluBarkodListesi(satir: StokFiyatDuzenleSatir): StokCokluBarkodKayit[] {
  if (Array.isArray(satir.barkodlar)) {
    return numaralandir(anaBarkoduAyikla(satir.barkodlar, satir.barkod ?? ''));
  }
  return numaralandir(legacyEkBarkodListesi(satir));
}

export function stokCokluBarkodDegeri(satir: StokFiyatDuzenleSatir, sira: number): string {
  return stokCokluBarkodListesi(satir).find((x) => x.sira === sira)?.deger ?? '';
}

export function stokCokluBarkodTipi(satir: StokFiyatDuzenleSatir, sira: number): StokBarkodTipi {
  return stokCokluBarkodListesi(satir).find((x) => x.sira === sira)?.tip ?? '';
}

export function stokCokluBarkodDoluMu(satir: StokFiyatDuzenleSatir, sira: number): boolean {
  return stokCokluBarkodDegeri(satir, sira).trim() !== '';
}

export function stokCokluBarkodSonrakiSira(satir: StokFiyatDuzenleSatir): number {
  const n = stokCokluBarkodListesi(satir).length + 1;
  return Math.min(n, STOK_COKLU_BARKOD_MAX_SIRA);
}

/** @deprecated */
export function stokCokluBarkodIlkBosSira(satir: StokFiyatDuzenleSatir): number {
  return stokCokluBarkodSonrakiSira(satir);
}

export function stokCokluBarkodEkle(
  deger: string,
  tip: StokBarkodTipi,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  const temiz = deger.trim();
  if (!temiz) return {};
  const liste = stokCokluBarkodListesi(mevcut);
  if (liste.length >= STOK_COKLU_BARKOD_MAX_SIRA) return {};
  return listePatch([...liste, { sira: liste.length + 1, deger: temiz, tip: tipNormalize(tip) }]);
}

export function stokCokluBarkodGuncelle(
  sira: number,
  deger: string,
  tip: StokBarkodTipi,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  const temiz = deger.trim();
  const liste = stokCokluBarkodListesi(mevcut);
  if (!temiz) {
    return listePatch(liste.filter((x) => x.sira !== sira));
  }
  return listePatch(
    liste.map((x) =>
      x.sira === sira ? { ...x, deger: temiz, tip: tipNormalize(tip) } : x
    )
  );
}

export function stokCokluBarkodSil(
  sira: number,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  return listePatch(stokCokluBarkodListesi(mevcut).filter((x) => x.sira !== sira));
}

export function stokCokluBarkodPatch(
  sira: number,
  deger: string,
  tip: StokBarkodTipi = '',
  mevcut?: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  if (!mevcut) return {};
  const temiz = deger.trim();
  if (!temiz) return stokCokluBarkodSil(sira, mevcut);
  if (stokCokluBarkodDoluMu(mevcut, sira)) {
    return stokCokluBarkodGuncelle(sira, temiz, tip, mevcut);
  }
  return stokCokluBarkodEkle(temiz, tip, mevcut);
}

export function stokCokluBarkodSiraGecerliMi(sira: number): boolean {
  return Number.isInteger(sira) && sira >= 1 && sira <= STOK_COKLU_BARKOD_MAX_SIRA;
}

export function stokCokluBarkodEtiketi(sira: number): string {
  return `${sira}. Barkod`;
}
