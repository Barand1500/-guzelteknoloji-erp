export type MasterSekmeId =
  | 'moduller'
  | 'bayiler'
  | 'firmalar'
  | 'subeler'
  | 'kullanicilar'
  | 'paketler'
  | 'lisanslar';

export interface MasterSekmeTanim {
  id: MasterSekmeId;
  ad: string;
  ikon: string;
  baslik: string;
  altBaslik: string;
  /** Sol panelde gösterilen kısa bağlam */
  baglam: string;
}

export const MASTER_SEKMELER: MasterSekmeTanim[] = [
  {
    id: 'bayiler',
    ad: 'Bayiler',
    ikon: '🤝',
    baslik: 'Bayi Ağı',
    altBaslik: 'Distribütör ve alt bayi hiyerarşisi',
    baglam: 'Bayi → Firma → Şube zincirinin kökü',
  },
  {
    id: 'firmalar',
    ad: 'Firmalar',
    ikon: '🏢',
    baslik: 'Müşteri Firmalar',
    altBaslik: 'Bayiye bağlı müşteri / tabela kayıtları',
    baglam: 'Her firmanın bir veya daha fazla şubesi olabilir',
  },
  {
    id: 'subeler',
    ad: 'Şubeler',
    ikon: '📍',
    baslik: 'Şube Lokasyonları',
    altBaslik: 'Restoran, kafe ve diğer işletme noktaları',
    baglam: 'Şube tipi ve lisans bilgisi burada yönetilir',
  },
  {
    id: 'kullanicilar',
    ad: 'Kullanıcılar',
    ikon: '👥',
    baslik: 'Organizasyon Kullanıcıları',
    altBaslik: 'Merkez, bayi, firma ve şube kullanıcıları — özet görünüm',
    baglam: 'Tam düzenleme: Kullanıcılar modülü',
  },
  {
    id: 'paketler',
    ad: 'Paketler',
    ikon: '📦',
    baslik: 'Lisans Paketleri',
    altBaslik: 'Satılabilir paket tanımları ve kota bilgileri',
    baglam: 'Şube, personel ve masa kotası pakete göre belirlenir',
  },
  {
    id: 'lisanslar',
    ad: 'Lisanslar',
    ikon: '🎫',
    baslik: 'Firma Lisansları',
    altBaslik: 'Firmaya atanan paket ve geçerlilik süresi',
    baglam: 'Paket + firma eşleşmesi',
  },
  {
    id: 'moduller',
    ad: 'Modüller',
    ikon: '🧩',
    baslik: 'Modül Kataloğu',
    altBaslik: 'Panele bağlı yazılım modülleri ve prefix tanımları',
    baglam: 'Her modülün kendi rol seti vardır',
  },
];

export function masterSekmeBul(id: MasterSekmeId): MasterSekmeTanim {
  return MASTER_SEKMELER.find((s) => s.id === id) ?? MASTER_SEKMELER[0];
}
