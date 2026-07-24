import {
  cariTipiEtiketi as ozelCariTipiEtiketi,
  cariTipiFormSecenekleri,
  gecerliCariTipiKodu,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/cariTipleri';

/** Özel Tanımlar cari tipi kodu (BAYI, DAGITICI, …) */
export type CariTipi = string;
export type IsletmeTuru = 'TUZEL' | 'GERCEK';
export type CariKartModu = 'yeni' | 'duzenle' | 'incele';

/** Anlık snapshot — canlı liste için cariTipiFormSecenekleri() kullanın */
export const CARI_TIPLERI: { value: string; label: string }[] = cariTipiFormSecenekleri();

export const ISLETME_TURLERI: { value: IsletmeTuru; label: string }[] = [
  { value: 'TUZEL', label: 'Tüzel' },
  { value: 'GERCEK', label: 'Gerçek' },
];

export const EFATURA_EVET_HAYIR = [
  { value: 'HAYIR', label: 'Hayır' },
  { value: 'EVET', label: 'Evet' },
] as const;

export const EARSIV_TESLIM_SEKILLERI = [
  { value: 'ELEKTRONIK', label: 'Elektronik' },
  { value: 'KAGIT', label: 'Kağıt' },
] as const;

export const FATURA_TIPLERI = [
  { value: 'TEMEL', label: 'Temel' },
  { value: 'TICARI', label: 'Ticari' },
  { value: 'IHRACAT', label: 'İhracat' },
  { value: 'YOLCU_BERABER', label: 'Yolcu Beraber' },
  { value: 'KAMU', label: 'KAMU' },
  { value: 'HKS', label: 'HKS' },
] as const;

export interface CariIletisimKisi {
  id: string;
  /** Kart / kişi için kısa adres başlığı (Merkez, Şube…) */
  adresBasligi: string;
  adSoyad: string;
  gorevi: string;
  eposta: string;
  telefon: string;
  /** Santral dahili (en fazla 4 rakam) */
  telefonDahili: string;
  gsm: string;
  web: string;
  il: string;
  ilce: string;
  adres: string;
}

export interface CariNot {
  id: string;
  metin: string;
  yazar: string;
  tarih: string;
}

/** Dosyaya özel not (metin + kim / ne zaman) */
export interface CariDosyaNot {
  metin: string;
  yazar: string;
  tarih: string;
}

export interface CariDosya {
  id: string;
  ad: string;
  boyut: number;
  tip: string;
  dataUrl: string;
  tarih: string;
  /** Dosyaya özel notlar (birden fazla olabilir) */
  dosyaNotlari: CariDosyaNot[];
}

export interface CariDosyaDokuman {
  notlar: CariNot[];
  dosyalar: CariDosya[];
  etiketler: string[];
}

export interface CariAdresDegeri {
  il: string;
  ilce: string;
  adres: string;
}

export const bosCariAdres: CariAdresDegeri = {
  il: '',
  ilce: '',
  adres: '',
};

/** f001cariler tablosu — API yanıtı */
export interface AdminCari {
  id: string;
  firmaId: string;
  ustId: string;
  cariTipi: CariTipi;
  isletmeTuru: string;
  cariKodu: string;
  cariAdi: string;
  unvan: string;
  /** Stok alış fiyat tanımı (boş = Standart / FİYAT) */
  alisFiyatTanimi: string;
  /** Seçilen alış tanımı içindeki fiyat (boş = Ana Fiyat) */
  alisFiyatSecimi: string;
  /** Stok satış fiyat tanımı (boş = Standart / FİYAT) */
  satisFiyatTanimi: string;
  /** Seçilen satış tanımı içindeki fiyat (boş = Ana Fiyat) */
  satisFiyatSecimi: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  il: string;
  ilce: string;
  adres: string;
  telefon: string;
  telefonDahili?: string;
  gsm: string;
  eposta: string;
  web: string;
  efatura: boolean;
  earsiv: boolean;
  efaturaTipi: string;
  alias: string;
  earsivAlias: string;
  /** E-Fatura hayır iken: Elektronik | Kağıt */
  earsivTeslimSekli: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

/** API'ye giden form */
export interface CariFormDegeri extends CariAdresDegeri {
  ustId: string;
  cariTipi: CariTipi;
  isletmeTuru: string;
  cariKodu: string;
  cariAdi: string;
  unvan: string;
  /** Stok alış fiyat tanımı (boş = Standart / FİYAT) */
  alisFiyatTanimi: string;
  /** Seçilen alış tanımı içindeki fiyat (boş = Ana Fiyat) */
  alisFiyatSecimi: string;
  /** Stok satış fiyat tanımı (boş = Standart / FİYAT) */
  satisFiyatTanimi: string;
  /** Seçilen satış tanımı içindeki fiyat (boş = Ana Fiyat) */
  satisFiyatSecimi: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  telefon: string;
  telefonDahili: string;
  gsm: string;
  eposta: string;
  web: string;
  efatura: boolean;
  earsiv: boolean;
  efaturaTipi: string;
  alias: string;
  earsivAlias: string;
  eirsaliyeAlias: string;
  /** E-Fatura hayır iken: Elektronik | Kağıt */
  earsivTeslimSekli: string;
  aktif: boolean;
  iletisimKisiler: CariIletisimKisi[];
  dosyaDokuman: CariDosyaDokuman;
}

export const bosDosyaDokuman: CariDosyaDokuman = {
  notlar: [],
  dosyalar: [],
  etiketler: [],
};

export const bosCariForm: CariFormDegeri = {
  ustId: '',
  cariTipi: gecerliCariTipiKodu(undefined),
  isletmeTuru: 'TUZEL',
  cariKodu: '',
  cariAdi: '',
  unvan: '',
  alisFiyatTanimi: '',
  alisFiyatSecimi: '',
  satisFiyatTanimi: '',
  satisFiyatSecimi: '',
  yetkili: '',
  vergiDairesi: '',
  vergiNo: '',
  il: '',
  ilce: '',
  adres: '',
  telefon: '',
  telefonDahili: '',
  gsm: '',
  eposta: '',
  web: '',
  efatura: false,
  earsiv: false,
  efaturaTipi: 'TEMEL',
  alias: '',
  earsivAlias: '',
  eirsaliyeAlias: '',
  earsivTeslimSekli: '',
  aktif: true,
  iletisimKisiler: [],
  dosyaDokuman: bosDosyaDokuman,
};

export function cariTipiEtiketi(tip: CariTipi): string {
  return ozelCariTipiEtiketi(tip);
}

export function isletmeTuruEtiketi(tur: string): string {
  const etiket = ISLETME_TURLERI.find((t) => t.value === tur)?.label ?? tur;
  return etiket || '—';
}

/** Seçilen kart tipi doğrudan kaydedilir (Özel Tanımlar kodu) */
export function kartTipindenApiCariTipi(kartTipi: string): CariTipi {
  return gecerliCariTipiKodu(kartTipi);
}
