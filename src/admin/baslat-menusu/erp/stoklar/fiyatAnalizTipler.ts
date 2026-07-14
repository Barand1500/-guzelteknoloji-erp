export type FiyatAnalizIslemYonu = 'giris' | 'cikis';

export type FiyatAnalizIslemFiltre = 'tumu' | 'cikis' | 'giris' | 'sonGiris' | 'sonCikis';

export interface StokFiyatAnalizSatir {
  id: string;
  islemTipi: string;
  yon: FiyatAnalizIslemYonu;
  firmaKodu: string;
  firmaAdi: string;
  tarih: string;
  birimFiyati: number;
  pb: string;
  miktar: number;
  birimMaliyet: number;
  kur: number;
  depoAdi: string;
}

export const FIYAT_ANALIZ_ISLEM_FILTRELERI: { value: FiyatAnalizIslemFiltre; label: string }[] = [
  { value: 'tumu', label: 'Tümü' },
  { value: 'cikis', label: 'Çıkış' },
  { value: 'giris', label: 'Giriş' },
  { value: 'sonGiris', label: 'Son Giriş' },
  { value: 'sonCikis', label: 'Son Çıkış' },
];
