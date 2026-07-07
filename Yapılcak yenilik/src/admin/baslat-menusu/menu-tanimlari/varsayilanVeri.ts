import { bosMenuUrunFiyatlari } from '@/admin/baslat-menusu/menu-tanimlari/veri';
import type { MenuKayit } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

export function varsayilanMenuKaydi(): MenuKayit {
  return {
    menuler: [
      {
        id: 1,
        ad: 'Örnek Menü',
        resimUrl: null,
        kdvDahilFiyat: 149.9,
        urunSayisi: 2,
        aktif: true,
        urunler: [
          {
            id: 'mu-1',
            urunId: 'u1',
            fiyatFarki: 0,
            fiyatlar: bosMenuUrunFiyatlari(),
          },
          {
            id: 'mu-2',
            urunId: 'u6',
            fiyatFarki: -5,
            fiyatlar: [{ fiyatListesi: 'PAKET', fiyat: 12 }, { fiyatListesi: 'SALON', fiyat: 15 }],
          },
        ],
      },
    ],
  };
}
