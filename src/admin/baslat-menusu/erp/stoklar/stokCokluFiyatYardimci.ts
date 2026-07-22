import type {
  StokCokluFiyatKayit,
  StokFiyatDuzenleSatir,
  StokFiyatPb,
} from './fiyatDuzenleTipler';

export type StokCokluFiyatTur = 'alis' | 'satis';

const ALIS_LEGACY = [
  'alisFiyati',
  'alisFiyati2',
  'alisFiyati3',
  'alisFiyati4',
  'alisFiyati5',
  'alisFiyati6',
] as const;

const SATIS_LEGACY = [
  'satisFiyati1',
  'satisFiyati2',
  'satisFiyati3',
  'satisFiyati4',
  'satisFiyati5',
  'satisFiyati6',
] as const;

const PB_LEGACY = ['pb1', 'pb2', 'pb3', 'pb4', 'pb5', 'pb6'] as const;

/** Üst sınır — pratik limit (sıra girişi) */
export const STOK_COKLU_FIYAT_MAX_SIRA = 99;

/** Eski sabit 6 limit — UI geriye dönük uyumluluk için */
export const STOK_COKLU_FIYAT_ADET = STOK_COKLU_FIYAT_MAX_SIRA;

function legacyFiyatListesi(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): StokCokluFiyatKayit[] {
  const liste: StokCokluFiyatKayit[] = [];
  const alanlar = tur === 'alis' ? ALIS_LEGACY : SATIS_LEGACY;
  for (let i = 0; i < alanlar.length; i += 1) {
    const deger = satir[alanlar[i] as keyof StokFiyatDuzenleSatir] as number | null | undefined;
    if (deger === null || deger === undefined) continue;
    const pb =
      tur === 'alis'
        ? satir.pb2
        : ((satir[PB_LEGACY[i] as keyof StokFiyatDuzenleSatir] as StokFiyatPb | undefined) ?? 'TL');
    liste.push({ sira: i + 1, deger, pb });
  }
  return liste;
}

export function stokCokluFiyatListesi(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): StokCokluFiyatKayit[] {
  const kaynak = tur === 'alis' ? satir.alisFiyatListesi : satir.satisFiyatListesi;
  if (Array.isArray(kaynak)) {
    return [...kaynak].sort((a, b) => a.sira - b.sira);
  }
  return legacyFiyatListesi(satir, tur);
}

function legacyAlanlarinaYaz(
  tur: StokCokluFiyatTur,
  liste: StokCokluFiyatKayit[]
): Partial<StokFiyatDuzenleSatir> {
  const patch: Record<string, unknown> = {};
  const alanlar = tur === 'alis' ? ALIS_LEGACY : SATIS_LEGACY;
  for (let i = 0; i < alanlar.length; i += 1) {
    const kayit = liste.find((x) => x.sira === i + 1);
    patch[alanlar[i]] = kayit?.deger ?? null;
    if (tur === 'satis') {
      patch[PB_LEGACY[i]] = kayit?.pb ?? 'TL';
    }
  }
  if (tur === 'alis') {
    const birincil = liste.find((x) => x.sira === 1);
    patch.pb2 = birincil?.pb ?? 'TL';
  }
  return patch as Partial<StokFiyatDuzenleSatir>;
}

function listePatch(
  tur: StokCokluFiyatTur,
  liste: StokCokluFiyatKayit[]
): Partial<StokFiyatDuzenleSatir> {
  const sirali = [...liste].sort((a, b) => a.sira - b.sira);
  const birincil = sirali.find((x) => x.sira === 1);
  if (tur === 'alis') {
    return {
      alisFiyatListesi: sirali,
      alisFiyati: birincil?.deger ?? null,
      ...legacyAlanlarinaYaz(tur, sirali),
    };
  }
  return {
    satisFiyatListesi: sirali,
    satisFiyati1: birincil?.deger ?? null,
    pb1: birincil?.pb ?? 'TL',
    ...legacyAlanlarinaYaz(tur, sirali),
  };
}

export function stokCokluFiyatDegeri(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur,
  sira: number
): number | null {
  return stokCokluFiyatListesi(satir, tur).find((x) => x.sira === sira)?.deger ?? null;
}

export function stokCokluFiyatPatch(
  tur: StokCokluFiyatTur,
  sira: number,
  deger: number | null,
  mevcut?: StokFiyatDuzenleSatir,
  pb?: StokFiyatPb
): Partial<StokFiyatDuzenleSatir> {
  if (!stokCokluFiyatSiraGecerliMi(sira)) return {};
  const kaynak = mevcut ? stokCokluFiyatListesi(mevcut, tur) : [];
  const kalan = kaynak.filter((x) => x.sira !== sira);
  if (deger !== null) {
    const oncekiPb = kaynak.find((x) => x.sira === sira)?.pb ?? pb ?? 'TL';
    kalan.push({ sira, deger, pb: pb ?? oncekiPb });
  }
  return listePatch(tur, kalan);
}

export function stokCokluFiyatTasi(
  tur: StokCokluFiyatTur,
  eskiSira: number,
  yeniSira: number,
  deger: number | null,
  mevcut: StokFiyatDuzenleSatir,
  pb?: StokFiyatPb
): Partial<StokFiyatDuzenleSatir> {
  if (!stokCokluFiyatSiraGecerliMi(eskiSira) || !stokCokluFiyatSiraGecerliMi(yeniSira)) {
    return {};
  }
  const kaynak = stokCokluFiyatListesi(mevcut, tur).filter(
    (x) => x.sira !== eskiSira && x.sira !== yeniSira
  );
  if (deger !== null) {
    const oncekiPb =
      stokCokluFiyatListesi(mevcut, tur).find((x) => x.sira === eskiSira)?.pb ?? pb ?? 'TL';
    kaynak.push({ sira: yeniSira, deger, pb: pb ?? oncekiPb });
  }
  return listePatch(tur, kaynak);
}

export function stokCokluFiyatSiraGecerliMi(sira: number): boolean {
  return Number.isInteger(sira) && sira >= 1 && sira <= STOK_COKLU_FIYAT_MAX_SIRA;
}

export function stokCokluFiyatEtiketi(tur: StokCokluFiyatTur, sira: number): string {
  const kok = tur === 'alis' ? 'Alış Fiyatı' : 'Satış Fiyatı';
  return `${sira}. ${kok}`;
}

export function stokCokluFiyatDoluSiralar(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number[] {
  return stokCokluFiyatListesi(satir, tur).map((x) => x.sira);
}

export function stokCokluFiyatIlkBosSira(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number {
  const dolu = new Set(stokCokluFiyatListesi(satir, tur).map((x) => x.sira));
  for (let sira = 1; sira <= STOK_COKLU_FIYAT_MAX_SIRA; sira += 1) {
    if (!dolu.has(sira)) return sira;
  }
  return STOK_COKLU_FIYAT_MAX_SIRA;
}

export function stokCokluFiyatPbDegeri(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur,
  sira: number
): StokFiyatPb {
  return stokCokluFiyatListesi(satir, tur).find((x) => x.sira === sira)?.pb ?? 'TL';
}

export function stokCokluFiyatKaydetPatch(
  tur: StokCokluFiyatTur,
  sira: number,
  deger: number | null,
  pb?: StokFiyatPb,
  mevcut?: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  return stokCokluFiyatPatch(tur, sira, deger, mevcut, pb);
}

export function stokCokluFiyatTasiKaydetPatch(
  tur: StokCokluFiyatTur,
  eskiSira: number,
  yeniSira: number,
  deger: number | null,
  pb?: StokFiyatPb,
  mevcut?: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  if (!mevcut) return {};
  if (eskiSira === yeniSira) return stokCokluFiyatKaydetPatch(tur, yeniSira, deger, pb, mevcut);
  return stokCokluFiyatTasi(tur, eskiSira, yeniSira, deger, mevcut, pb);
}
