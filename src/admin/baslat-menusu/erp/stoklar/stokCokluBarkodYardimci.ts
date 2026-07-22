import type {
  StokBarkodTipi,
  StokCokluBarkodKayit,
  StokFiyatDuzenleSatir,
} from './fiyatDuzenleTipler';

const LEGACY_BARKOD_ALANLARI = [
  'barkod',
  'barkod2',
  'barkod3',
  'barkod4',
  'barkod5',
  'barkod6',
] as const;
const LEGACY_TIP_ALANLARI = [
  'barkodTip',
  'barkodTip2',
  'barkodTip3',
  'barkodTip4',
  'barkodTip5',
  'barkodTip6',
] as const;

/** Üst sınır — pratik limit (sıra girişi) */
export const STOK_COKLU_BARKOD_MAX_SIRA = 99;

function legacyBarkodListesi(satir: StokFiyatDuzenleSatir): StokCokluBarkodKayit[] {
  const liste: StokCokluBarkodKayit[] = [];
  for (let i = 0; i < LEGACY_BARKOD_ALANLARI.length; i += 1) {
    const deger = String(
      (satir[LEGACY_BARKOD_ALANLARI[i] as keyof StokFiyatDuzenleSatir] as string | undefined) ?? ''
    ).trim();
    if (!deger) continue;
    const tip =
      (satir[LEGACY_TIP_ALANLARI[i] as keyof StokFiyatDuzenleSatir] as StokBarkodTipi | undefined) ??
      'EAN13';
    liste.push({ sira: i + 1, deger, tip });
  }
  return liste;
}

function legacyAlanlarinaYaz(liste: StokCokluBarkodKayit[]): Partial<StokFiyatDuzenleSatir> {
  const patch: Partial<StokFiyatDuzenleSatir> = {};
  for (let i = 0; i < LEGACY_BARKOD_ALANLARI.length; i += 1) {
    const kayit = liste.find((x) => x.sira === i + 1);
    (patch as Record<string, unknown>)[LEGACY_BARKOD_ALANLARI[i]] = kayit?.deger ?? '';
    (patch as Record<string, unknown>)[LEGACY_TIP_ALANLARI[i]] = kayit?.tip ?? 'EAN13';
  }
  return patch;
}

export function stokCokluBarkodListesi(satir: StokFiyatDuzenleSatir): StokCokluBarkodKayit[] {
  if (Array.isArray(satir.barkodlar)) {
    return [...satir.barkodlar]
      .filter((x) => x.deger.trim() !== '')
      .sort((a, b) => a.sira - b.sira);
  }
  return legacyBarkodListesi(satir);
}

export function stokCokluBarkodDegeri(satir: StokFiyatDuzenleSatir, sira: number): string {
  return stokCokluBarkodListesi(satir).find((x) => x.sira === sira)?.deger ?? '';
}

export function stokCokluBarkodTipi(satir: StokFiyatDuzenleSatir, sira: number): StokBarkodTipi {
  return stokCokluBarkodListesi(satir).find((x) => x.sira === sira)?.tip ?? 'EAN13';
}

export function stokCokluBarkodDoluMu(satir: StokFiyatDuzenleSatir, sira: number): boolean {
  return stokCokluBarkodDegeri(satir, sira).trim() !== '';
}

function listePatch(liste: StokCokluBarkodKayit[]): Partial<StokFiyatDuzenleSatir> {
  const sirali = [...liste]
    .filter((x) => x.deger.trim() !== '')
    .sort((a, b) => a.sira - b.sira);
  const birincil = sirali.find((x) => x.sira === 1);
  return {
    barkodlar: sirali,
    barkod: birincil?.deger ?? '',
    barkodTip: birincil?.tip ?? 'EAN13',
    ...legacyAlanlarinaYaz(sirali),
  };
}

export function stokCokluBarkodPatch(
  sira: number,
  deger: string,
  tip: StokBarkodTipi = 'EAN13',
  mevcut?: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  if (!stokCokluBarkodSiraGecerliMi(sira)) return {};
  const kaynak = mevcut ? stokCokluBarkodListesi(mevcut) : [];
  const temiz = deger.trim();
  const kalan = kaynak.filter((x) => x.sira !== sira);
  if (temiz) kalan.push({ sira, deger: temiz, tip });
  return listePatch(kalan);
}

export function stokCokluBarkodTasi(
  eskiSira: number,
  yeniSira: number,
  deger: string,
  tip: StokBarkodTipi,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  if (!stokCokluBarkodSiraGecerliMi(eskiSira) || !stokCokluBarkodSiraGecerliMi(yeniSira)) {
    return {};
  }
  const kaynak = stokCokluBarkodListesi(mevcut).filter(
    (x) => x.sira !== eskiSira && x.sira !== yeniSira
  );
  const temiz = deger.trim();
  if (temiz) kaynak.push({ sira: yeniSira, deger: temiz, tip });
  return listePatch(kaynak);
}

export function stokCokluBarkodSiraGecerliMi(sira: number): boolean {
  return Number.isInteger(sira) && sira >= 1 && sira <= STOK_COKLU_BARKOD_MAX_SIRA;
}

export function stokCokluBarkodEtiketi(sira: number): string {
  return `${sira}. Barkod`;
}

export function stokCokluBarkodIlkBosSira(satir: StokFiyatDuzenleSatir): number {
  const dolu = new Set(stokCokluBarkodListesi(satir).map((x) => x.sira));
  for (let sira = 1; sira <= STOK_COKLU_BARKOD_MAX_SIRA; sira += 1) {
    if (!dolu.has(sira)) return sira;
  }
  return STOK_COKLU_BARKOD_MAX_SIRA;
}

/** Eski sabit 6 limit — UI geriye dönük uyumluluk için */
export const STOK_COKLU_BARKOD_ADET = STOK_COKLU_BARKOD_MAX_SIRA;
