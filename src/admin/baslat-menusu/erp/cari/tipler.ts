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

export const EFATURA_TIPLERI = [
  { value: 'TICARI FATURA', label: 'Ticari Fatura' },
  { value: 'E-ARSIV', label: 'E-Arşiv' },
] as const;

export const EFATURA_SECIMLERI = [
  { value: 'HAYIR', label: 'Hayır', efatura: false, efaturaTipi: 'E-ARSIV' },
  { value: 'E-ARSIV', label: 'E-Arşiv', efatura: true, efaturaTipi: 'E-ARSIV' },
  { value: 'TICARI FATURA', label: 'Ticari Fatura', efatura: true, efaturaTipi: 'TICARI FATURA' },
] as const;

export function efaturaSecimDegeri(efatura: boolean, efaturaTipi: string): string {
  if (!efatura) return 'HAYIR';
  return efaturaTipi === 'TICARI FATURA' ? 'TICARI FATURA' : 'E-ARSIV';
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
}

export const bosCariForm: CariFormDegeri = {
  ustId: '',
  cariTipi: 'ALICI',
  isletmeTuru: '',
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
  efaturaTipi: 'E-ARSIV',
  alias: '',
  aktif: true,
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
