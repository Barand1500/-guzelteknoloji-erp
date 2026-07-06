import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const UYGULAMA_AYARLAR_KATEGORI = 'Ayarlar';

export interface UygulamaAyarlarModulTanim {
  id: string;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const UYGULAMA_AYARLAR_MODUL_TANIMLARI: UygulamaAyarlarModulTanim[] = [
  {
    id: 'arctos-db-ayarlari',
    baslik: 'Arctos Db Ayarları',
    ikon: '🗄️',
    aciklama: 'Arctos veritabanı bağlantı ve senkronizasyon ayarları',
  },
  {
    id: 'firma-donem-secimi',
    baslik: 'Firma/Dönem Seçimi',
    ikon: '🏢',
    aciklama: 'Aktif firma ve muhasebe dönemi seçimi',
  },
  {
    id: 'lisans-ayarlari',
    baslik: 'Lisans Ayarları',
    ikon: '🔑',
    aciklama: 'Lisans anahtarı ve kullanım bilgileri',
  },
  {
    id: 'ozellestirme',
    baslik: 'Özelleştirme',
    ikon: '🎨',
    aciklama: 'Uygulama görünüm ve davranış özelleştirmeleri',
  },
  {
    id: 'web-api-ayarlari',
    baslik: 'Web Api Ayarları',
    ikon: '🌐',
    aciklama: 'Web API adresi, kimlik doğrulama ve entegrasyon ayarları',
  },
];

export function uygulamaAyarlarAdminModulleri(): AdminModul[] {
  return UYGULAMA_AYARLAR_MODUL_TANIMLARI.map((m) => ({
    id: m.id,
    baslik: m.baslik,
    ikon: m.ikon,
    kategori: UYGULAMA_AYARLAR_KATEGORI,
    yol: `/gt-admin/${m.id}`,
  }));
}

export function uygulamaAyarlarModulBul(id: string): UygulamaAyarlarModulTanim | undefined {
  return UYGULAMA_AYARLAR_MODUL_TANIMLARI.find((m) => m.id === id);
}

export function uygulamaAyarlarSeedKayitlari(): { modulAdi: string; prefix: string }[] {
  return UYGULAMA_AYARLAR_MODUL_TANIMLARI.map((m) => ({
    modulAdi: m.baslik,
    prefix: m.id.replace(/-/g, '_'),
  }));
}
