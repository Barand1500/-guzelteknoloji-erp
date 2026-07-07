import type { RehberKart } from '@/admin/ortak/AdminRehberModal';
import { masterSekmeRehberBul } from '@/admin/veri/adminMasterRehberleri';

export interface ModulRehber {
  baslik: string;
  altBaslik: string;
  bolumBaslik: string;
  kartlar: RehberKart[];
  ipucu?: string;
}

export const ADMIN_MODUL_REHBERLERI: Record<string, ModulRehber> = {
  master: {
    baslik: 'Master — Genel Bakış',
    altBaslik: 'Organizasyon ve lisans yönetimi',
    bolumBaslik: 'Master modülü',
    kartlar: [
      {
        ikon: '🗂️',
        baslik: 'Sekmeler',
        aciklama:
          'Sol menüden Modüller, Bayiler, Firmalar, Şubeler, Kullanıcılar, Paketler ve Lisanslar sekmelerine geçin. Her sekmenin kendi rehberi vardır.',
        renk: 'mavi',
      },
      {
        ikon: '🤝',
        baslik: 'Hiyerarşi',
        aciklama: 'Bayi → Firma → Şube zinciri organizasyonu tanımlar. Kullanıcılar ve lisanslar bu yapıya bağlanır.',
        renk: 'mor',
      },
      {
        ikon: '❓',
        baslik: 'Bu rehber',
        aciklama: 'Alt çubuktaki ? veya F1 ile açılan yardım, bulunduğunuz sekmeye göre değişir.',
        renk: 'turuncu',
      },
    ],
  },

  kullanicilar: {
    baslik: 'Kullanıcı Rehberi',
    altBaslik: 'Panel kullanıcıları',
    bolumBaslik: 'Kullanıcılar',
    kartlar: [
      {
        ikon: '👤',
        baslik: 'Kullanıcı Ekleme',
        aciklama: 'E-posta, ad soyad ve rol ile yeni kullanıcı oluşturun. Şifre ilk girişte belirlenir.',
        renk: 'mor',
      },
      {
        ikon: '🔐',
        baslik: 'Roller',
        aciklama: 'Her kullanıcıya ADMIN, EDITOR vb. rol atanır. Yetkiler Roller modülünden yönetilir.',
        renk: 'mavi',
      },
      {
        ikon: '⏸️',
        baslik: 'Aktif / Pasif',
        aciklama: 'Pasif kullanıcılar panele giriş yapamaz.',
        renk: 'turuncu',
      },
    ],
  },

  roller: {
    baslik: 'Rol Rehberi',
    altBaslik: 'Yetki ve erişim kontrolü',
    bolumBaslik: 'Roller ve Yetkiler',
    kartlar: [
      {
        ikon: '🔐',
        baslik: 'Rol Tanımları',
        aciklama: 'Her rol hangi modüllere erişebileceğini belirler. Sadece admin kullanıcılar düzenleyebilir.',
        renk: 'mor',
      },
      {
        ikon: '✅',
        baslik: 'Yetki Matrisi',
        aciklama: 'Modül bazlı okuma/yazma yetkilerini işaretleyin ve kaydedin.',
        renk: 'yesil',
      },
    ],
    ipucu: 'MÜŞTERİ rolü site müşterileri içindir; admin paneline erişemez.',
  },

  ayarlar: {
    baslik: 'Sistem Rehberi',
    altBaslik: 'Panel ve site durumu',
    bolumBaslik: 'Sistem Ayarları',
    kartlar: [
      {
        ikon: '🌐',
        baslik: 'Site Durumu',
        aciklama: 'Site aktif/pasif ve bakım modu buradan yönetilir. Bakım modunda ziyaretçilere mesaj gösterilir.',
        renk: 'mavi',
      },
      {
        ikon: '🔗',
        baslik: 'Domain',
        aciklama: 'Özel domain tanımlayabilirsiniz. DNS ayarları sunucu tarafında yapılmalıdır.',
        renk: 'mor',
      },
      {
        ikon: '📜',
        baslik: 'Log Saklama',
        aciklama: 'İşlem loglarının kaç gün tutulacağını belirleyin.',
        renk: 'camgobegi',
      },
    ],
  },

  tanimlar: {
    baslik: 'Tanımlar Rehberi',
    altBaslik: 'Restoran operasyon ayarları',
    bolumBaslik: 'Tanımlar',
    kartlar: [
      {
        ikon: '📋',
        baslik: 'Sekmeler',
        aciklama:
          'Sol menüden Tanımlar, Kullanıcılar, Masa Grupları, Barkod, Diğer, Paket Servisi Ücretleri, SMS Ayarları ve Restoran Durumu sekmelerine geçin.',
        renk: 'mavi',
      },
      {
        ikon: '🍽️',
        baslik: 'Restoran kapsamı',
        aciklama: 'Bu bölüm şube/restoran operasyon tanımlarını içerir; panel kullanıcı yönetiminden ayrıdır.',
        renk: 'mor',
      },
    ],
  },

  loglar: {
    baslik: 'Log Rehberi',
    altBaslik: 'İşlem geçmişi',
    bolumBaslik: 'Log Takibi',
    kartlar: [
      {
        ikon: '📜',
        baslik: 'Log Kayıtları',
        aciklama: 'Panelde yapılan işlemler (kaydet, sil, modül açma) otomatik loglanır.',
        renk: 'mavi',
      },
      {
        ikon: '🔍',
        baslik: 'Filtreleme',
        aciklama: 'Modül veya işlem tipine göre logları inceleyin.',
        renk: 'mor',
      },
    ],
    ipucu: 'Görev çubuğundaki tray ikonundan veya alt aksiyon çubuğundan Loglar modülüne ulaşabilirsiniz.',
  },

  'sekme-yonetimi': {
    baslik: 'Sekme Yönetimi Rehberi',
    altBaslik: 'Panel sekmelerini özelleştirin',
    bolumBaslik: 'Sekme Yönetimi',
    kartlar: [
      {
        ikon: '📐',
        baslik: 'Sekme Boyutu',
        aciklama: 'Sekme genişliği ve yüksekliğini ayarlayın. Değişiklikler üst sekme çubuğunda anında yansır.',
        renk: 'mavi',
      },
      {
        ikon: '🔀',
        baslik: 'Yan Yana Görünüm',
        aciklama: 'İlgili sekmeleri gruplayarak aynı anda iki modülü yan yana açabilirsiniz.',
        renk: 'mor',
      },
      {
        ikon: '🪟',
        baslik: 'Ayrı Pencere',
        aciklama: 'Sekmeyi aşağı sürükleyerek yüzen pencere olarak ayırabilirsiniz.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'Ayarlar tarayıcıda saklanır; farklı cihazlarda ayrı yapılandırma gerekir.',
  },

  'kisayol-ayarlari': {
    baslik: 'Kısayol Ayarları Rehberi',
    altBaslik: 'Klavye kısayollarını düzenleyin',
    bolumBaslik: 'Kısayol Ayarları',
    kartlar: [
      {
        ikon: '⌨️',
        baslik: 'Kısayol Atama',
        aciklama: 'Kaydet, önizle ve yardım gibi aksiyonlara özel tuş kombinasyonları tanımlayın.',
        renk: 'yesil',
      },
      {
        ikon: '📖',
        baslik: 'F1 Yardım',
        aciklama: 'Varsayılan F1 tuşu modül rehberini açar. İsterseniz farklı bir tuşa atayabilirsiniz.',
        renk: 'mavi',
      },
    ],
    ipucu: 'Çakışan kısayollar uyarı verir; kaydetmeden önce kontrol edin.',
  },

  'veri-yedekleme': {
    baslik: 'Yedekleme Rehberi',
    altBaslik: 'Veri güvenliği',
    bolumBaslik: 'Veri Yedekleme',
    kartlar: [
      {
        ikon: '💾',
        baslik: 'Yedek Oluşturma',
        aciklama: 'Mevcut site verilerinin anlık yedeğini alın. JSON, SQL veya ZIP formatında indirilebilir.',
        renk: 'yesil',
      },
      {
        ikon: '📥',
        baslik: 'Geri Yükleme',
        aciklama: 'Önceki yedek dosyasını seçerek verileri geri yükleyin. Dikkatli kullanın.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'Düzenli yedek almayı alışkanlık haline getirin.',
  },

  'urunler-tanimlari': {
    baslik: 'Ürün Tanımları Rehberi',
    altBaslik: 'Ürün kartları ve seçenekler',
    bolumBaslik: 'Ürünler Tanımları',
    kartlar: [
      {
        ikon: '🍽️',
        baslik: 'Ürün Kartı',
        aciklama:
          'Sol listeden ürün seçin veya Yeni ile kart oluşturun. Kod, ad, fiyat, KDV ve grup bilgilerini doldurun.',
        renk: 'mavi',
      },
      {
        ikon: '🧩',
        baslik: 'Seviye & Seçenekler',
        aciklama:
          'Combo ve menü ürünlerinde 1./2. seviye seçimler ile ek seçenek satırlarını tanımlayın.',
        renk: 'mor',
      },
      {
        ikon: '📋',
        baslik: 'Liste Görünümü',
        aciklama: 'Sağ üstteki Liste/Kart geçişi veya alt çubuktaki önizle ile tüm ürünleri tablo halinde görün.',
        renk: 'turuncu',
      },
    ],
  },

  'yazici-tanimlari': {
    baslik: 'Yazıcı Tanımları Rehberi',
    altBaslik: 'Çıktı yönlendirme kuralları',
    bolumBaslik: 'Yazıcı Tanımları',
    kartlar: [
      {
        ikon: '🍳',
        baslik: 'Mutfak Çıktıları',
        aciklama:
          'Bilgisayar, masa prefix, garson ve ürün eşleşmesine göre mutfak yazıcısı veya mutfak ekranı tanımlayın.',
        renk: 'turuncu',
      },
      {
        ikon: '🧾',
        baslik: 'Pusula & Adisyon',
        aciklama: 'Pusula ve resmi adisyon sekmelerinde bilgisayar + garson → yazıcı eşleştirmesi yapın.',
        renk: 'mavi',
      },
      {
        ikon: '✳️',
        baslik: 'Tümü (*)',
        aciklama: 'Alan yanındaki Tümü butonu veya * değeri, o alan için tüm kayıtları kapsar.',
        renk: 'mor',
      },
    ],
  },

  'tarilacak-urunler': {
    baslik: 'Tartılacak Ürünler Rehberi',
    altBaslik: 'Gramajla satılan ürünler',
    bolumBaslik: 'Tartılacak Ürünler',
    kartlar: [
      {
        ikon: '⚖️',
        baslik: 'Ürün işaretleme',
        aciklama: 'Satıra tıklayarak ürünü tartılı olarak işaretleyin. Kasada gramaj girişi açılır.',
        renk: 'mavi',
      },
      {
        ikon: '🔍',
        baslik: 'Arama ve filtre',
        aciklama: 'Ürün adı, stok kodu veya gruba göre arayın. Filtredekileri toplu seç/kaldır kullanın.',
        renk: 'mor',
      },
      {
        ikon: '📂',
        baslik: 'Grup seçimi',
        aciklama: 'Grup başlığındaki kutucukla o gruptaki tüm ürünleri tek seferde seçebilirsiniz.',
        renk: 'turuncu',
      },
    ],
  },
};

const VARSAYILAN_REHBER: ModulRehber = {
  baslik: 'Modül Rehberi',
  altBaslik: 'Bu modül hakkında genel bilgi',
  bolumBaslik: 'Yardım',
  kartlar: [
    {
      ikon: '⌨️',
      baslik: 'Kısayollar',
      aciklama: 'F1 ile bu rehberi açıp kapatabilirsiniz. ESC ile de kapanır.',
      renk: 'yesil',
    },
    {
      ikon: '💾',
      baslik: 'Kaydetme',
      aciklama: 'Değişikliklerinizi alt aksiyon çubuğundaki Kaydet ile kaydedin.',
      renk: 'mavi',
    },
  ],
};

export function modulRehberBul(modulId: string): ModulRehber {
  if (ADMIN_MODUL_REHBERLERI[modulId]) return ADMIN_MODUL_REHBERLERI[modulId];

  if (modulId.startsWith('master-')) {
    const sekmeRehber = masterSekmeRehberBul(modulId.slice('master-'.length));
    if (sekmeRehber) return sekmeRehber;
  }

  return VARSAYILAN_REHBER;
}
