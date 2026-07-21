export type CariTipi = 'SATICI' | 'ALICI';
export type IsletmeTuru = 'TUZEL' | 'GERCEK';
export type CariKartModu = 'yeni' | 'duzenle' | 'incele';

export const CARI_TIPLERI: { value: CariTipi; label: string }[] = [
  { value: 'SATICI', label: 'Satıcı' },
  { value: 'ALICI', label: 'Alıcı' },
];

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

export interface CariDosya {
  id: string;
  ad: string;
  boyut: number;
  tip: string;
  dataUrl: string;
  tarih: string;
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
  /** Stok fiyat tanımı (FİYAT, PERAKENDE, TOPTAN…) */
  fiyatTanimi: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  il: string;
  ilce: string;
  adres: string;
  telefon: string;
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
  /** Stok fiyat tanımı (FİYAT, PERAKENDE, TOPTAN…) */
  fiyatTanimi: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  telefon: string;
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
  cariTipi: 'ALICI',
  isletmeTuru: 'TUZEL',
  cariKodu: '',
  cariAdi: '',
  unvan: '',
  fiyatTanimi: '',
  yetkili: '',
  vergiDairesi: '',
  vergiNo: '',
  il: '',
  ilce: '',
  adres: '',
  telefon: '',
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
  return CARI_TIPLERI.find((t) => t.value === tip)?.label ?? tip;
}

export function isletmeTuruEtiketi(tur: string): string {
  const etiket = ISLETME_TURLERI.find((t) => t.value === tur)?.label ?? tur;
  return etiket || '—';
}

export function kartTipindenApiCariTipi(kartTipi: string): CariTipi {
  const v = kartTipi.trim().toUpperCase();
  if (v === 'SATICI') return 'SATICI';
  return 'ALICI';
}
