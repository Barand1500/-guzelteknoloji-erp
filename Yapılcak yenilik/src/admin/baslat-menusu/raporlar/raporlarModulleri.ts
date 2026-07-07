import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const RAPORLAR_KATEGORI = 'Raporlar';

export interface RaporlarModulTanim {
  id: string;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const RAPORLAR_MODUL_TANIMLARI: RaporlarModulTanim[] = [
  {
    id: 'gun-sonu',
    baslik: 'Gün Sonu',
    ikon: '🌙',
    aciklama: 'Gün sonu kapanış ve kasa özeti',
  },
  {
    id: 'gunluk-toplamlar',
    baslik: 'Günlük Toplamlar',
    ikon: '📅',
    aciklama: 'Günlük satış ve tahsilat toplamları',
  },
  {
    id: 'ozet-ciro',
    baslik: 'Özet Ciro',
    ikon: '💰',
    aciklama: 'Dönemsel ciro özeti',
  },
  {
    id: 'masalara-gore-ciro',
    baslik: 'Masalara Göre Ciro',
    ikon: '🪑',
    aciklama: 'Masa bazında ciro dağılımı',
  },
  {
    id: 'personel-tahsilat-raporu',
    baslik: 'Personel Tahsilat Raporu',
    ikon: '👤',
    aciklama: 'Personel bazında tahsilat özeti',
  },
  {
    id: 'faaliyet-raporu',
    baslik: 'Faaliyet Raporu',
    ikon: '📈',
    aciklama: 'Operasyonel faaliyet özeti',
  },
  {
    id: 'aktif-masalar',
    baslik: 'Aktif Masalar',
    ikon: '🟢',
    aciklama: 'Açık ve dolu masa listesi',
  },
  {
    id: 'fiyat-listesi',
    baslik: 'Fiyat Listesi',
    ikon: '🏷️',
    aciklama: 'Ürün fiyat listesi raporu',
  },
  {
    id: 'gider-gelir-kayitlari-raporu',
    baslik: 'Gider-Gelir Kayıtları Raporu',
    ikon: '📒',
    aciklama: 'Gider ve gelir hareketleri',
  },
  {
    id: 'acik-hesap-listesi',
    baslik: 'Açık Hesap Listesi',
    ikon: '📋',
    aciklama: 'Ödenmemiş açık hesaplar',
  },
  {
    id: 'silinen-siparisler',
    baslik: 'Silinen Siparişler',
    ikon: '🗑️',
    aciklama: 'İptal ve silinen sipariş kayıtları',
  },
  {
    id: 'satis-raporu',
    baslik: 'Satış Raporu',
    ikon: '🛒',
    aciklama: 'Detaylı satış hareketleri',
  },
  {
    id: 'satis-toplamlari',
    baslik: 'Satış Toplamları',
    ikon: '📊',
    aciklama: 'Satış toplam özetleri',
  },
  {
    id: 'ozel-raporlar',
    baslik: 'Özel Raporlar',
    ikon: '✨',
    aciklama: 'Özelleştirilmiş rapor şablonları',
  },
];

export function raporlarAdminModulleri(): AdminModul[] {
  return RAPORLAR_MODUL_TANIMLARI.map((r) => ({
    id: r.id,
    baslik: r.baslik,
    ikon: r.ikon,
    kategori: RAPORLAR_KATEGORI,
    yol: `/gt-admin/${r.id}`,
  }));
}

export function raporlarModulBul(id: string): RaporlarModulTanim | undefined {
  return RAPORLAR_MODUL_TANIMLARI.find((r) => r.id === id);
}

export function raporlarSeedKayitlari(): { modulAdi: string; prefix: string }[] {
  return RAPORLAR_MODUL_TANIMLARI.map((r) => ({
    modulAdi: r.baslik,
    prefix: r.id.replace(/-/g, '_'),
  }));
}
