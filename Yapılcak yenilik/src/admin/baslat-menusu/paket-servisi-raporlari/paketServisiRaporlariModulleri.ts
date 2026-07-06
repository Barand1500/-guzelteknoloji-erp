import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const PAKET_SERVISI_RAPORLARI_KATEGORI = 'Paket Servisi Raporları';

export interface PaketServisiRaporlariModulTanim {
  id: string;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI: PaketServisiRaporlariModulTanim[] = [
  {
    id: 'ps-gun-sonu',
    baslik: 'Gün Sonu',
    ikon: '🌙',
    aciklama: 'Paket servisi gün sonu kapanış ve kasa özeti',
  },
  {
    id: 'ps-eski-tahsilat-tarama',
    baslik: 'Eski Tahsilat Tarama',
    ikon: '🔍',
    aciklama: 'Geçmiş tahsilat kayıtlarını tarama ve kontrol',
  },
  {
    id: 'ps-satis-raporu',
    baslik: 'Satış Raporu',
    ikon: '🛒',
    aciklama: 'Paket servisi satış hareketleri',
  },
  {
    id: 'ps-satis-toplamlari',
    baslik: 'Satış Toplamları',
    ikon: '📊',
    aciklama: 'Paket servisi satış toplam özetleri',
  },
  {
    id: 'ps-paket-restoran-birlesik-gun-sonu',
    baslik: 'Paket-Restoran Birleşik Gün Sonu',
    ikon: '🍽️',
    aciklama: 'Paket ve restoran birleşik gün sonu özeti',
  },
];

export function paketServisiRaporlariAdminModulleri(): AdminModul[] {
  return PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI.map((r) => ({
    id: r.id,
    baslik: r.baslik,
    ikon: r.ikon,
    kategori: PAKET_SERVISI_RAPORLARI_KATEGORI,
    yol: `/gt-admin/${r.id}`,
  }));
}

export function paketServisiRaporlariModulBul(id: string): PaketServisiRaporlariModulTanim | undefined {
  return PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI.find((r) => r.id === id);
}

export function paketServisiRaporlariSeedKayitlari(): { modulAdi: string; prefix: string }[] {
  return PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI.map((r) => ({
    modulAdi: r.baslik,
    prefix: r.id.replace(/-/g, '_'),
  }));
}
