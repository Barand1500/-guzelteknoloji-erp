import type {
  StokCokluFiyatKayit,
  StokFiyatDuzenleSatir,
  StokFiyatPb,
} from './fiyatDuzenleTipler';
import { netHesapla } from './stokCokluFiyatHesap';

export type StokCokluFiyatTur = 'alis' | 'satis';

/** Ek fiyatlar — ana form alanları hariç */
const ALIS_EK = [
  'alisFiyati2',
  'alisFiyati3',
  'alisFiyati4',
  'alisFiyati5',
  'alisFiyati6',
] as const;

const SATIS_EK = [
  'satisFiyati2',
  'satisFiyati3',
  'satisFiyati4',
  'satisFiyati5',
  'satisFiyati6',
] as const;

/** Satış ek PB (pb1 ana form) */
const SATIS_EK_PB = ['pb2', 'pb3', 'pb4', 'pb5', 'pb6'] as const;

export const STOK_COKLU_FIYAT_MAX_SIRA = 99;
export const STOK_COKLU_FIYAT_ADET = STOK_COKLU_FIYAT_MAX_SIRA;

function kayitNormalize(
  k: Partial<StokCokluFiyatKayit> & { sira: number; deger: number; pb: StokFiyatPb }
): StokCokluFiyatKayit {
  const iskonto = k.iskonto ?? '';
  const deger = k.deger;
  const netTutar =
    k.netTutar !== undefined && Number.isFinite(k.netTutar)
      ? k.netTutar
      : netHesapla(deger, iskonto);
  return {
    sira: k.sira,
    aciklama: k.aciklama ?? '',
    deger,
    iskonto,
    netTutar,
    pb: k.pb,
  };
}

function anaFiyatiAyikla(
  liste: StokCokluFiyatKayit[],
  anaDeger: number | null | undefined
): StokCokluFiyatKayit[] {
  if (liste.length === 0 || anaDeger === null || anaDeger === undefined) return liste;
  if (liste[0].deger === anaDeger) return liste.slice(1);
  return liste;
}

function legacyEkFiyatListesi(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): StokCokluFiyatKayit[] {
  const liste: StokCokluFiyatKayit[] = [];
  const alanlar = tur === 'alis' ? ALIS_EK : SATIS_EK;
  for (let i = 0; i < alanlar.length; i += 1) {
    const deger = satir[alanlar[i] as keyof StokFiyatDuzenleSatir] as number | null | undefined;
    if (deger === null || deger === undefined) continue;
    const pb =
      tur === 'alis'
        ? 'TL'
        : ((satir[SATIS_EK_PB[i] as keyof StokFiyatDuzenleSatir] as StokFiyatPb | undefined) ??
          'TL');
    liste.push(kayitNormalize({ sira: i + 1, deger, pb, aciklama: '', iskonto: '' }));
  }
  return liste;
}

function numaralandir(liste: StokCokluFiyatKayit[]): StokCokluFiyatKayit[] {
  return liste.map((x, i) => kayitNormalize({ ...x, sira: i + 1 }));
}

function legacyEkAlanlarinaYaz(
  tur: StokCokluFiyatTur,
  liste: StokCokluFiyatKayit[]
): Partial<StokFiyatDuzenleSatir> {
  const patch: Record<string, unknown> = {};
  const alanlar = tur === 'alis' ? ALIS_EK : SATIS_EK;
  for (let i = 0; i < alanlar.length; i += 1) {
    const kayit = liste.find((x) => x.sira === i + 1);
    patch[alanlar[i]] = kayit?.deger ?? null;
    if (tur === 'satis') {
      patch[SATIS_EK_PB[i]] = kayit?.pb ?? 'TL';
    }
  }
  return patch as Partial<StokFiyatDuzenleSatir>;
}

/** Modal patch — ana `alisFiyati`/`pb2` veya `satisFiyati1`/`pb1` dokunulmaz */
function listePatch(
  tur: StokCokluFiyatTur,
  liste: StokCokluFiyatKayit[]
): Partial<StokFiyatDuzenleSatir> {
  const sirali = numaralandir(liste);
  if (tur === 'alis') {
    return {
      alisFiyatListesi: sirali,
      ...legacyEkAlanlarinaYaz(tur, sirali),
    };
  }
  return {
    satisFiyatListesi: sirali,
    ...legacyEkAlanlarinaYaz(tur, sirali),
  };
}

/** Modalda görünen ek fiyat listesi (ana form fiyatı hariç) */
export function stokCokluFiyatListesi(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): StokCokluFiyatKayit[] {
  const kaynak = tur === 'alis' ? satir.alisFiyatListesi : satir.satisFiyatListesi;
  const anaDeger = tur === 'alis' ? satir.alisFiyati : satir.satisFiyati1;
  if (Array.isArray(kaynak)) {
    return numaralandir(anaFiyatiAyikla(kaynak.map((k) => kayitNormalize(k)), anaDeger));
  }
  return numaralandir(legacyEkFiyatListesi(satir, tur));
}

export function stokCokluFiyatDegeri(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur,
  sira: number
): number | null {
  return stokCokluFiyatListesi(satir, tur).find((x) => x.sira === sira)?.deger ?? null;
}

export function stokCokluFiyatPbDegeri(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur,
  sira: number
): StokFiyatPb {
  return stokCokluFiyatListesi(satir, tur).find((x) => x.sira === sira)?.pb ?? 'TL';
}

export function stokCokluFiyatSonrakiSira(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number {
  const n = stokCokluFiyatListesi(satir, tur).length + 1;
  return Math.min(n, STOK_COKLU_FIYAT_MAX_SIRA);
}

/** @deprecated */
export function stokCokluFiyatIlkBosSira(
  satir: StokFiyatDuzenleSatir,
  tur: StokCokluFiyatTur
): number {
  return stokCokluFiyatSonrakiSira(satir, tur);
}

export type StokCokluFiyatKayitGirdi = {
  aciklama?: string;
  deger: number;
  iskonto?: string;
  netTutar?: number;
  pb?: StokFiyatPb;
};

export function stokCokluFiyatEkle(
  tur: StokCokluFiyatTur,
  girdi: StokCokluFiyatKayitGirdi,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  const liste = stokCokluFiyatListesi(mevcut, tur);
  if (liste.length >= STOK_COKLU_FIYAT_MAX_SIRA) return {};
  const iskonto = girdi.iskonto ?? '';
  const deger = girdi.deger;
  const netTutar =
    girdi.netTutar !== undefined ? girdi.netTutar : netHesapla(deger, iskonto);
  const kayit = kayitNormalize({
    sira: liste.length + 1,
    aciklama: girdi.aciklama ?? '',
    deger,
    iskonto,
    netTutar,
    pb: girdi.pb ?? 'TL',
  });
  return listePatch(tur, [...liste, kayit]);
}

export function stokCokluFiyatGuncelle(
  tur: StokCokluFiyatTur,
  sira: number,
  girdi: StokCokluFiyatKayitGirdi,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  const liste = stokCokluFiyatListesi(mevcut, tur);
  const onceki = liste.find((x) => x.sira === sira);
  if (!onceki) return {};
  const iskonto = girdi.iskonto ?? onceki.iskonto;
  const deger = girdi.deger;
  const netTutar =
    girdi.netTutar !== undefined ? girdi.netTutar : netHesapla(deger, iskonto);
  return listePatch(
    tur,
    liste.map((x) =>
      x.sira === sira
        ? kayitNormalize({
            sira,
            aciklama: girdi.aciklama ?? onceki.aciklama,
            deger,
            iskonto,
            netTutar,
            pb: girdi.pb ?? onceki.pb,
          })
        : x
    )
  );
}

export function stokCokluFiyatSil(
  tur: StokCokluFiyatTur,
  sira: number,
  mevcut: StokFiyatDuzenleSatir
): Partial<StokFiyatDuzenleSatir> {
  return listePatch(
    tur,
    stokCokluFiyatListesi(mevcut, tur).filter((x) => x.sira !== sira)
  );
}

export function stokCokluFiyatPatch(
  tur: StokCokluFiyatTur,
  sira: number,
  deger: number | null,
  mevcut?: StokFiyatDuzenleSatir,
  pb?: StokFiyatPb
): Partial<StokFiyatDuzenleSatir> {
  if (!mevcut) return {};
  if (deger === null) return stokCokluFiyatSil(tur, sira, mevcut);
  const onceki = stokCokluFiyatListesi(mevcut, tur).find((x) => x.sira === sira);
  if (onceki) {
    return stokCokluFiyatGuncelle(
      tur,
      sira,
      {
        deger,
        pb: pb ?? onceki.pb,
        aciklama: onceki.aciklama,
        iskonto: onceki.iskonto,
        netTutar: netHesapla(deger, onceki.iskonto),
      },
      mevcut
    );
  }
  return stokCokluFiyatEkle(tur, { deger, pb }, mevcut);
}

export function stokCokluFiyatKaydetPatch(
  tur: StokCokluFiyatTur,
  sira: number,
  deger: number | null,
  pb?: StokFiyatPb,
  mevcut?: StokFiyatDuzenleSatir,
  ekstra?: Omit<StokCokluFiyatKayitGirdi, 'deger' | 'pb'>
): Partial<StokFiyatDuzenleSatir> {
  if (!mevcut) return {};
  if (deger === null) return stokCokluFiyatSil(tur, sira, mevcut);
  const onceki = stokCokluFiyatListesi(mevcut, tur).find((x) => x.sira === sira);
  const girdi: StokCokluFiyatKayitGirdi = {
    deger,
    pb,
    aciklama: ekstra?.aciklama ?? onceki?.aciklama ?? '',
    iskonto: ekstra?.iskonto ?? onceki?.iskonto ?? '',
    netTutar: ekstra?.netTutar,
  };
  if (onceki) return stokCokluFiyatGuncelle(tur, sira, girdi, mevcut);
  return stokCokluFiyatEkle(tur, girdi, mevcut);
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
