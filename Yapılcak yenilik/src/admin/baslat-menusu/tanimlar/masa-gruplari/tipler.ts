export type TanimlarMasaGrubuAlan = 'grup' | 'prefixIsimler' | 'masaSayisi';

export interface TanimlarMasaGrubuAyarlar {
  girisCariSec: boolean;
  masaAcilisUrunleri: string;
}

export interface TanimlarMasaGrubu {
  id: number;
  grup: string;
  prefixIsimler: string;
  masaSayisi: number;
}

export interface TanimlarMasaGrubuKayit {
  gruplar: TanimlarMasaGrubu[];
  ayarlar: Record<number, TanimlarMasaGrubuAyarlar>;
}

export function bosMasaGrubuAyarlar(): TanimlarMasaGrubuAyarlar {
  return { girisCariSec: false, masaAcilisUrunleri: '' };
}

export function masaGrubuAyarlarKopyala(k: TanimlarMasaGrubuAyarlar): TanimlarMasaGrubuAyarlar {
  return { ...k };
}
