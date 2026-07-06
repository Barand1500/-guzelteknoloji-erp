import type { MenuUrunFiyat } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

export const MENU_FIYAT_LISTELERI = ['PAKET', 'SALON'] as const;

export function bosMenuUrunFiyatlari(): MenuUrunFiyat[] {
  return MENU_FIYAT_LISTELERI.map((fiyatListesi) => ({ fiyatListesi, fiyat: 0 }));
}
