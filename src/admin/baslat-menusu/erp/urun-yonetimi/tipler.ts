import { gecerliStokTipiKodu, stokTipiFormSecenekleri } from '@/admin/baslat-menusu/ozel-tanimlar/veri/stokTipleriOt';

export interface OrtakKayit {
  id: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface AdminUrun extends OrtakKayit {
  ustId: string;
  urunTipi: string;
  urunNevi: string;
  urunKodu: string;
  marka: string;
  urunAdi: string;
  anaBirim: string;
  varsayilanBirim: string;
  mensei: string;
}

export type UrunForm = Omit<AdminUrun, keyof OrtakKayit>;
export const bosUrunForm: UrunForm = {
  ustId: '',
  urunTipi: gecerliStokTipiKodu(undefined),
  urunNevi: 'RESMI',
  urunKodu: '',
  marka: '',
  urunAdi: '',
  anaBirim: '',
  varsayilanBirim: '',
  mensei: '',
};

export interface AdminBirim extends OrtakKayit {
  urunId: string;
  urunKodu: string;
  urunAdi: string;
  fiyatAdi: string;
  birimAdi: string;
  carpan: number;
  barkod: string;
  alisKdv: number;
  satisKdv: number;
  alisFiyati: number;
  satisFiyati: number;
  kdvDahil: boolean;
}

export interface BirimForm {
  urunId: string;
  fiyatAdi: string;
  birimAdi: string;
  carpan: number;
  barkod: string;
  alisKdv: number;
  satisKdv: number;
  alisFiyati: number;
  satisFiyati: number;
  kdvDahil: boolean;
  aktif: boolean;
}

export const bosBirimForm: BirimForm = {
  urunId: '', fiyatAdi: 'PERAKENDE', birimAdi: 'ADET', carpan: 1, barkod: '',
  alisKdv: 20, satisKdv: 20, alisFiyati: 0, satisFiyati: 0, kdvDahil: false, aktif: true,
};

export interface AdminMaliyet extends OrtakKayit {
  birimId: string;
  birimAdi: string;
  urunKodu: string;
  urunAdi: string;
  sonAlisMaliyeti: number;
  yuruyenAgirlikliOrtalama: number;
  agirlikliOrtalama: number;
  basitOrtalama: number;
  lifo: number;
  fifo: number;
}

export interface MaliyetForm {
  birimId: string;
  sonAlisMaliyeti: number;
  yuruyenAgirlikliOrtalama: number;
  agirlikliOrtalama: number;
  basitOrtalama: number;
  lifo: number;
  fifo: number;
  aktif: boolean;
}

export const bosMaliyetForm: MaliyetForm = {
  birimId: '', sonAlisMaliyeti: 0, yuruyenAgirlikliOrtalama: 0,
  agirlikliOrtalama: 0, basitOrtalama: 0, lifo: 0, fifo: 0, aktif: true,
};

export const URUN_TIPLERI = stokTipiFormSecenekleri(true);

export const URUN_NEVILERI = [
  { value: 'RESMI', label: 'Resmî' },
  { value: 'GAYRIRESMI', label: 'Gayriresmî' },
] as const;
