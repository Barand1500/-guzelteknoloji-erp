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

export const FATURA_TIPLERI = [
  { value: 'TEMEL', label: 'Temel' },
  { value: 'TICARI', label: 'Ticari' },
] as const;

export interface CariIletisimKisi {
  id: string;
  adSoyad: string;
  gorevi: string;
  eposta: string;
  telefon: string;
  il: string;
  ilce: string;
  adres: string;
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
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  il: string;
  ilce: string;
  adres: string;
  telefon: string;
  eposta: string;
  web: string;
  efatura: boolean;
  efaturaTipi: string;
  alias: string;
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
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  telefon: string;
  eposta: string;
  web: string;
  efatura: boolean;
  efaturaTipi: string;
  alias: string;
  aktif: boolean;
  iletisimKisiler: CariIletisimKisi[];
}

export const bosCariForm: CariFormDegeri = {
  ustId: '',
  cariTipi: 'ALICI',
  isletmeTuru: 'TUZEL',
  cariKodu: '',
  cariAdi: '',
  unvan: '',
  yetkili: '',
  vergiDairesi: '',
  vergiNo: '',
  il: '',
  ilce: '',
  adres: '',
  telefon: '',
  eposta: '',
  web: '',
  efatura: false,
  efaturaTipi: 'TEMEL',
  alias: '',
  aktif: true,
  iletisimKisiler: [],
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
