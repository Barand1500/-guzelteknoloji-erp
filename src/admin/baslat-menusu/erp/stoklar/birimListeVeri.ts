import type { AdminStok } from './tipler';
import type { StokBirimListeSatir } from './birimListeTipler';

/** Faz 1: gerçek birim tablosu yok — stok koduna göre örnek birim listesi */
export function stokBirimListeOrnekVeri(stok: AdminStok): StokBirimListeSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const fiyatTaban = 4000 + (seed % 1800);

  return [
    {
      id: `${stok.id}-birim-adet`,
      fiyatAd: 'FİYAT',
      birim: 'ADET',
      carpan: 1,
      satisFiyati1: fiyatTaban + 420,
      satisFiyati2: fiyatTaban + 680,
      satisFiyati3: fiyatTaban + 920,
      kdvYuzde: 10,
      kdvDahil: true,
    },
    {
      id: `${stok.id}-birim-paket`,
      fiyatAd: 'PERAKENDE',
      birim: 'PAKET',
      carpan: 6,
      satisFiyati1: (fiyatTaban + 420) * 6,
      satisFiyati2: (fiyatTaban + 680) * 6,
      satisFiyati3: (fiyatTaban + 920) * 6 - 50,
      kdvYuzde: 10,
      kdvDahil: true,
    },
    {
      id: `${stok.id}-birim-koli`,
      fiyatAd: 'TOPTAN',
      birim: 'KOLİ',
      carpan: 24,
      satisFiyati1: (fiyatTaban + 380) * 24,
      satisFiyati2: (fiyatTaban + 600) * 24,
      satisFiyati3: null,
      kdvYuzde: 20,
      kdvDahil: false,
    },
    {
      id: `${stok.id}-birim-set`,
      fiyatAd: 'FİYAT',
      birim: 'SET',
      carpan: 2,
      satisFiyati1: (fiyatTaban + 420) * 2 - 80,
      satisFiyati2: (fiyatTaban + 680) * 2 - 100,
      satisFiyati3: (fiyatTaban + 920) * 2,
      kdvYuzde: 10,
      kdvDahil: true,
    },
    {
      id: `${stok.id}-birim-kutu`,
      fiyatAd: 'PERAKENDE',
      birim: 'KUTU',
      carpan: 12,
      satisFiyati1: (fiyatTaban + 400) * 12,
      satisFiyati2: null,
      satisFiyati3: (fiyatTaban + 850) * 12,
      kdvYuzde: 10,
      kdvDahil: true,
    },
  ];
}
