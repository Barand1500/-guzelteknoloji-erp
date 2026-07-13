import { prisma } from './prisma.js';

/** Panel modulleri — veritabanindan okunur */
export async function modulListesi() {
  const kayitlar = await prisma.modul.findMany({
    where: { durum: true },
    orderBy: { id: 'asc' },
  });

  if (kayitlar.length > 0) {
    return kayitlar.map((m) => ({
      id: m.id,
      modulAdi: m.modulAdi,
      prefix: m.prefix,
      durum: m.durum,
    }));
  }

  return sanalModulListesi();
}

export const PANEL_MODULLERI = [
  { modulAdi: 'Kullanicilar', prefix: 'kullanicilar' },
  { modulAdi: 'Roller', prefix: 'roller' },
  { modulAdi: 'Ayarlar', prefix: 'ayarlar' },
  { modulAdi: 'Sekme Yonetimi', prefix: 'sekme_yonetimi' },
  { modulAdi: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari' },
  { modulAdi: 'Siparis Tablosu', prefix: 'datagrid_demo' },
  { modulAdi: 'Loglar', prefix: 'loglar' },
  { modulAdi: 'Veri Yedekleme', prefix: 'veri_yedekleme' },
  { modulAdi: 'Tanimlar', prefix: 'tanimlar' },
  { modulAdi: 'Cari Kartlar', prefix: 'cari' },
  { modulAdi: 'Urunler', prefix: 'urunler' },
  { modulAdi: 'Birimler', prefix: 'birimler' },
  { modulAdi: 'Maliyetler', prefix: 'maliyetler' },
  { modulAdi: 'Stoklar', prefix: 'stoklar' },
] as const;

export function sanalModulListesi() {
  return PANEL_MODULLERI.map((m, i) => ({
    id: i + 1,
    modulAdi: m.modulAdi,
    prefix: m.prefix,
    durum: true,
  }));
}
