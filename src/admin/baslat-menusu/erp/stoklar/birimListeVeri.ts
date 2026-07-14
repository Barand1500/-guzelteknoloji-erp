import type { AdminStok } from './tipler';
import type { StokBirimListeSatir } from './birimListeTipler';

/** Faz 1: gerçek birim tablosu yok — stok koduna göre örnek birim listesi */
export function stokBirimListeOrnekVeri(stok: AdminStok): StokBirimListeSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const fiyatTaban = 4000 + (seed % 1800);

  const satirlar: StokBirimListeSatir[] = [
    {
      id: `${stok.id}-birim-adet`,
      fiyatAd: 'FİYAT',
      birim: 'ADET',
      carpan: 1,
      satisFiyati1: null,
      satisFiyati2: null,
      satisFiyati3: null,
      kdvYuzde: 10,
      kdvDahil: true,
    },
  ];

  if (seed % 3 === 0) {
    satirlar.push({
      id: `${stok.id}-birim-paket`,
      fiyatAd: 'FİYAT',
      birim: 'PAKET',
      carpan: 6,
      satisFiyati1: fiyatTaban * 6,
      satisFiyati2: fiyatTaban * 6 + 120,
      satisFiyati3: null,
      kdvYuzde: 10,
      kdvDahil: true,
    });
  }

  if (seed % 5 === 0) {
    satirlar.push({
      id: `${stok.id}-birim-koli`,
      fiyatAd: 'FİYAT',
      birim: 'KOLİ',
      carpan: 24,
      satisFiyati1: fiyatTaban * 24,
      satisFiyati2: null,
      satisFiyati3: fiyatTaban * 24 + 480,
      kdvYuzde: 20,
      kdvDahil: false,
    });
  }

  return satirlar;
}
