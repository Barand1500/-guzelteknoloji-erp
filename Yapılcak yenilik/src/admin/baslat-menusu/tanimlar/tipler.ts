export type TanimlarSekmeId =
  | 'genel'
  | 'kullanicilar'
  | 'masa-gruplari'
  | 'barkod'
  | 'diger'
  | 'paket-servisi-ucretleri'
  | 'sms-ayarlari'
  | 'restoran-durumu';

export interface TanimlarSekmeTanim {
  id: TanimlarSekmeId;
  ad: string;
  ikon: string;
  altBaslik: string;
}

export const TANIMLAR_SEKMELER: TanimlarSekmeTanim[] = [
  {
    id: 'genel',
    ad: 'Tanımlar',
    ikon: '📋',
    altBaslik: 'Genel tanım ve parametreler',
  },
  {
    id: 'kullanicilar',
    ad: 'Kullanıcılar',
    ikon: '👥',
    altBaslik: 'Restoran kullanıcıları ve yetkiler',
  },
  {
    id: 'masa-gruplari',
    ad: 'Masa Grupları',
    ikon: '🪑',
    altBaslik: 'Salon, teras ve bölüm masa grupları',
  },
  {
    id: 'barkod',
    ad: 'Barkod',
    ikon: '🏷️',
    altBaslik: 'Barkod ve etiket ayarları',
  },
  {
    id: 'diger',
    ad: 'Diğer',
    ikon: '⚙️',
    altBaslik: 'Diğer operasyon tanımları',
  },
  {
    id: 'paket-servisi-ucretleri',
    ad: 'Paket Servisi Ücretleri',
    ikon: '🛵',
    altBaslik: 'Paket ve teslimat ücret kuralları',
  },
  {
    id: 'sms-ayarlari',
    ad: 'SMS Ayarları',
    ikon: '💬',
    altBaslik: 'SMS sağlayıcı ve bildirim şablonları',
  },
  {
    id: 'restoran-durumu',
    ad: 'Restoran Durumu',
    ikon: '🍽️',
    altBaslik: 'Açık/kapalı durum ve çalışma modu',
  },
];

export function tanimlarSekmeBul(id: TanimlarSekmeId): TanimlarSekmeTanim {
  return TANIMLAR_SEKMELER.find((s) => s.id === id) ?? TANIMLAR_SEKMELER[0];
}
