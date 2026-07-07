import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const REZERVASYON_RAPORLARI_KATEGORI = 'Rezervasyon Raporları';

export interface RezervasyonRaporlariModulTanim {
  id: string;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const REZERVASYON_RAPORLARI_MODUL_TANIMLARI: RezervasyonRaporlariModulTanim[] = [
  {
    id: 'rezervasyon-listesi',
    baslik: 'Rezervasyon Listesi',
    ikon: '📅',
    aciklama: 'Rezervasyon kayıtlarını tarih aralığına göre listeleyin ve yazdırın',
  },
];

export function rezervasyonRaporlariAdminModulleri(): AdminModul[] {
  return REZERVASYON_RAPORLARI_MODUL_TANIMLARI.map((r) => ({
    id: r.id,
    baslik: r.baslik,
    ikon: r.ikon,
    kategori: REZERVASYON_RAPORLARI_KATEGORI,
    yol: `/gt-admin/${r.id}`,
  }));
}

export function rezervasyonRaporlariModulBul(id: string): RezervasyonRaporlariModulTanim | undefined {
  return REZERVASYON_RAPORLARI_MODUL_TANIMLARI.find((r) => r.id === id);
}

export function rezervasyonRaporlariSeedKayitlari(): { modulAdi: string; prefix: string }[] {
  return REZERVASYON_RAPORLARI_MODUL_TANIMLARI.map((r) => ({
    modulAdi: r.baslik,
    prefix: r.id.replace(/-/g, '_'),
  }));
}
