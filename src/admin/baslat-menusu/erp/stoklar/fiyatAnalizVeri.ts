import type { AdminStok } from './tipler';
import type { StokFiyatAnalizSatir } from './fiyatAnalizTipler';

/** Faz 1: gerçek hareket tablosu yok — stok koduna göre örnek işlem listesi */
export function stokFiyatAnalizOrnekVeri(stok: AdminStok): StokFiyatAnalizSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const fiyatTaban = 4000 + (seed % 1800);

  const satirlar: StokFiyatAnalizSatir[] = [
    {
      id: `${stok.id}-1`,
      islemTipi: 'AlFat',
      yon: 'giris',
      firmaKodu: 'B.60.002',
      firmaAdi: 'VEGA DATA OTOMASYON SAN.TİC.LTD.ŞTİ.',
      tarih: '2026-07-08T00:00:00.000Z',
      birimFiyati: fiyatTaban + 310,
      pb: 'TL',
      miktar: 10,
      birimMaliyet: fiyatTaban + 310,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
    {
      id: `${stok.id}-2`,
      islemTipi: 'StkGir',
      yon: 'giris',
      firmaKodu: 'DEVİR',
      firmaAdi: 'Devir Giriş',
      tarih: '2026-01-01T00:00:00.000Z',
      birimFiyati: fiyatTaban,
      pb: 'TL',
      miktar: 3,
      birimMaliyet: fiyatTaban,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
    {
      id: `${stok.id}-3`,
      islemTipi: 'AlFat',
      yon: 'giris',
      firmaKodu: 'B.60.015',
      firmaAdi: 'GÜZEL İÇ VE DIŞ TİCARET LİMİTED ŞİRKETİ',
      tarih: '2026-06-12T00:00:00.000Z',
      birimFiyati: fiyatTaban + 180,
      pb: 'TL',
      miktar: 30,
      birimMaliyet: fiyatTaban + 180,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
    {
      id: `${stok.id}-4`,
      islemTipi: 'SatFat',
      yon: 'cikis',
      firmaKodu: 'M.10.004',
      firmaAdi: 'ABC TEKNOLOJİ A.Ş.',
      tarih: '2026-05-20T00:00:00.000Z',
      birimFiyati: fiyatTaban + 520,
      pb: 'TL',
      miktar: 5,
      birimMaliyet: fiyatTaban + 310,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
    {
      id: `${stok.id}-5`,
      islemTipi: 'SatFat',
      yon: 'cikis',
      firmaKodu: 'M.20.011',
      firmaAdi: 'DELTA BİLİŞİM LTD. ŞTİ.',
      tarih: '2026-04-03T00:00:00.000Z',
      birimFiyati: fiyatTaban + 480,
      pb: 'TL',
      miktar: 2,
      birimMaliyet: fiyatTaban + 280,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
    {
      id: `${stok.id}-6`,
      islemTipi: 'StkGir',
      yon: 'giris',
      firmaKodu: 'B.60.002',
      firmaAdi: 'VEGA DATA OTOMASYON SAN.TİC.LTD.ŞTİ.',
      tarih: '2026-03-15T00:00:00.000Z',
      birimFiyati: fiyatTaban + 90,
      pb: 'TL',
      miktar: 12,
      birimMaliyet: fiyatTaban + 90,
      kur: 1,
      depoAdi: 'MERKEZ',
    },
  ];

  return satirlar.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
}
