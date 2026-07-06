import type { FiyatListeKayit } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

export const varsayilanFiyatListeKaydi: FiyatListeKayit = {
  sablonlar: [
    { id: 1, ad: 'PAKET', aktif: true },
    { id: 2, ad: 'SALON', aktif: true },
    { id: 3, ad: 'HAPPY HOUR', aktif: false },
  ],
  aktifSablonId: 1,
  kurallar: [],
  otomasyonlar: [],
};

export const CARI_KATEGORI_SECENEKLERI = [
  { value: '', label: '— Seçin —' },
  { value: 'Nihai Tüketici', label: 'Nihai Tüketici' },
  { value: 'Bireysel', label: 'Bireysel' },
  { value: 'Kurumsal', label: 'Kurumsal' },
];

export const MASA_GRUBU_SECENEKLERI = [
  { value: '', label: '— Seçin —' },
  { value: 'BAHÇE', label: 'BAHÇE' },
  { value: 'SALON', label: 'SALON' },
  { value: 'PAKET', label: 'PAKET' },
  { value: 'VIP', label: 'VIP' },
];

export const AKTIF_GUN_SECENEKLERI = [
  { value: '', label: '— Seçin —' },
  { value: 'Pzt-Cum', label: 'Pzt-Cum' },
  { value: 'Cumartesi', label: 'Cumartesi' },
  { value: 'Pazar', label: 'Pazar' },
  { value: 'Her gün', label: 'Her gün' },
];
