import type { RehberKart } from '@/admin/ortak/AdminRehberModal';
import { modulBul } from '@/admin/veri/adminMenuYapisi';

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
        ikon: '🎨',
        baslik: 'Kenarlık Rengi',
        aciklama:
          'Genel sekmesindeki «Border Rengi Seçiniz» alanından sekme, menü, aksiyon çubuğu ve rehber vurgu rengini değiştirebilirsiniz. Neon anahtarı parlaklık efektini açar.',
        renk: 'turuncu',
      },
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
    ipucu: 'Kenarlık rengi değişikliği kaydettikten sonra panel genelinde anında uygulanır.',
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

  'tanimlar-firma': {
    baslik: 'Firma Rehberi',
    altBaslik: 'Firma tanımları',
    bolumBaslik: 'Firma',
    kartlar: [
      {
        ikon: '🏢',
        baslik: 'Firma Kodu ve Unvan',
        aciklama: 'Her firma için benzersiz kod ve ticari unvan girin. Kod harf ve rakamdan oluşur.',
        renk: 'mavi',
      },
      {
        ikon: '🧾',
        baslik: 'Vergi Bilgileri',
        aciklama: 'İl filtresiyle vergi dairesini arayıp seçin. Vergi no 10 haneli olmalıdır.',
        renk: 'turuncu',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama:
          'Alt çubuktaki Düzenle veya satıra sağ tıklayarak kayıt formunu açın. Panel aksiyon çubuğunun tam üstünden açılır; turuncu kenarlık animasyonu çizgi boyunca ilerler.',
        renk: 'mor',
      },
      {
        ikon: '⚡',
        baslik: 'Hızlı Giriş',
        aciklama: 'Yeni kayıt için alt çubuktaki Yeni düğmesine basın; tablo altındaki hızlı giriş satırından kod ve ad girip Enter ile ekleyin.',
        renk: 'yesil',
      },
      {
        ikon: '✅',
        baslik: 'Aktif Durum',
        aciklama: 'Pasif firmalar seçim listelerinde görünmez.',
        renk: 'camgobegi',
      },
    ],
    ipucu: 'Yeni firma kaydında otomatik MERKEZ şube ve depo oluşturulur.',
  },

  'tanimlar-sube': {
    baslik: 'Şube Rehberi',
    altBaslik: 'Şube tanımları',
    bolumBaslik: 'Şube',
    kartlar: [
      {
        ikon: '🏪',
        baslik: 'Şube Kodu ve Adı',
        aciklama: 'Firma altında şubeleri kod ve ad ile tanımlayın.',
        renk: 'mavi',
      },
      {
        ikon: '📍',
        baslik: 'Adres',
        aciklama: 'İl ve ilçe alanlarında yazarak arama yapabilirsiniz.',
        renk: 'turuncu',
      },
      {
        ikon: '📄',
        baslik: 'E-Belge Serileri',
        aciklama: 'e-Fatura, e-Arşiv ve e-İrsaliye seri kodlarını şube bazında girin.',
        renk: 'yesil',
      },
      {
        ikon: '🏛️',
        baslik: 'Ticari Bilgiler',
        aciklama: 'MERSİS ve ticaret sicil numaralarını şube kaydında tutun.',
        renk: 'mor',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama:
          'Düzenle aksiyonu veya sağ tık menüsüyle formu açın. Panel alt çubuğun üst kenarından yükselir; kenarlık animasyonu tam o çizgide ilerler.',
        renk: 'camgobegi',
      },
    ],
    ipucu: 'Kaydet, Yeni ve Sil aksiyonları alt çubuktadır. Firma satırına tıklayarak şube listesine girin.',
  },

  'tanimlar-depo': {
    baslik: 'Depo Rehberi',
    altBaslik: 'Depo tanımları',
    bolumBaslik: 'Depo',
    kartlar: [
      {
        ikon: '📦',
        baslik: 'Şube Bağlantısı',
        aciklama: 'Her depo bir şubeye bağlıdır. Önce şube tanımlayın.',
        renk: 'mavi',
      },
      {
        ikon: '🔖',
        baslik: 'Depo Kodu ve Adı',
        aciklama: 'Depo kodu benzersiz olmalı; ad alanı listede görünür.',
        renk: 'turuncu',
      },
      {
        ikon: '📍',
        baslik: 'Adres',
        aciklama: 'Depo adresi şube adresinden farklı olabilir; isteğe bağlı doldurun.',
        renk: 'yesil',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama: 'Kayıt formu aksiyon çubuğunun hemen üstünde açılır; takvim ve hesap makinesi panelleriyle aynı kenarlık animasyonunu kullanır.',
        renk: 'mor',
      },
    ],
    ipucu: 'Firma oluşturulduğunda MERKEZ şube için varsayılan depo otomatik eklenir.',
  },

  'tanimlar-kasa': {
    baslik: 'Kasa Rehberi',
    altBaslik: 'Kasa tanımları',
    bolumBaslik: 'Kasa',
    kartlar: [
      {
        ikon: '💰',
        baslik: 'Şube Bağlantısı',
        aciklama: 'Kasalar şube bazında tanımlanır.',
        renk: 'mavi',
      },
      {
        ikon: '🔖',
        baslik: 'Kasa Kodu ve Adı',
        aciklama: 'Kasa kodu ve adı ile kayıtları ayırt edin.',
        renk: 'turuncu',
      },
      {
        ikon: '💱',
        baslik: 'Para Birimi',
        aciklama: 'TL, USD veya EUR seçin. Kasa hareketleri bu birime göre izlenir.',
        renk: 'yesil',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama: 'Alt çubuktan Düzenle ile formu açın; panel çubuğun üst çizgisinden yukarı doğru açılır.',
        renk: 'mor',
      },
    ],
    ipucu: 'Pasif kasalar yeni işlemlerde listelenmez.',
  },

  'tanimlar-donem': {
    baslik: 'Dönem Rehberi',
    altBaslik: 'Muhasebe dönemleri',
    bolumBaslik: 'Dönem',
    kartlar: [
      {
        ikon: '📅',
        baslik: 'Dönem Kodu',
        aciklama: 'Genelde yıl formatında kullanılır (ör. 2026).',
        renk: 'mavi',
      },
      {
        ikon: '📝',
        baslik: 'Dönem Adı',
        aciklama: 'Rapor ve listelerde görünecek açıklayıcı adı girin.',
        renk: 'turuncu',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama: 'Düzenle paneli aksiyon çubuğunun üstünde açılır; kenarlık animasyonu çubuğun üst çizgisi boyunca ilerler.',
        renk: 'mor',
      },
      {
        ikon: '✅',
        baslik: 'Aktif Dönem',
        aciklama: 'Aynı anda birden fazla dönem aktif olabilir; pasif dönemler seçilmez.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Dönemler firma bazında yönetilir; firma satırından Dönemler sekmesine geçin.',
  },

  'tanimlar-kayitlar': {
    baslik: 'Tanım Kayıtları Rehberi',
    altBaslik: 'Hiyerarşik kayıt yönetimi',
    bolumBaslik: 'Kayıtlar',
    kartlar: [
      {
        ikon: '🗂️',
        baslik: 'Hiyerarşi',
        aciklama:
          'Firmalar listesinden bir firmaya girerek şube ve dönem kayıtlarına; şube satırından depo ve kasa kayıtlarına ulaşın.',
        renk: 'mavi',
      },
      {
        ikon: '⚡',
        baslik: 'Hızlı Giriş',
        aciklama: 'Alt çubuktaki Yeni ile tablo altındaki hızlı giriş satırını açın; zorunlu alanları doldurup Enter ile kaydedin.',
        renk: 'yesil',
      },
      {
        ikon: '✏️',
        baslik: 'Satırı Düzenle',
        aciklama:
          'Düzenle aksiyonu veya sağ tık menüsüyle kayıt formunu açın. Panel takvim ve hesap makinesi gibi aksiyon çubuğunun tam üstünden açılır.',
        renk: 'turuncu',
      },
      {
        ikon: '📋',
        baslik: 'Sütun Yönetimi',
        aciklama: 'Sütun görünürlüğünü ayarlayın, genişlikleri sürükleyerek değiştirin. Tercihler tarayıcıda saklanır.',
        renk: 'mor',
      },
      {
        ikon: '🗑️',
        baslik: 'Silme',
        aciklama: 'Sil aksiyonu bağlı kayıtları kontrol eder; gerekirse pasif yapma seçeneği sunar.',
        renk: 'camgobegi',
      },
    ],
    ipucu: 'Görüntülediğiniz kayıt türüne göre rehber otomatik güncellenir (firma, şube, depo, kasa, dönem).',
  },

  'tanimlar-kurulum': {
    baslik: 'Kurulum Sihirbazı Rehberi',
    altBaslik: 'İlk kurulum adımları',
    bolumBaslik: 'Kurulum',
    kartlar: [
      {
        ikon: '✨',
        baslik: 'Sihirbaz Akışı',
        aciklama: 'Firma → Şube → Depo → Kasa → Dönem sırasıyla temel kayıtları oluşturun. Her adımda İleri ve Geri ile ilerleyin.',
        renk: 'mavi',
      },
      {
        ikon: '🏢',
        baslik: 'Firma ve Vergi',
        aciklama: 'İlk adımda firma kodu, unvan ve vergi bilgilerini girin. Vergi dairesi il filtresiyle aranır.',
        renk: 'turuncu',
      },
      {
        ikon: '🏪',
        baslik: 'Şube ve Adres',
        aciklama: 'MERKEZ şube varsayılan olarak gelir; adres ve e-belge serilerini bu adımda tamamlayın.',
        renk: 'yesil',
      },
      {
        ikon: '📦',
        baslik: 'Depo ve Kasa',
        aciklama: 'Depo ve kasa kayıtları şube bağlantılıdır; para birimi ve kod alanlarını kontrol edin.',
        renk: 'mor',
      },
      {
        ikon: '📅',
        baslik: 'Dönem',
        aciklama: 'Son adımda muhasebe dönemini tanımlayın. Kurulum tamamlanınca Kayıtlar görünümüne geçilir.',
        renk: 'camgobegi',
      },
    ],
    ipucu: 'Kurulumu atlayıp doğrudan Kayıtlar sekmesinden de tanım yapabilirsiniz.',
  },

  tanimlar: {
    baslik: 'Tanımlar Rehberi',
    altBaslik: 'Firma, şube, depo, kasa ve dönem',
    bolumBaslik: 'Tanımlar',
    kartlar: [
      {
        ikon: '📋',
        baslik: 'Kayıtlar ve Kurulum',
        aciklama:
          'Üstteki Kayıtlar sekmesinde hiyerarşik tablolarla tanımları yönetin; Kurulum Sihirbazı ile sıfırdan hızlı başlangıç yapın.',
        renk: 'mavi',
      },
      {
        ikon: '✏️',
        baslik: 'Düzenleme Paneli',
        aciklama: 'Satır düzenleme formu alt aksiyon çubuğunun üstünden açılır; turuncu kenarlık animasyonu çizgi boyunca ilerler.',
        renk: 'turuncu',
      },
      {
        ikon: '❓',
        baslik: 'Bağlamsal Rehber',
        aciklama: 'Kayıt türüne göre rehber içeriği otomatik değişir. Alt çubuktaki ? düğmesi veya F1 ile açın.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Firma, şube, depo, kasa ve dönem için ayrıntılı rehber kartları Kayıtlar görünümünde otomatik yüklenir.',
  },

  'datagrid-demo': {
    baslik: 'Sipariş Tablosu Rehberi',
    altBaslik: 'Datagrid demo modülü',
    bolumBaslik: 'Sipariş İçeriği',
    kartlar: [
      {
        ikon: '⚡',
        baslik: 'Hızlı Giriş',
        aciklama:
          'Tablonun altındaki hızlı giriş satırından ürün adı/kodu yazıp Enter ile satır ekleyin. % ile arama, miktar için 2*5 gibi ifadeler kullanılabilir.',
        renk: 'yesil',
      },
      {
        ikon: '🧮',
        baslik: 'Formül Desteği',
        aciklama: 'Fiyat ve iskonto alanlarında 1000+%10, 20+20 gibi ifadeler desteklenir. Formül rehberine sütun başlığından ulaşabilirsiniz.',
        renk: 'mavi',
      },
      {
        ikon: '📋',
        baslik: 'Sütun Yönetimi',
        aciklama: 'Sütunları sürükleyerek sıralayın, gizleyin veya genişliklerini ayarlayın. Tercihler tarayıcıda saklanır.',
        renk: 'mor',
      },
      {
        ikon: '🖱️',
        baslik: 'Sağ Tık Menüsü',
        aciklama: 'Satıra sağ tıklayarak kopyala, sil, satır düzenle ve toplu işlemlere erişin. Seçili satırlarla çoklu işlem yapılabilir.',
        renk: 'turuncu',
      },
      {
        ikon: '💰',
        baslik: 'KDV Modu',
        aciklama: 'KDV dahil/hariç anahtarı fiyat hesaplamalarını etkiler. Satır toplamları buna göre otomatik güncellenir.',
        renk: 'camgobegi',
      },
    ],
    ipucu: 'Ürün hücresine fareyle gelince detay kartı görünür. Değişiklikleri alt çubuktan Kaydet ile kaydedin.',
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
  ipucu: 'Aksiyon çubuğundaki ? simgesinden de rehbere ulaşabilirsiniz.',
};

export function modulRehberBul(modulId: string): ModulRehber {
  if (ADMIN_MODUL_REHBERLERI[modulId]) return ADMIN_MODUL_REHBERLERI[modulId];

  const modul = modulBul(modulId);
  const baslik = modul?.baslik ?? 'Modül';

  return {
    baslik: `${baslik} Rehberi`,
    altBaslik: `${baslik} modülü hakkında`,
    bolumBaslik: baslik,
    kartlar: VARSAYILAN_REHBER.kartlar,
    ipucu: VARSAYILAN_REHBER.ipucu,
  };
}
