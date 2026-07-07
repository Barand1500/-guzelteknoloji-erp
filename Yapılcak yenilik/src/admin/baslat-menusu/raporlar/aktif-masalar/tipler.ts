export type AktifMasalarGruplama = 'yok' | 'masa' | 'garson' | 'urun';

export const AKTIF_MASALAR_GRUPLAMA_SECENEKLERI = [
  { id: 'yok' as const, etiket: 'Yok' },
  { id: 'masa' as const, etiket: 'Masa No' },
  { id: 'garson' as const, etiket: 'Siparişi Alan' },
  { id: 'urun' as const, etiket: 'Ürün' },
];

export interface AcikPusulaSatiri {
  id: string;
  alinmaZamani: string;
  siparisAlan: string;
  masaNo: string;
  urun: string;
  miktar: number;
  fiyat: number;
  tutar: number;
}

export interface AktifMasalarGorunum {
  otomatikGuncelleme: boolean;
  gruplama: AktifMasalarGruplama;
}

export function acikPusulaToplamlar(satirlar: AcikPusulaSatiri[]) {
  return satirlar.reduce(
    (acc, s) => ({
      miktar: acc.miktar + s.miktar,
      tutar: acc.tutar + s.tutar,
    }),
    { miktar: 0, tutar: 0 }
  );
}
