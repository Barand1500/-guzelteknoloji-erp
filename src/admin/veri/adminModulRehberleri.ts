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
        ikon: 'kullanici',
        baslik: 'Kullanıcı Ekleme',
        aciklama: 'E-posta, ad soyad ve rol ile yeni kullanıcı oluşturun. Şifre ilk girişte belirlenir.',
        renk: 'mor',
      },
      {
        ikon: 'kilit',
        baslik: 'Roller',
        aciklama: 'Her kullanıcıya ADMIN, EDITOR vb. rol atanır. Yetkiler Roller modülünden yönetilir.',
        renk: 'mavi',
      },
      {
        ikon: 'duraklat',
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
        ikon: 'kilit',
        baslik: 'Rol Tanımları',
        aciklama: 'Her rol hangi modüllere erişebileceğini belirler. Sadece admin kullanıcılar düzenleyebilir.',
        renk: 'mor',
      },
      {
        ikon: 'onay',
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
        ikon: 'palet',
        baslik: 'Kenarlık Rengi',
        aciklama:
          'Genel sekmesindeki «Border Rengi Seçiniz» alanından sekme, menü, aksiyon çubuğu ve rehber vurgu rengini değiştirebilirsiniz. Neon anahtarı parlaklık efektini açar.',
        renk: 'turuncu',
      },
      {
        ikon: 'kure',
        baslik: 'Site Durumu',
        aciklama: 'Site aktif/pasif ve bakım modu buradan yönetilir. Bakım modunda ziyaretçilere mesaj gösterilir.',
        renk: 'mavi',
      },
      {
        ikon: 'baglanti',
        baslik: 'Domain',
        aciklama: 'Özel domain tanımlayabilirsiniz. DNS ayarları sunucu tarafında yapılmalıdır.',
        renk: 'mor',
      },
      {
        ikon: 'kayit',
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
        ikon: 'kayit',
        baslik: 'Log Kayıtları',
        aciklama: 'Panelde yapılan işlemler (kaydet, sil, modül açma) otomatik loglanır.',
        renk: 'mavi',
      },
      {
        ikon: 'ara',
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
        ikon: 'cetvel',
        baslik: 'Sekme Boyutu',
        aciklama: 'Sekme genişliği ve yüksekliğini ayarlayın. Değişiklikler üst sekme çubuğunda anında yansır.',
        renk: 'mavi',
      },
      {
        ikon: 'karistir',
        baslik: 'Yan Yana Görünüm',
        aciklama: 'İlgili sekmeleri gruplayarak aynı anda iki modülü yan yana açabilirsiniz.',
        renk: 'mor',
      },
      {
        ikon: 'pencere',
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
        ikon: 'klavye',
        baslik: 'Kısayol Atama',
        aciklama: 'Kaydet, önizle ve yardım gibi aksiyonlara özel tuş kombinasyonları tanımlayın.',
        renk: 'yesil',
      },
      {
        ikon: 'kitap',
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
        ikon: 'firma',
        baslik: 'Firma Kodu ve Unvan',
        aciklama: 'Her firma için benzersiz kod ve ticari unvan girin. Kod harf ve rakamdan oluşur.',
        renk: 'mavi',
      },
      {
        ikon: 'fatura',
        baslik: 'Vergi Bilgileri',
        aciklama: 'İl filtresiyle vergi dairesini arayıp seçin. Vergi no 10 haneli olmalıdır.',
        renk: 'turuncu',
      },
      {
        ikon: 'kalem',
        baslik: 'Satırı Düzenle',
        aciklama:
          'Alt çubuktaki Düzenle veya satıra sağ tıklayarak kayıt formunu açın. Panel aksiyon çubuğunun tam üstünden açılır; turuncu kenarlık animasyonu çizgi boyunca ilerler.',
        renk: 'mor',
      },
      {
        ikon: 'yildirim',
        baslik: 'Hızlı Giriş',
        aciklama: 'Yeni kayıt için alt çubuktaki Yeni düğmesine basın; tablo altındaki hızlı giriş satırından kod ve ad girip Enter ile ekleyin.',
        renk: 'yesil',
      },
      {
        ikon: 'onay',
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
        ikon: 'sube',
        baslik: 'Şube Kodu ve Adı',
        aciklama: 'Firma altında şubeleri kod ve ad ile tanımlayın.',
        renk: 'mavi',
      },
      {
        ikon: 'konum',
        baslik: 'Adres',
        aciklama: 'İl ve ilçe alanlarında yazarak arama yapabilirsiniz.',
        renk: 'turuncu',
      },
      {
        ikon: 'belge',
        baslik: 'E-Belge Serileri',
        aciklama: 'e-Fatura, e-Arşiv ve e-İrsaliye seri kodlarını şube bazında girin.',
        renk: 'yesil',
      },
      {
        ikon: 'bina',
        baslik: 'Ticari Bilgiler',
        aciklama: 'MERSİS ve ticaret sicil numaralarını şube kaydında tutun.',
        renk: 'mor',
      },
      {
        ikon: 'kalem',
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
        ikon: 'depo',
        baslik: 'Şube Bağlantısı',
        aciklama: 'Her depo bir şubeye bağlıdır. Önce şube tanımlayın.',
        renk: 'mavi',
      },
      {
        ikon: 'etiket',
        baslik: 'Depo Kodu ve Adı',
        aciklama: 'Depo kodu benzersiz olmalı; ad alanı listede görünür.',
        renk: 'turuncu',
      },
      {
        ikon: 'konum',
        baslik: 'Adres',
        aciklama: 'Depo adresi şube adresinden farklı olabilir; isteğe bağlı doldurun.',
        renk: 'yesil',
      },
      {
        ikon: 'kalem',
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
        ikon: 'para',
        baslik: 'Şube Bağlantısı',
        aciklama: 'Kasalar şube bazında tanımlanır.',
        renk: 'mavi',
      },
      {
        ikon: 'etiket',
        baslik: 'Kasa Kodu ve Adı',
        aciklama: 'Kasa kodu ve adı ile kayıtları ayırt edin.',
        renk: 'turuncu',
      },
      {
        ikon: 'doviz',
        baslik: 'Para Birimi',
        aciklama: 'TL, USD veya EUR seçin. Kasa hareketleri bu birime göre izlenir.',
        renk: 'yesil',
      },
      {
        ikon: 'kalem',
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
        ikon: 'takvim',
        baslik: 'Dönem Kodu',
        aciklama: 'Genelde yıl formatında kullanılır (ör. 2026).',
        renk: 'mavi',
      },
      {
        ikon: 'not',
        baslik: 'Dönem Adı',
        aciklama: 'Rapor ve listelerde görünecek açıklayıcı adı girin.',
        renk: 'turuncu',
      },
      {
        ikon: 'kalem',
        baslik: 'Satırı Düzenle',
        aciklama: 'Düzenle paneli aksiyon çubuğunun üstünde açılır; kenarlık animasyonu çubuğun üst çizgisi boyunca ilerler.',
        renk: 'mor',
      },
      {
        ikon: 'onay',
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
        ikon: 'klasor',
        baslik: 'Hiyerarşi',
        aciklama:
          'Firmalar listesinden bir firmaya girerek şube ve dönem kayıtlarına; şube satırından depo ve kasa kayıtlarına ulaşın.',
        renk: 'mavi',
      },
      {
        ikon: 'yildirim',
        baslik: 'Hızlı Giriş',
        aciklama: 'Alt çubuktaki Yeni ile tablo altındaki hızlı giriş satırını açın; zorunlu alanları doldurup Enter ile kaydedin.',
        renk: 'yesil',
      },
      {
        ikon: 'kalem',
        baslik: 'Satırı Düzenle',
        aciklama:
          'Düzenle aksiyonu veya sağ tık menüsüyle kayıt formunu açın. Panel takvim ve hesap makinesi gibi aksiyon çubuğunun tam üstünden açılır.',
        renk: 'turuncu',
      },
      {
        ikon: 'liste',
        baslik: 'Sütun Yönetimi',
        aciklama: 'Sütun görünürlüğünü ayarlayın, genişlikleri sürükleyerek değiştirin. Tercihler tarayıcıda saklanır.',
        renk: 'mor',
      },
      {
        ikon: 'cop',
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
        ikon: 'yildiz',
        baslik: 'Sihirbaz Akışı',
        aciklama: 'Firma → Şube → Depo → Kasa → Dönem sırasıyla temel kayıtları oluşturun. Her adımda İleri ve Geri ile ilerleyin.',
        renk: 'mavi',
      },
      {
        ikon: 'firma',
        baslik: 'Firma ve Vergi',
        aciklama: 'İlk adımda firma kodu, unvan ve vergi bilgilerini girin. Vergi dairesi il filtresiyle aranır.',
        renk: 'turuncu',
      },
      {
        ikon: 'sube',
        baslik: 'Şube ve Adres',
        aciklama: 'MERKEZ şube varsayılan olarak gelir; adres ve e-belge serilerini bu adımda tamamlayın.',
        renk: 'yesil',
      },
      {
        ikon: 'depo',
        baslik: 'Depo ve Kasa',
        aciklama: 'Depo ve kasa kayıtları şube bağlantılıdır; para birimi ve kod alanlarını kontrol edin.',
        renk: 'mor',
      },
      {
        ikon: 'takvim',
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
        ikon: 'liste',
        baslik: 'Kayıtlar ve Kurulum',
        aciklama:
          'Üstteki Kayıtlar sekmesinde hiyerarşik tablolarla tanımları yönetin; Kurulum Sihirbazı ile sıfırdan hızlı başlangıç yapın.',
        renk: 'mavi',
      },
      {
        ikon: 'kalem',
        baslik: 'Düzenleme Paneli',
        aciklama: 'Satır düzenleme formu alt aksiyon çubuğunun üstünden açılır; turuncu kenarlık animasyonu çizgi boyunca ilerler.',
        renk: 'turuncu',
      },
      {
        ikon: 'soru',
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
        ikon: 'yildirim',
        baslik: 'Hızlı Giriş',
        aciklama:
          'Tablonun altındaki hızlı giriş satırından ürün adı/kodu yazıp Enter ile satır ekleyin. % ile arama, miktar için 2*5 gibi ifadeler kullanılabilir.',
        renk: 'yesil',
      },
      {
        ikon: 'hesap',
        baslik: 'Formül Desteği',
        aciklama: 'Fiyat ve iskonto alanlarında 1000+%10, 20+20 gibi ifadeler desteklenir. Formül rehberine sütun başlığından ulaşabilirsiniz.',
        renk: 'mavi',
      },
      {
        ikon: 'liste',
        baslik: 'Sütun Yönetimi',
        aciklama: 'Sütunları sürükleyerek sıralayın, gizleyin veya genişliklerini ayarlayın. Tercihler tarayıcıda saklanır.',
        renk: 'mor',
      },
      {
        ikon: 'fare',
        baslik: 'Sağ Tık Menüsü',
        aciklama: 'Satıra sağ tıklayarak kopyala, sil, satır düzenle ve toplu işlemlere erişin. Seçili satırlarla çoklu işlem yapılabilir.',
        renk: 'turuncu',
      },
      {
        ikon: 'para',
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
        ikon: 'kaydet',
        baslik: 'Yedek Oluşturma',
        aciklama: 'Mevcut site verilerinin anlık yedeğini alın. JSON, SQL veya ZIP formatında indirilebilir.',
        renk: 'yesil',
      },
      {
        ikon: 'indir',
        baslik: 'Geri Yükleme',
        aciklama: 'Önceki yedek dosyasını seçerek verileri geri yükleyin. Dikkatli kullanın.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'Düzenli yedek almayı alışkanlık haline getirin.',
  },

  'ozel-tanimlar': {
    baslik: 'Özel Tanımlar Rehberi',
    altBaslik: 'Para birimi, vergi, banka ve diğer kataloglar',
    bolumBaslik: 'Özel Tanımlar',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Katalog Seçimi',
        aciklama:
          'Hub ekranından para birimleri, vergiler, cari/stok tipleri, banka-kart ve resmi tatil kataloglarına geçin.',
        renk: 'mavi',
      },
      {
        ikon: 'indir',
        baslik: 'Dışa Aktar',
        aciklama: 'Para birimleri gibi listelerde Dışa Aktar ile CSV, Excel, PDF veya panoya kopya alın.',
        renk: 'turuncu',
      },
      {
        ikon: 'kalem',
        baslik: 'Ekle / Düzenle',
        aciklama: 'Ekle düğmesi veya satır düzenleme ile kayıtları yönetin. Silme onayı zorunlu alanlarda sorulur.',
        renk: 'yesil',
      },
      {
        ikon: 'kilit',
        baslik: 'Şifre Kapısı',
        aciklama: 'Hassas kataloglar şifre kapısı arkasında olabilir; oturum süresince tekrar sorulmayabilir.',
        renk: 'mor',
      },
    ],
    ipucu: 'F1 veya alt çubuktaki ? ile bu rehberi istediğiniz zaman açabilirsiniz.',
  },

  cari: {
    baslik: 'Cari Rehberi',
    altBaslik: 'Cari kartlar ve liste',
    bolumBaslik: 'Cari',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Liste ve Kart',
        aciklama: 'Cari kayıtlarını tablo veya kart görünümünde inceleyin; hızlı arama ve gelişmiş filtre kullanın.',
        renk: 'mavi',
      },
      {
        ikon: 'kalem',
        baslik: 'Düzenleme',
        aciklama: 'Satıra tıklayarak veya sağ tık / Düzenle ile cari formunu açın.',
        renk: 'turuncu',
      },
      {
        ikon: 'onay',
        baslik: 'Aktif / Pasif',
        aciklama: 'Seçili kayıtları sağ tık menüsünden toplu aktif veya pasif yapabilirsiniz.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Yeni cari için alt çubuktaki Yeni düğmesini kullanın.',
  },

  stoklar: {
    baslik: 'Stoklar Rehberi',
    altBaslik: 'Stok kartları ve analizler',
    bolumBaslik: 'Stoklar',
    kartlar: [
      {
        ikon: 'depo',
        baslik: 'Stok Listesi',
        aciklama: 'Stokları filtreleyin, seçin ve kart / liste görünümleri arasında geçiş yapın.',
        renk: 'mavi',
      },
      {
        ikon: 'kalem',
        baslik: 'Stok Kartı',
        aciklama: 'Düzenle veya satıra çift tık ile stok kartını açın; fiyat ve birim ekranlarına geçebilirsiniz.',
        renk: 'turuncu',
      },
      {
        ikon: 'hesap',
        baslik: 'Analizler',
        aciklama: 'Fiyat analiz, envanter ve birim listesi araçlarına aksiyon çubuğundan ulaşın.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Sağ tık menüsünden seçili stokları aktif/pasif yapabilir veya seçimi temizleyebilirsiniz.',
  },

  'banka-anlasmalari': {
    baslik: 'Banka Anlaşmaları Rehberi',
    altBaslik: 'Banka kayıtları',
    bolumBaslik: 'Bankalar',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Liste Görünümü',
        aciklama: 'Banka anlaşmalarını tabloda arayın, filtreleyin ve seçin.',
        renk: 'mavi',
      },
      {
        ikon: 'kalem',
        baslik: 'Kart Düzenleme',
        aciklama: 'Düzenle veya sağ tık ile banka kartını açın; kaydı güncelleyin.',
        renk: 'turuncu',
      },
      {
        ikon: 'onay',
        baslik: 'Durum',
        aciklama: 'Seçili kayıtları aktif veya pasif yapın; seçimi temizleyin.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Yeni banka anlaşması için alt çubuktaki Yeni düğmesini kullanın.',
  },

  'alis-faturasi': {
    baslik: 'Alış Faturası Rehberi',
    altBaslik: 'Tedarikçi faturaları',
    bolumBaslik: 'Alış Faturası',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Liste ve Yeni',
        aciklama: 'Kayıtlı alış faturalarını görüntüleyin; Yeni Fatura ile taslak oluşturun.',
        renk: 'mavi',
      },
      {
        ikon: 'yildirim',
        baslik: 'Fatura İçeriği',
        aciklama:
          'Satır tablosu Sipariş İçeriği ile aynıdır. Stoklardan % ile arayıp ürün ekleyin; KDV dahil/hariç hesaplanır.',
        renk: 'yesil',
      },
      {
        ikon: 'onay',
        baslik: 'Taslak ve Onay',
        aciklama: 'Önce taslak kaydedin, sonra Onayla ile stok girişi ve cari borç hareketi oluşur.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'e-Fatura gönderimi sonraki aşamada eklenecek; şimdilik manuel kayıt.',
  },

  'satis-faturasi': {
    baslik: 'Satış Faturası Rehberi',
    altBaslik: 'Müşteri faturaları',
    bolumBaslik: 'Satış Faturası',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Liste ve Yeni',
        aciklama: 'Kayıtlı satış faturalarını görüntüleyin; Yeni Fatura ile taslak oluşturun.',
        renk: 'mavi',
      },
      {
        ikon: 'yildirim',
        baslik: 'Fatura İçeriği',
        aciklama:
          'Satır tablosu Sipariş İçeriği ile aynıdır. Stoklardan ürün ekleyin; fiyat ve KDV satırda hesaplanır.',
        renk: 'yesil',
      },
      {
        ikon: 'onay',
        baslik: 'Taslak ve Onay',
        aciklama: 'Onay sonrası stok çıkışı ve cari alacak hareketi oluşur. Onaylı belge silinemez.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'e-Fatura / e-Arşiv entegrasyonu sonra eklenecek.',
  },

  yapilacaklar: {
    baslik: 'Yapılacaklar Rehberi',
    altBaslik: 'Görev listesi',
    bolumBaslik: 'Yapılacaklar',
    kartlar: [
      {
        ikon: 'liste',
        baslik: 'Görevler',
        aciklama: 'Görevlerinizi filtreleyerek (aktif, önemli, tamamlanan) yönetin.',
        renk: 'mavi',
      },
      {
        ikon: 'yildirim',
        baslik: 'Hızlı Ekleme',
        aciklama: 'Yeni görev ekleyip öncelik ve tarih atayabilirsiniz.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Tamamlanan görevleri ayrı filtreden takip edebilirsiniz.',
  },
};

const VARSAYILAN_REHBER: ModulRehber = {
  baslik: 'Modül Rehberi',
  altBaslik: 'Bu modül hakkında genel bilgi',
  bolumBaslik: 'Yardım',
  kartlar: [
    {
      ikon: 'klavye',
      baslik: 'Kısayollar',
      aciklama: 'F1 ile bu rehberi açıp kapatabilirsiniz. ESC ile de kapanır.',
      renk: 'yesil',
    },
    {
      ikon: 'kaydet',
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

/**
 * Sekme açık kalınca tanımlar gibi sayfaların rehberModulId’si
 * başka odaklanmış modüle sızmasın.
 */
export function etkinRehberModulId(
  focusModulId: string,
  rehberModulId: string | null | undefined
): string {
  if (!focusModulId) return rehberModulId ?? '';
  if (!rehberModulId) return focusModulId;
  if (rehberModulId === focusModulId) return rehberModulId;
  if (rehberModulId.startsWith(`${focusModulId}-`)) return rehberModulId;
  return focusModulId;
}
