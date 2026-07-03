export type KesifOkYonu = 'ust' | 'alt' | 'sol' | 'sag';

export interface SistemKesifAdim {
  id: string;
  /** data-ap-kesif değeri; boş = ekran ortası */
  hedef?: string;
  /** hedef bulunamazsa denenecek alternatifler */
  hedefYedek?: string[];
  baslik: string;
  aciklama: string;
  /** Yeni başlayanlar için kısa maddeler */
  ipuclari?: string[];
  okYonu?: KesifOkYonu;
  modulId?: string;
  menuAc?: boolean;
  menuKapat?: boolean;
  padding?: number;
}

export interface SistemKesifTur {
  id: string;
  baslik: string;
  aciklama: string;
  ikon: string;
  adimlar: SistemKesifAdim[];
}
