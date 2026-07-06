import type { ModulRehber } from '@/admin/veri/adminModulRehberleri';
import type { MasterSekmeId } from '@/admin/baslat-menusu/master/tipler';

export const MASTER_SEKME_REHBERLERI: Record<MasterSekmeId, ModulRehber> = {
  moduller: {
    baslik: 'Modül Kataloğu — Nasıl Kullanılır?',
    altBaslik: 'Panele bağlı yazılım modülleri',
    bolumBaslik: 'Modüller sekmesi',
    kartlar: [
      {
        ikon: '🧩',
        baslik: 'Modül ekleme',
        aciklama:
          'Alt çubuktaki Yeni Ekle ile modül adı ve prefix tanımlayın. Prefix, Başlat menüsünde modülü tanımlar (ör. master, ayarlar).',
        renk: 'mor',
      },
      {
        ikon: '✅',
        baslik: 'Seçim ve silme',
        aciklama: 'Listeden bir modül kartına tıklayarak seçin. Seçili modülü alt çubuktan Sil ile kaldırabilirsiniz.',
        renk: 'turuncu',
      },
      {
        ikon: '🚫',
        baslik: 'Pasif modüller',
        aciklama: 'Pasif yapılan modüller Başlat menüsünde görünmez; kayıt silinmez, yalnızca gizlenir.',
        renk: 'mavi',
      },
    ],
    ipucu: 'Modal yalnızca ESC veya ✕ ile kapanır; dışarı tıklamayla kapanmaz.',
  },

  bayiler: {
    baslik: 'Bayiler — Nasıl Kullanılır?',
    altBaslik: 'Distribütör ve alt bayi ağı',
    bolumBaslik: 'Bayiler sekmesi',
    kartlar: [
      {
        ikon: '📋',
        baslik: 'Excel tablo',
        aciklama:
          'Bayiler tablo halinde listelenir. Satıra tıklayarak seçin; hücreyi çift tıklayarak unvan, iletişim ve iskonto gibi alanları hızlıca düzenleyin.',
        renk: 'mavi',
      },
      {
        ikon: '🏢',
        baslik: 'Üst bayi hiyerarşisi',
        aciklama: 'Yeni bayi eklerken üst bayi seçerek ağaç yapısı kurabilirsiniz. Bağımsız bayiler kök seviyededir.',
        renk: 'mor',
      },
      {
        ikon: '➕',
        baslik: 'Ekle ve sil',
        aciklama: 'Alt aksiyon çubuğundan Yeni Ekle ile tam form açılır; satır seçip Sil ile bayiyi kaldırabilirsiniz.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Üstteki Aktif / Pasif filtreleri ve arama kutusu listeyi daraltır.',
  },

  firmalar: {
    baslik: 'Firmalar — Nasıl Kullanılır?',
    altBaslik: 'Müşteri / tabela kayıtları',
    bolumBaslik: 'Firmalar sekmesi',
    kartlar: [
      {
        ikon: '⚙️',
        baslik: 'Sütun ayarları',
        aciklama:
          'Tablo üstündeki dişli ikonundan hangi sütunların görüneceğini ve sırasını özelleştirin. Tercihler tarayıcıda saklanır.',
        renk: 'turuncu',
      },
      {
        ikon: '✏️',
        baslik: 'Hızlı düzenleme',
        aciklama:
          'Hücreye çift tıklayın, değeri değiştirin; başka yere tıklayınca kaydedilir. Düzenle sütunundan tam form modalını açabilirsiniz.',
        renk: 'mavi',
      },
      {
        ikon: '🏷️',
        baslik: 'Vergi ve iskonto',
        aciklama: 'Vergi dairesi, vergi no ve iskonto % alanları firmaya özel tanımlanır. Her firma bir bayiye bağlıdır.',
        renk: 'mor',
      },
    ],
    ipucu: 'Bayi filtresi ve arama ile büyük listelerde hızlıca kayıt bulun.',
  },

  subeler: {
    baslik: 'Şubeler — Nasıl Kullanılır?',
    altBaslik: 'Restoran ve lokasyon kayıtları',
    bolumBaslik: 'Şubeler sekmesi',
    kartlar: [
      {
        ikon: '📍',
        baslik: 'Firma bağlantısı',
        aciklama: 'Her şube bir firmaya bağlıdır. Önce firma, ardından şube adı ve tipi (restoran, kafe vb.) girilir.',
        renk: 'mavi',
      },
      {
        ikon: '📋',
        baslik: 'Tablo işlemleri',
        aciklama: 'Satır seçimi, çift tıkla hücre düzenleme ve alt çubuktan Yeni Ekle / Sil işlemleri Firmalar ile aynı mantıktadır.',
        renk: 'mor',
      },
      {
        ikon: '🗺️',
        baslik: 'İl / ilçe',
        aciklama: 'İl ve ilçe alanları arama destekli seçicilerle doldurulur; adres ve iletişim bilgileri isteğe bağlıdır.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Firma filtresi ile yalnızca seçili firmaya ait şubeleri görebilirsiniz.',
  },

  kullanicilar: {
    baslik: 'Kullanıcılar — Nasıl Kullanılır?',
    altBaslik: 'Restoran ve organizasyon kullanıcıları',
    bolumBaslik: 'Kullanıcılar sekmesi',
    kartlar: [
      {
        ikon: '🔗',
        baslik: 'Bayi → Firma → Şube',
        aciklama:
          'Yeni kullanıcı eklerken kademeli seçim yapın. Şube seçilirse kullanıcı şube tipinde, yalnızca firma seçilirse firma tipinde atanır.',
        renk: 'mor',
      },
      {
        ikon: '👤',
        baslik: 'Rol ve iskonto',
        aciklama: 'Rol panel yetkilerini belirler. İskonto % alanı kullanıcıya özel indirim tanımlamak içindir.',
        renk: 'mavi',
      },
      {
        ikon: '🕐',
        baslik: 'Son giriş',
        aciklama: 'Tabloda son giriş tarihi görünür. Hücre düzenleme, sütun ayarı ve alt çubuk Ekle/Sil Firmalar ile aynıdır.',
        renk: 'turuncu',
      },
    ],
    ipucu: 'Şifre düzenleme tam form modalında yapılır; tabloda yalnızca temel alanlar hızlı düzenlenir.',
  },

  paketler: {
    baslik: 'Paketler — Nasıl Kullanılır?',
    altBaslik: 'Satılabilir lisans paketleri',
    bolumBaslik: 'Paketler sekmesi',
    kartlar: [
      {
        ikon: '📦',
        baslik: 'Paket tanımı',
        aciklama:
          'Paket adı, şube / personel / masa kotası ve fiyat girilir. Pasif paketler yeni lisans atamalarında seçilemez.',
        renk: 'mor',
      },
      {
        ikon: '📋',
        baslik: 'Tablo kullanımı',
        aciklama: 'Paketler excel tabloda listelenir. Çift tıkla hızlı düzenleme, satır seçip Sil veya Yeni Ekle alt çubuktan yapılır.',
        renk: 'mavi',
      },
      {
        ikon: '🎫',
        baslik: 'Lisans ilişkisi',
        aciklama: 'Tanımlanan paketler Lisanslar sekmesinde firmalara atanır. Kota bilgisi lisans kontrolünde kullanılır.',
        renk: 'yesil',
      },
    ],
    ipucu: 'Kota alanları sayısal girilir; fiyat ve para birimi paket kaydında saklanır.',
  },

  lisanslar: {
    baslik: 'Lisanslar — Nasıl Kullanılır?',
    altBaslik: 'Firmaya paket atama ve süre takibi',
    bolumBaslik: 'Lisanslar sekmesi',
    kartlar: [
      {
        ikon: '🎫',
        baslik: 'Lisans atama',
        aciklama:
          'Alt çubuktan Yeni Ekle ile firma ve paket seçin. Başlangıç zorunlu; bitiş boş bırakılırsa süresiz lisans olur.',
        renk: 'mor',
      },
      {
        ikon: '⏳',
        baslik: 'Durum takibi',
        aciklama:
          'Aktif, Süresi yakın ve Pasif filtreleri otomatik hesaplanır. Yakında bitecek lisanslar tabloda turuncu vurgulanır.',
        renk: 'turuncu',
      },
      {
        ikon: '🌳',
        baslik: 'Ağaç görünümü',
        aciklama:
          'Sağ üstteki tablo / ağaç ikonlarıyla paket → durum → firma hiyerarşisine geçin. Süresi yakın lisansları paket bazında gruplu takip edin.',
        renk: 'yesil',
      },
      {
        ikon: '✏️',
        baslik: 'Hızlı güncelleme',
        aciklama:
          'Paket, tarih ve aktif/pasif alanları çift tıkla düzenlenir. Firma değiştirilemez; firma değişikliği için yeni lisans oluşturun.',
        renk: 'mavi',
      },
    ],
    ipucu: '⚙️ ile sütun görünürlüğünü ayarlayın; kayıt ve güncelleme tarihlerini isteğe bağlı gösterin.',
  },
};

export function masterSekmeRehberBul(sekmeId: string): ModulRehber | undefined {
  return MASTER_SEKME_REHBERLERI[sekmeId as MasterSekmeId];
}

export function masterRehberModulId(sekmeId: MasterSekmeId): string {
  return `master-${sekmeId}`;
}
