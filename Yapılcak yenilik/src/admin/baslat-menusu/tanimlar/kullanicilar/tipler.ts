export interface TanimlarKullanici {
  id: number;
  kullaniciAdi: string;
  fiyatListesi: string;
  sifre: string;
  iskontoOrani: string;
  iskontoTutari: string;
  kasaPortu: string;
}

export type TanimlarKullaniciAlan =
  | 'kullaniciAdi'
  | 'fiyatListesi'
  | 'sifre'
  | 'iskontoOrani'
  | 'iskontoTutari'
  | 'kasaPortu';

export const TANIMLAR_FIYAT_LISTELERI = ['', 'PAKET', 'NORMAL', 'HAPPY HOUR'] as const;
