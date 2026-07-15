import type { AdminStok } from './tipler';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

function bosFiyatSatiri(
  ek: Pick<StokFiyatDuzenleSatir, 'id' | 'birim' | 'carpan' | 'barkod'> &
    Partial<Pick<StokFiyatDuzenleSatir, 'fiyatAdi' | 'kdv' | 'kdvTipi'>>
): StokFiyatDuzenleSatir {
  return {
    fiyatAdi: 'FİYAT',
    kdv: 10,
    kdvTipi: 'dahil',
    satisFiyati1: null,
    pb1: 'TL',
    satisFiyati2: null,
    pb2: 'TL',
    satisFiyati3: null,
    pb3: 'TL',
    satisFiyati4: null,
    pb4: 'TL',
    satisFiyati5: null,
    pb5: 'TL',
    ...ek,
  };
}

/** Faz 1: gerçek fiyat tablosu yok — stok koduna göre örnek fiyat listesi */
export function stokFiyatDuzenleOrnekVeri(stok: AdminStok): StokFiyatDuzenleSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const fiyatTaban = 4000 + (seed % 1800);
  const barkodTaban = kod.replace(/\W/g, '').toUpperCase();

  return [
    {
      ...bosFiyatSatiri({
        id: `${stok.id}-fiyat-adet`,
        birim: 'ADET',
        carpan: 1,
        barkod: `${barkodTaban}001`,
        fiyatAdi: 'FİYAT',
      }),
      satisFiyati1: fiyatTaban + 420,
      satisFiyati2: fiyatTaban + 680,
      satisFiyati3: fiyatTaban + 920,
      satisFiyati4: fiyatTaban + 1100,
      satisFiyati5: null,
    },
    {
      ...bosFiyatSatiri({
        id: `${stok.id}-fiyat-paket`,
        birim: 'PAKET',
        carpan: 6,
        barkod: `${barkodTaban}006`,
        fiyatAdi: 'PERAKENDE',
      }),
      satisFiyati1: (fiyatTaban + 400) * 6,
      satisFiyati2: (fiyatTaban + 650) * 6,
      satisFiyati3: (fiyatTaban + 880) * 6,
      satisFiyati4: null,
      satisFiyati5: null,
    },
    {
      ...bosFiyatSatiri({
        id: `${stok.id}-fiyat-koli`,
        birim: 'KOLİ',
        carpan: 24,
        barkod: `${barkodTaban}024`,
        fiyatAdi: 'TOPTAN',
        kdv: 20,
        kdvTipi: 'haric',
      }),
      satisFiyati1: (fiyatTaban + 360) * 24,
      satisFiyati2: (fiyatTaban + 580) * 24,
      satisFiyati3: null,
      satisFiyati4: null,
      satisFiyati5: null,
    },
    {
      ...bosFiyatSatiri({
        id: `${stok.id}-fiyat-set`,
        birim: 'SET',
        carpan: 2,
        barkod: `${barkodTaban}002`,
        fiyatAdi: 'FİYAT',
      }),
      satisFiyati1: (fiyatTaban + 420) * 2 - 80,
      satisFiyati2: (fiyatTaban + 680) * 2 - 120,
      satisFiyati3: (fiyatTaban + 920) * 2,
      satisFiyati4: (fiyatTaban + 1050) * 2,
      satisFiyati5: (fiyatTaban + 1200) * 2,
    },
  ];
}

export function stokFiyatBarkodUret(stok: AdminStok, carpan: number, sira = 1): string {
  const taban = (stok.urunKodu || 'STOK').replace(/\W/g, '').toUpperCase();
  return `${taban}${String(carpan).padStart(3, '0')}${String(sira).padStart(2, '0')}`;
}
