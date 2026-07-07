import { DEMO_SIPARIS_SATIRLARI } from './demoVeri';
import type { UrunKaydi } from './urunAramaYardimci';

const ekUrunler: UrunKaydi[] = [
  { sku: 'BAR-001', ad: 'Barista Espresso Makinesi Pro' },
  { sku: 'BAR-002', ad: 'Barkod Okuyucu El Tipi' },
  { sku: 'GT-BAR-50', ad: 'Güzel Bar Standı (50cm)' },
  { sku: 'APPLE-15', ad: 'MacBook Pro 14" M3 Pro' },
  { sku: 'SONY-BAR', ad: 'Sony Soundbar HT-A5000' },
  { sku: 'PHIL-BAR', ad: 'Philips Hue Lightstrip Plus' },
  { sku: '10.0001', ad: 'Fiyat Farkı Kalemi' },
  { sku: '10.0042', ad: 'Hizmet Bedeli — Bar Kurulum' },
  { sku: 'KABLO-HDMI', ad: 'HDMI 2.1 Kablo 2m' },
  { sku: 'MS-SURF', ad: 'Microsoft Surface Pro 9' },
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
}));

export const URUN_KATALOGU: UrunKaydi[] = benzersizUrunler([...tablodan, ...ekUrunler]).sort((a, b) =>
  a.ad.localeCompare(b.ad, 'tr')
);
