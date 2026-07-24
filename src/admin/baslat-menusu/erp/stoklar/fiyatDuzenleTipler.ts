import {
  paraBirimiEtiketi,
  paraBirimiSecenekleri,
  paraBirimiSembolu,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

export type StokFiyatPb = string;

export type StokFiyatKdvTipi = 'dahil' | 'haric';

export type StokBarkodTipi =
  | 'EAN8'
  | 'EAN13'
  | 'UPC'
  | 'CODE39'
  | 'CODE93'
  | 'CODE128'
  | 'GRAMAJ'
  | 'ADET'
  | '';

/** İşaretli alan — diğer fiyatları buna göre kopyalamak için */
export type IsaretliFiyatAlani =
  | 'satisFiyati1'
  | 'satisFiyati2'
  | 'satisFiyati3'
  | 'satisFiyati4'
  | 'satisFiyati5'
  | 'satisFiyati6'
  | 'alisFiyati';

export type StokFiyatPbAlani = 'pb1' | 'pb2' | 'pb3' | 'pb4' | 'pb5' | 'pb6';

export type StokCokluBarkodKayit = {
  sira: number;
  deger: string;
  tip: StokBarkodTipi;
};

export type StokCokluFiyatKayit = {
  sira: number;
  aciklama: string;
  deger: number;
  iskonto: string;
  netTutar: number;
  pb: StokFiyatPb;
};

export interface StokFiyatDuzenleSatir {
  id: string;
  fiyatAdi: string;
  birim: string;
  carpan: number;
  barkod: string;
  barkodTip?: StokBarkodTipi;
  barkod2?: string;
  barkodTip2?: StokBarkodTipi;
  barkod3?: string;
  barkodTip3?: StokBarkodTipi;
  barkod4?: string;
  barkodTip4?: StokBarkodTipi;
  barkod5?: string;
  barkodTip5?: StokBarkodTipi;
  barkod6?: string;
  barkodTip6?: StokBarkodTipi;
  /** Sınırsız barkod listesi (kaynak) */
  barkodlar?: StokCokluBarkodKayit[];
  kdv: number;
  kdvTipi: StokFiyatKdvTipi;
  alisFiyati: number | null;
  alisFiyati2?: number | null;
  alisFiyati3?: number | null;
  alisFiyati4?: number | null;
  alisFiyati5?: number | null;
  alisFiyati6?: number | null;
  /** Sınırsız alış fiyat listesi (kaynak) */
  alisFiyatListesi?: StokCokluFiyatKayit[];
  satisFiyati1: number | null;
  pb1: StokFiyatPb;
  satisFiyati2: number | null;
  pb2: StokFiyatPb;
  satisFiyati3: number | null;
  pb3: StokFiyatPb;
  satisFiyati4: number | null;
  pb4: StokFiyatPb;
  satisFiyati5: number | null;
  pb5: StokFiyatPb;
  satisFiyati6: number | null;
  pb6: StokFiyatPb;
  /** Sınırsız satış fiyat listesi (kaynak) */
  satisFiyatListesi?: StokCokluFiyatKayit[];
  alisKdv?: number;
  alisKdvTipi?: StokFiyatKdvTipi;
  aktif?: boolean;
  /* Yeni stok ekranı (F001 birimler karti) — UI alanları */
  isk1?: string;
  isk2?: string;
  isk3?: string;
  desi?: string;
  /** Alış ölçü: ağırlık veya hacim (desi) */
  alisOlcuTur?: 'agirlik' | 'hacim' | '';
  alisOlcuBirim?: 'g' | 'kg' | 'desi' | '';
  alisOlcuDeger?: number | null;
  /** Satış ölçü: ağırlık veya hacim (desi) */
  satisOlcuTur?: 'agirlik' | 'hacim' | '';
  satisOlcuBirim?: 'g' | 'kg' | 'desi' | '';
  satisOlcuDeger?: number | null;
  anaBirimMi?: boolean;
  varsayilanMi?: boolean;
  birimAciklama?: string;
  alisIskonto?: string;
  alisNetFiyat?: number | null;
  satisIskonto?: string;
  satisNetFiyat?: number | null;
}

export const STOK_FIYAT_PB_SECENEKLERI: {
  deger: StokFiyatPb;
  etiket: string;
  sembol: string;
}[] = [];

/** Dinamik PB seçenekleri — Özel Tanımlar kaynağı */
export function stokFiyatPbSecenekleri(): {
  deger: StokFiyatPb;
  etiket: string;
  sembol: string;
}[] {
  return paraBirimiSecenekleri().map((p) => ({
    deger: p.deger,
    etiket: p.etiket,
    sembol: p.sembol,
  }));
}

export function stokPbSembolu(kod: StokFiyatPb | string): string {
  return paraBirimiSembolu(kod);
}

export function stokPbEtiketi(kod: StokFiyatPb | string): string {
  return paraBirimiEtiketi(kod);
}

export const STOK_BARKOD_TIP_SECENEKLERI: { deger: StokBarkodTipi; etiket: string }[] = [
  { deger: '', etiket: 'Hiçbiri' },
  { deger: 'EAN8', etiket: 'EAN8' },
  { deger: 'EAN13', etiket: 'EAN13' },
  { deger: 'UPC', etiket: 'UPC' },
  { deger: 'CODE39', etiket: 'CODE39' },
  { deger: 'CODE93', etiket: 'CODE93' },
  { deger: 'CODE128', etiket: 'CODE128' },
  { deger: 'GRAMAJ', etiket: 'GRAMAJ' },
  { deger: 'ADET', etiket: 'ADET' },
];

export const STOK_FIYAT_KDV_TIPI_SECENEKLERI: { deger: StokFiyatKdvTipi; etiket: string }[] = [
  { deger: 'dahil', etiket: 'D' },
  { deger: 'haric', etiket: 'H' },
];

export const ISARETLI_FIYAT_ALANLARI: { value: IsaretliFiyatAlani; label: string }[] = [
  { value: 'satisFiyati1', label: '1. Satış Fiyatı' },
  { value: 'alisFiyati', label: 'Alış Fiyatı' },
];
