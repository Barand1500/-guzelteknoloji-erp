export interface CariTanim {
  id: number;
  kod: string;
  ad: string;
  telefon: string;
  unvan: string;
  vergiNo: string;
  vergiDairesi: string;
  kartNo: string;
  iskontoOrani: string;
  adres: string;
  ilce: string;
  il: string;
  kategori: string;
  ticariSicilNo: string;
  faturaAdi: string;
  faturaSoyadi: string;
  eposta: string;
  aktif: boolean;
  normalFaturaKullanicisi: boolean;
  kdvTevkifati: boolean;
}

export interface CariKayit {
  cariler: CariTanim[];
}

export type CariGorunum = 'liste' | 'kart';

export function bosCariTanim(id: number): CariTanim {
  return {
    id,
    kod: 'YENİ',
    ad: '',
    telefon: '0',
    unvan: '',
    vergiNo: '',
    vergiDairesi: '',
    kartNo: '',
    iskontoOrani: '0',
    adres: '',
    ilce: '',
    il: '',
    kategori: '',
    ticariSicilNo: '',
    faturaAdi: '',
    faturaSoyadi: '',
    eposta: '',
    aktif: true,
    normalFaturaKullanicisi: false,
    kdvTevkifati: false,
  };
}

export function cariTanimKopyala(cari: CariTanim): CariTanim {
  return { ...cari };
}

export function cariTanimEsit(a: CariTanim, b: CariTanim): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
