import type { SistemKesifTur } from '@/admin/ortak/tipler/sistemKesif';

const MODUL_HEDEF = {
  hedef: 'modul-icerik' as const,
  hedefYedek: ['modul-kabuk', 'modul-yukleniyor'] as string[],
};

const panelAdimlari = [
  {
    id: 'hosgeldin',
    baslik: 'Hos Geldiniz — ERP',
    aciklama:
      'Bu bos panel sablonu, yeni projeleriniz icin baslangic noktanizdir. Kullanicilar, roller, sistem ayarlari ve yedekleme gibi temel moduller hazirdir.',
    ipuclari: [
      'Ileri butonu ile bir sonraki adima gecin',
      'Istediginiz zaman "Turu Kapat" diyebilirsiniz',
      'ESC tusu da turu sonlandirir',
    ],
  },
  {
    id: 'baslat',
    hedef: 'baslat-menu',
    okYonu: 'sag' as const,
    baslik: 'Baslat Menusu',
    aciklama:
      'Sol ustteki dort kareli simgeye tiklayinca Musteri / Ajans ve Sistem kategorileri altindaki moduller acilir.',
    ipuclari: ['Menu icinde arama kutusu ile modul adi yazarak hizli bulun'],
  },
  {
    id: 'sekmeler',
    hedef: 'sekme-cubugu',
    okYonu: 'alt' as const,
    baslik: 'Sekmeler',
    aciklama:
      'Birden fazla modul actiginizda ustte sekme olarak gorunur. Sekmeleri surukleyerek siralayabilir veya gruplayabilirsiniz.',
  },
  {
    id: 'icerik',
    hedef: 'modul-icerik',
    okYonu: 'ust' as const,
    baslik: 'Calisma Alani',
    aciklama: 'Sectiginiz modulun formlari ve listeleri bu alanda gorunur.',
    ipuclari: ['Degisiklik yaptiktan sonra Kaydet butonuna basin'],
  },
  {
    id: 'aksiyon',
    hedef: 'aksiyon-cubugu',
    okYonu: 'ust' as const,
    baslik: 'Alt Cubuk — Kaydet, Ekle, Sil',
    aciklama:
      'Ekranin en altindaki cubukta modul islemleri, kullanici rehberi, loglar, yedekleme ve bildirimler bulunur.',
    ipuclari: ['F1 ile modul rehberini acabilirsiniz'],
  },
];

export const SISTEM_KESIF_TURLARI: SistemKesifTur[] = [
  {
    id: 'tam-tur',
    baslik: 'Tam Panel Turu',
    aciklama: 'ERP arayuzu — hizli baslangic.',
    ikon: '🚀',
    adimlar: [
      ...panelAdimlari,
      {
        id: 'bildirim',
        hedef: 'bildirim-tray',
        okYonu: 'ust' as const,
        baslik: 'Bildirimler ve Araclar',
        aciklama: 'Sag alttaki simgeler: zil (bildirimler), belge (log), indirme (yedekleme).',
      },
      {
        id: 'bitis',
        baslik: 'Tur Bitti',
        aciklama: 'Panel yapisini ogrendiniz. Yeni moduller eklemek icin bu sablonu kopyalayip genisletebilirsiniz.',
      },
    ],
  },
  {
    id: 'panel-arayuzu',
    baslik: 'Panel Arayuzu',
    aciklama: 'Menu, sekmeler, calisma alani ve kaydetme cubugu.',
    ikon: '🖥️',
    adimlar: panelAdimlari,
  },
  {
    id: 'kullanici-sistem',
    baslik: 'Kullanici ve Sistem',
    aciklama: 'Yetkiler, panel davranisi ve yedekleme.',
    ikon: '⚙️',
    adimlar: [
      {
        id: 'kullanicilar',
        ...MODUL_HEDEF,
        modulId: 'kullanicilar',
        okYonu: 'alt' as const,
        baslik: 'Kullanici Yonetimi',
        aciklama: 'Panele giris yapabilecek kisileri ekleyin ve rollere atayin.',
      },
      {
        id: 'roller',
        ...MODUL_HEDEF,
        modulId: 'roller',
        okYonu: 'alt' as const,
        baslik: 'Roller ve Yetkiler',
        aciklama: 'Her rol icin modul bazli izinleri isaretleyin.',
      },
      {
        id: 'sekme-yonetimi',
        ...MODUL_HEDEF,
        modulId: 'sekme-yonetimi',
        okYonu: 'alt' as const,
        baslik: 'Sekme Yonetimi',
        aciklama: 'Ust sekme cubugunun boyutunu ve davranisini kisisellestirin.',
      },
      {
        id: 'sistem-tray',
        hedef: 'gorev-tray',
        hedefYedek: ['aksiyon-cubugu'],
        okYonu: 'ust' as const,
        baslik: 'Log ve Yedekleme',
        aciklama: 'Alt cubuktaki belge simgesi loglari, indirme simgesi yedeklemeyi acar.',
      },
    ],
  },
];

export function sistemKesifTurBul(id: string): SistemKesifTur | undefined {
  return SISTEM_KESIF_TURLARI.find((t) => t.id === id);
}
