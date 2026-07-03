import { adminModulleri, adminGizliModuller, adminKategoriler } from '@/admin/veri/adminMenuYapisi';

/** Panel arayüzündeki tüm metin anahtarları — Türkçe kaynak */
export const PANEL_SOZLUK_TR: Record<string, string> = {
  // Ortak
  'ortak.kaydet': 'Kaydet',
  'ortak.sil': 'Sil',
  'ortak.ekle': 'Yeni Ekle',
  'ortak.guncelle': 'Güncelle',
  'ortak.onizle': 'Önizle',
  'ortak.yayinla': 'Yayınla',
  'ortak.yukleniyor': 'Yükleniyor...',
  'ortak.iptal': 'İptal',
  'ortak.kapat': 'Kapat',
  'ortak.ara': 'Ara',
  'ortak.geri': 'Geri',
  'ortak.ileri': 'İleri',
  'ortak.evet': 'Evet',
  'ortak.hayir': 'Hayır',
  'ortak.aktif': 'Aktif',
  'ortak.pasif': 'Pasif',
  'ortak.basari': 'İşlem başarılı',
  'ortak.hata': 'Bir hata oluştu',

  // Header / footer
  'header.baslatMenu': 'Başlat Menüsü',
  'header.modulAra': 'Modül veya ayar ara',
  'header.profil': 'Profil',
  'header.bildirimler': 'Bildirimler',
  'header.geceModu': 'Gece moduna geç',
  'header.gunduzModu': 'Gündüz moduna geç',
  'header.siteOnizle': 'Siteyi Önizle',
  'footer.veriYedekle': 'Veri Yedekle',
  'footer.logTakibi': 'Log Takibi',

  // Aksiyonlar
  'aksiyon.kaydet': 'Kaydet',
  'aksiyon.hizliKaydet': 'Hızlı Kaydet',
  'aksiyon.sil': 'Sil',
  'aksiyon.ekle': 'Yeni Ekle',
  'aksiyon.guncelle': 'Güncelle',
  'aksiyon.guncelle.arctos-db-ayarlari': 'Sına',
  'aksiyon.onizle': 'Önizle',
  'aksiyon.yayinla': 'Yayınla',
  'aksiyon.oncekiKayit': 'Önceki',
  'aksiyon.sonrakiKayit': 'Sonraki',

  // Sistem ayarları
  'sistem.baslik': 'Sistem Ayarları',
  'sistem.aciklama': 'Site durumu, bakım, 404 ve panel tercihleri',
  'sistem.sekme.genel': 'Genel',
  'sistem.sekme.bakim': 'Bakım Modu',
  'sistem.sekme.sayfa404': '404 Sayfası',
  'sistem.sekme.dil': 'Panel Dili',
  'sistem.sekme.guvenlik': 'Güvenlik',
  'sistem.sekme.sistem': 'Sistem',
  'sistem.siteAktif': 'Site Aktif',
  'sistem.siteAktifAciklama': 'Kapalıyken ziyaretçiler siteye erişemez',
  'sistem.bakimModu': 'Bakım Modu',
  'sistem.bakimModuAciklama': 'Açıkken ziyaretçilere bakım ekranı gösterilir',
  'sistem.domain': 'Özel Domain',
  'sistem.panelDili': 'Panel Dili',
  'sistem.ceviriAyar': 'Çeviri Ayarları',
  'sistem.ceviriJson': 'Panel metinleri (JSON)',
  'sistem.ceviriIndir': 'JSON İndir',
  'sistem.ceviriYukle': 'JSON Yükle',
  'sistem.ceviriSifirla': 'Varsayılana Dön',

  // Arama
  'menu.aramaSonuc': 'Arama sonuçları',
};

// Modül ve kategori anahtarlarını otomatik ekle
for (const m of [...adminModulleri, ...adminGizliModuller]) {
  PANEL_SOZLUK_TR[`modul.${m.id}`] = m.baslik;
}
for (const k of adminKategoriler) {
  PANEL_SOZLUK_TR[`kategori.${k}`] = k;
}

/** İngilizce varsayılan çeviriler */
export const PANEL_SOZLUK_EN: Record<string, string> = {
  'ortak.kaydet': 'Save',
  'ortak.sil': 'Delete',
  'ortak.ekle': 'Add New',
  'ortak.guncelle': 'Update',
  'ortak.onizle': 'Preview',
  'ortak.yayinla': 'Publish',
  'ortak.yukleniyor': 'Loading...',
  'ortak.iptal': 'Cancel',
  'ortak.kapat': 'Close',
  'ortak.ara': 'Search',
  'ortak.geri': 'Back',
  'ortak.ileri': 'Next',
  'ortak.evet': 'Yes',
  'ortak.hayir': 'No',
  'ortak.aktif': 'Active',
  'ortak.pasif': 'Inactive',
  'ortak.basari': 'Operation successful',
  'ortak.hata': 'An error occurred',

  'header.baslatMenu': 'Start Menu',
  'header.modulAra': 'Search modules or settings',
  'header.profil': 'Profile',
  'header.bildirimler': 'Notifications',
  'header.geceModu': 'Switch to dark mode',
  'header.gunduzModu': 'Switch to light mode',
  'header.siteOnizle': 'Preview Site',
  'footer.veriYedekle': 'Backup Data',
  'footer.logTakibi': 'View Logs',

  'aksiyon.kaydet': 'Save',
  'aksiyon.hizliKaydet': 'Quick Save',
  'aksiyon.sil': 'Delete',
  'aksiyon.ekle': 'Add New',
  'aksiyon.guncelle': 'Update',
  'aksiyon.guncelle.arctos-db-ayarlari': 'Test',
  'aksiyon.onizle': 'Preview',
  'aksiyon.yayinla': 'Publish',
  'aksiyon.oncekiKayit': 'Previous',
  'aksiyon.sonrakiKayit': 'Next',

  'sistem.baslik': 'System Settings',
  'sistem.aciklama': 'Site status, maintenance, 404 and panel preferences',
  'sistem.sekme.genel': 'General',
  'sistem.sekme.bakim': 'Maintenance',
  'sistem.sekme.sayfa404': '404 Page',
  'sistem.sekme.dil': 'Panel Language',
  'sistem.sekme.guvenlik': 'Security',
  'sistem.sekme.sistem': 'System',
  'sistem.siteAktif': 'Site Active',
  'sistem.siteAktifAciklama': 'Visitors cannot access the site when off',
  'sistem.bakimModu': 'Maintenance Mode',
  'sistem.bakimModuAciklama': 'Shows maintenance screen to visitors',
  'sistem.domain': 'Custom Domain',
  'sistem.panelDili': 'Panel Language',
  'sistem.ceviriAyar': 'Translation Settings',
  'sistem.ceviriJson': 'Panel texts (JSON)',
  'sistem.ceviriIndir': 'Download JSON',
  'sistem.ceviriYukle': 'Upload JSON',
  'sistem.ceviriSifirla': 'Reset to Default',

  'menu.aramaSonuc': 'Search results',

  'modul.dashboard': 'Dashboard',
  'modul.site-ayarlari': 'Site Settings',
  'modul.sayfalar': 'Pages',
  'modul.widget-yonetimi': 'Widget Management',
  'modul.medya': 'Media Gallery',
  'modul.seo': 'SEO Settings',
  'modul.header': 'Header Management',
  'modul.hero': 'Hero Management',
  'modul.menu-yonetimi': 'Menu Management',
  'modul.footer': 'Footer Management',
  'modul.blog': 'Blog / News',
  'modul.formlar': 'Forms',
  'modul.kullanicilar': 'Users',
  'modul.roller': 'Roles & Permissions',
  'modul.ayarlar': 'Settings',
  'modul.loglar': 'Activity Logs',
  'modul.veri-yedekleme': 'Data Backup',

  'kategori.Hızlı Erişim': 'Quick Access',
  'kategori.Site Yönetimi': 'Site Management',
  'kategori.İçerik Yönetimi': 'Content Management',
  'kategori.Müşteri / Ajans': 'Customer / Agency',
  'kategori.Tanımlar': 'Definitions',
  'kategori.Sistem': 'System',
};

export const PANEL_VARSAYILAN_DILLER: Record<string, Record<string, string>> = {
  tr: PANEL_SOZLUK_TR,
  en: PANEL_SOZLUK_EN,
};

export function panelSozlukBirlestir(
  dil: string,
  ozelCeviriler: Record<string, Record<string, string>> = {}
): Record<string, string> {
  const tr = PANEL_SOZLUK_TR;
  const varsayilan = PANEL_VARSAYILAN_DILLER[dil] ?? {};
  const ozel = ozelCeviriler[dil] ?? {};

  const tumAnahtarlar = new Set([...Object.keys(tr), ...Object.keys(varsayilan), ...Object.keys(ozel)]);

  const sonuc: Record<string, string> = {};
  for (const anahtar of tumAnahtarlar) {
    sonuc[anahtar] = ozel[anahtar] ?? varsayilan[anahtar] ?? tr[anahtar] ?? anahtar;
  }
  return sonuc;
}

export function panelCeviriMetni(
  anahtar: string,
  dil: string,
  ozelCeviriler: Record<string, Record<string, string>> = {},
  yedek?: string
): string {
  const sozluk = panelSozlukBirlestir(dil, ozelCeviriler);
  return sozluk[anahtar] ?? yedek ?? PANEL_SOZLUK_TR[anahtar] ?? anahtar;
}

export function panelJsonDisaAktar(dil: string, ozelCeviriler: Record<string, Record<string, string>> = {}): string {
  const sozluk = panelSozlukBirlestir(dil, ozelCeviriler);
  const sirali = Object.keys(sozluk)
    .sort()
    .reduce<Record<string, string>>((acc, k) => {
      acc[k] = sozluk[k];
      return acc;
    }, {});
  return JSON.stringify(sirali, null, 2);
}

export function panelJsonIceAktar(metin: string): Record<string, string> {
  const veri = JSON.parse(metin) as unknown;
  if (!veri || typeof veri !== 'object' || Array.isArray(veri)) {
    throw new Error('Geçersiz JSON formatı');
  }
  const sonuc: Record<string, string> = {};
  for (const [k, v] of Object.entries(veri as Record<string, unknown>)) {
    if (typeof v === 'string') sonuc[k] = v;
  }
  return sonuc;
}
