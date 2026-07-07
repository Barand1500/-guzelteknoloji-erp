import { DEMO_SIPARIS_SATIRLARI } from './demoVeri';
import type { UrunKaydi } from './urunAramaYardimci';

function varsayilanEnvanter(sku: string): number {
  let toplam = 0;
  for (let i = 0; i < sku.length; i++) toplam = (toplam + sku.charCodeAt(i) * (i + 3)) % 991;
  return 8 + (toplam % 420);
}

const ekUrunler: UrunKaydi[] = [
  { sku: 'BAR-001', ad: 'Barista Espresso Makinesi Pro', birim: 'ADET', fiyat: 12499, envanter: 36, kdv: 20 },
  { sku: 'BAR-002', ad: 'Barkod Okuyucu El Tipi', birim: 'ADET', fiyat: 1890, envanter: 112, kdv: 20 },
  { sku: 'GT-BAR-50', ad: 'Güzel Bar Standı (50cm)', birim: 'ADET', fiyat: 3450, envanter: 24, kdv: 20 },
  { sku: 'APPLE-15', ad: 'MacBook Pro 14" M3 Pro', birim: 'ADET', fiyat: 89999, envanter: 6, kdv: 20 },
  { sku: 'SONY-BAR', ad: 'Sony Soundbar HT-A5000', birim: 'ADET', fiyat: 21999, envanter: 14, kdv: 20 },
  { sku: 'PHIL-BAR', ad: 'Philips Hue Lightstrip Plus', birim: 'PAKET', fiyat: 4299, envanter: 58, kdv: 20 },
  { sku: '10.0001', ad: 'Fiyat Farkı Kalemi', birim: 'ADET', fiyat: 0, envanter: 9999, kdv: 0 },
  { sku: '10.0042', ad: 'Hizmet Bedeli — Bar Kurulum', birim: 'PAKET', fiyat: 2500, envanter: 0, kdv: 20 },
  { sku: 'KABLO-HDMI', ad: 'HDMI 2.1 Kablo 2m', birim: 'ADET', fiyat: 649, envanter: 240, kdv: 20 },
  { sku: 'MS-SURF', ad: 'Microsoft Surface Pro 9', birim: 'ADET', fiyat: 54999, envanter: 9, kdv: 20 },
];

function benzersizUrunler(kaynak: UrunKaydi[]): UrunKaydi[] {
  const harita = new Map<string, UrunKaydi>();
  for (const u of kaynak) {
    const anahtar = u.sku.toLowerCase();
    if (!harita.has(anahtar)) harita.set(anahtar, u);
  }
  return Array.from(harita.values());
}

const tablodan: UrunKaydi[] = DEMO_SIPARIS_SATIRLARI.map((s) => ({
  sku: s.urun.sku,
  ad: s.urun.ad,
  kur: s.urun.kur,
  birim: s.birim,
  fiyat: s.fiyat,
  kdv: s.toplamKdvYuzde,
  envanter: varsayilanEnvanter(s.urun.sku),
}));

export const URUN_KATALOGU: UrunKaydi[] = benzersizUrunler([...tablodan, ...ekUrunler]).sort((a, b) =>
  a.ad.localeCompare(b.ad, 'tr')
);
