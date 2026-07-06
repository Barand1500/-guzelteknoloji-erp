import type { FiyatListesiKaydi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';
import { bosFiyatListesi, fiyatListesiKopyala } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';

export const URUN_GRUPLARI = [
  'Trendyol',
  'Döner Menü',
  'Dürüm',
  'Et Döner',
  'İçecek',
  'Tatlı',
  'Yan Ürün',
] as const;

export const URUN_TIPLERI = ['Normal', 'Combo', 'Menü', 'Hammadde'] as const;

export const FATURA_GRUPLARI = ['Yok', 'Yiyecek', 'İçecek', 'Alkol', 'Diğer'] as const;

export const FAVORI_SECENEKLERI = ['Yok', 'Kasa', 'Garson', 'Her İkisi'] as const;

export const SECENEK_KATEGORILERI = ['İçecek', 'Ekstra', 'Porsiyon', 'Sos', 'Garnitür'] as const;

export type UrunTipi = (typeof URUN_TIPLERI)[number];

export interface UrunSecenekKategori {
  id: string;
  sira: number;
  kategori: string;
  enAzSecim: number;
  enFazlaSecim: number;
}

export interface UrunSecimSatiri {
  id: string;
  sira: number;
  secim: string;
  fiyat: number;
  fiyatListeleri: FiyatListesiKaydi[];
}

export interface UrunSecenekSatiri {
  id: string;
  sira: number;
  secenekAdi: string;
  kategori: string;
  fiyat: number;
  miktarli: boolean;
  fiyatListeleri: FiyatListesiKaydi[];
}

export interface UrunTanimi {
  id: string;
  stokKodu: string;
  ad: string;
  sira: number;
  kdvDahilFiyat: number;
  kdvOrani: number;
  istisnaKodu: string;
  urunGrubu: string;
  urunTipi: UrunTipi;
  faturaGrubu: string;
  favori: string;
  resimUrl: string | null;
  ikram: boolean;
  plu: string;
  ozelMatrahKodu: string;
  fiyatListeleri: FiyatListesiKaydi[];
  secenekKategorileri: UrunSecenekKategori[];
  seviye1: UrunSecimSatiri[];
  seviye2: UrunSecimSatiri[];
  secenekler: UrunSecenekSatiri[];
}

export interface UrunTanimlariKayit {
  urunler: UrunTanimi[];
}

export type UrunGorunum = 'form' | 'liste';

export function bosUrunTanimi(id: string, sira: number): UrunTanimi {
  return {
    id,
    stokKodu: '',
    ad: '',
    sira,
    kdvDahilFiyat: 0,
    kdvOrani: 10,
    istisnaKodu: '',
    urunGrubu: URUN_GRUPLARI[0],
    urunTipi: 'Normal',
    faturaGrubu: FATURA_GRUPLARI[0],
    favori: FAVORI_SECENEKLERI[0],
    resimUrl: null,
    ikram: false,
    plu: '',
    ozelMatrahKodu: '',
    fiyatListeleri: bosFiyatListesi(),
    secenekKategorileri: [],
    seviye1: [],
    seviye2: [],
    secenekler: [],
  };
}

function secimSatiriKopyala(s: UrunSecimSatiri): UrunSecimSatiri {
  return { ...s, fiyatListeleri: fiyatListesiKopyala(s.fiyatListeleri ?? []) };
}

function secenekSatiriKopyala(s: UrunSecenekSatiri): UrunSecenekSatiri {
  return { ...s, fiyatListeleri: fiyatListesiKopyala(s.fiyatListeleri ?? []) };
}

function kategoriKopyala(k: UrunSecenekKategori): UrunSecenekKategori {
  return { ...k };
}

export function urunTanimiKopyala(u: UrunTanimi): UrunTanimi {
  return {
    ...u,
    fiyatListeleri: fiyatListesiKopyala(u.fiyatListeleri ?? []),
    secenekKategorileri: (u.secenekKategorileri ?? []).map(kategoriKopyala),
    seviye1: u.seviye1.map(secimSatiriKopyala),
    seviye2: u.seviye2.map(secimSatiriKopyala),
    secenekler: u.secenekler.map(secenekSatiriKopyala),
  };
}

export function urunTanimlariEsit(a: UrunTanimi, b: UrunTanimi): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
