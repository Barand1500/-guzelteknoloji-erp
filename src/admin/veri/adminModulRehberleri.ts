import type { RehberKart } from '@/admin/ortak/AdminRehberModal';

export interface ModulRehber {
  baslik: string;
  altBaslik: string;
  bolumBaslik: string;
  kartlar: RehberKart[];
  ipucu?: string;
}

export const ADMIN_MODUL_REHBERLERI: Record<string, ModulRehber> = {
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
  return VARSAYILAN_REHBER;
}
