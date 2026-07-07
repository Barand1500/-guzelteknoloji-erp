import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const TANIMLAR_KATEGORI = 'Tanımlar';

export interface TanimlarModulTanim {
  id: string;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const TANIMLAR_MODUL_TANIMLARI: TanimlarModulTanim[] = [
  {
    id: 'tanimlar',
    baslik: 'Tanımlar',
    ikon: '📋',
    aciklama: 'Ürün, menü, cari ve operasyon tanımlarına genel bakış',
  },
  {
    id: 'urunler-tanimlari',
    baslik: 'Ürünler Tanımları',
    ikon: '🍽️',
    aciklama: 'Ürün kartları, fiyat ve stok tanımları',
  },
  {
    id: 'menu-tanimlari',
    baslik: 'Menü Tanımları',
    ikon: '📜',
    aciklama: 'Menü grupları ve kategori yapısı',
  },
  {
    id: 'cari-tanimlari',
    baslik: 'Cari Tanımları',
    ikon: '👤',
    aciklama: 'Müşteri ve tedarikçi cari hesapları',
  },
  {
    id: 'yazici-tanimlari',
    baslik: 'Yazıcı Tanımları',
    ikon: '🖨️',
    aciklama: 'Mutfak, bar ve kasa yazıcı eşleştirmeleri',
  },
  {
    id: 'happy-hour-fiyat-listeleri',
    baslik: 'Happy Hour/Fiyat Listeleri',
    ikon: '⏰',
    aciklama: 'Saatlik indirim ve özel fiyat listeleri',
  },
  {
    id: 'tarilacak-urunler',
    baslik: 'Tartılacak Ürünler',
    ikon: '⚖️',
    aciklama: 'Tartı ile satılan ürün tanımları',
  },
  {
    id: 'favoriler',
    baslik: 'Favoriler',
    ikon: '⭐',
    aciklama: 'Hızlı erişim favori ürün ve işlemler',
  },
  {
    id: 'odeme-gruplari',
    baslik: 'Ödeme Grupları',
    ikon: '💳',
    aciklama: 'Ödeme türü grupları ve eşleştirmeler',
  },
  {
    id: 'urun-eslestir',
    baslik: 'Ürün Eşleştir',
    ikon: '🔗',
    aciklama: 'Harici sistemlerle ürün eşleştirme',
  },
  {
    id: 'e-fatura-ayarlari',
    baslik: 'E Fatura Ayarları',
    ikon: '🧾',
    aciklama: 'E-fatura entegrasyon ve gönderim ayarları',
  },
  {
    id: 'marslanacak-urunler',
    baslik: 'Marşlanacak Ürünler',
    ikon: '🔔',
    aciklama: 'Mutfak marş ve hazırlık bildirim kuralları',
  },
];

export function tanimlarAdminModulleri(): AdminModul[] {
  return TANIMLAR_MODUL_TANIMLARI.map((t) => ({
    id: t.id,
    baslik: t.baslik,
    ikon: t.ikon,
    kategori: TANIMLAR_KATEGORI,
    yol: `/gt-admin/${t.id}`,
  }));
}

export function tanimlarModulBul(id: string): TanimlarModulTanim | undefined {
  return TANIMLAR_MODUL_TANIMLARI.find((t) => t.id === id);
}

export function tanimlarSeedKayitlari(): { modulAdi: string; prefix: string }[] {
  return TANIMLAR_MODUL_TANIMLARI.map((t) => ({
    modulAdi: t.baslik.replace(/\//g, ' '),
    prefix: t.id.replace(/-/g, '_'),
  }));
}
