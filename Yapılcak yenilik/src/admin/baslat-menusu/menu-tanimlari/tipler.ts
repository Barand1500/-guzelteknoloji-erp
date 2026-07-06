export interface MenuUrunFiyat {
  fiyatListesi: string;
  fiyat: number;
}

export interface MenuUrunSatiri {
  id: string;
  urunId: string;
  fiyatFarki: number;
  fiyatlar: MenuUrunFiyat[];
}

export interface MenuTanim {
  id: number;
  ad: string;
  resimUrl: string | null;
  kdvDahilFiyat: number;
  urunSayisi: number;
  aktif: boolean;
  urunler: MenuUrunSatiri[];
}

export interface MenuKayit {
  menuler: MenuTanim[];
}

export type MenuDuzenlemeModu = 'pasif' | 'duzenle' | 'yeni';

export function bosMenuTanim(id: number): MenuTanim {
  return {
    id,
    ad: '',
    resimUrl: null,
    kdvDahilFiyat: 0,
    urunSayisi: 1,
    aktif: true,
    urunler: [],
  };
}

export function menuTanimKopyala(menu: MenuTanim): MenuTanim {
  return {
    ...menu,
    urunler: menu.urunler.map((u) => ({
      ...u,
      fiyatlar: u.fiyatlar.map((f) => ({ ...f })),
    })),
  };
}
