import type { AdminStok } from './tipler';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

function bosFiyatSatiri(
  ek: Pick<StokFiyatDuzenleSatir, 'id' | 'birim' | 'carpan' | 'barkod'>
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

  const satirlar: StokFiyatDuzenleSatir[] = [
    bosFiyatSatiri({
      id: `${stok.id}-fiyat-adet`,
      birim: 'ADET',
      carpan: 1,
      barkod: `${barkodTaban}001`,
    }),
  ];

  satirlar[0] = {
    ...satirlar[0],
    satisFiyati1: fiyatTaban + 420,
    satisFiyati2: fiyatTaban + 680,
    satisFiyati3: fiyatTaban + 920,
  };

  if (seed % 3 === 0) {
    satirlar.push(
      bosFiyatSatiri({
        id: `${stok.id}-fiyat-paket`,
        birim: 'PAKET',
        carpan: 6,
        barkod: `${barkodTaban}006`,
      })
    );
  }

  return satirlar;
}

export function stokFiyatBarkodUret(stok: AdminStok, carpan: number, sira = 1): string {
  const taban = (stok.urunKodu || 'STOK').replace(/\W/g, '').toUpperCase();
  return `${taban}${String(carpan).padStart(3, '0')}${String(sira).padStart(2, '0')}`;
}
