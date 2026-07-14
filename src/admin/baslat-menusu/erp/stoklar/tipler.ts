import type { AdminUrun, UrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { bosUrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';

export type AdminStok = AdminUrun;
export type StokForm = UrunForm;
export const bosStokForm: StokForm = { ...bosUrunForm };

export interface StokGelismisFiltre {
  urunTipi: string;
  urunKodu: string;
  sinifGrup: string;
  urunAdi: string;
  /** '' = tümü, 'aktif' = yalnız aktif, 'pasif' = yalnız pasif */
  durum: string;
}

export const bosStokGelismisFiltre = (): StokGelismisFiltre => ({
  urunTipi: '',
  urunKodu: '',
  sinifGrup: '',
  urunAdi: '',
  durum: '',
});

export type StokKartModu = 'yeni' | 'duzenle' | 'incele';

export type StokKartSekmeId =
  | 'stok-bilgileri'
  | 'birim-fiyatlar'
  | 'ozel-kodlar'
  | 'muhasebe'
  | 'resim'
  | 'analiz'
  | 'istihbarat'
  | 'e-donusum';

export const STOK_KART_SEKMELERI: { id: StokKartSekmeId; ad: string; aktif: boolean }[] = [
  { id: 'stok-bilgileri', ad: 'Stok Bilgileri', aktif: true },
  { id: 'birim-fiyatlar', ad: 'Birim ve Fiyatlar', aktif: false },
  { id: 'ozel-kodlar', ad: 'Özel Kodlar', aktif: false },
  { id: 'muhasebe', ad: 'Muhasebe', aktif: false },
  { id: 'resim', ad: 'Resim', aktif: false },
  { id: 'analiz', ad: 'Analiz', aktif: false },
  { id: 'istihbarat', ad: 'İstihbarat / Diğer', aktif: false },
  { id: 'e-donusum', ad: 'E-Dönüşüm', aktif: false },
];
