import type { AdminModul } from '@/admin/ortak/tipler/admin';

export const adminModulleri: AdminModul[] = [
  {
    id: 'kullanicilar',
    baslik: 'Kullanıcılar',
    ikon: '👥',
    kategori: 'Müşteri / Ajans',
    yol: '/gt-admin/kullanicilar',
  },
  {
    id: 'roller',
    baslik: 'Roller ve Yetkiler',
    ikon: '🔐',
    kategori: 'Müşteri / Ajans',
    yol: '/gt-admin/roller',
  },
  {
    id: 'ayarlar',
    baslik: 'Ayarlar',
    ikon: '🔧',
    kategori: 'Sistem',
    yol: '/gt-admin/ayarlar',
  },
  {
    id: 'sekme-yonetimi',
    baslik: 'Sekme Yönetimi',
    ikon: '🗂️',
    kategori: 'Sistem',
    yol: '/gt-admin/sekme-yonetimi',
  },
  {
    id: 'kisayol-ayarlari',
    baslik: 'Kısayol Ayarları',
    ikon: '⌨️',
    kategori: 'Sistem',
    yol: '/gt-admin/kisayol-ayarlari',
  },
  {
    id: 'datagrid-demo',
    baslik: 'Sipariş Tablosu',
    ikon: '📊',
    kategori: 'Datagrid',
    yol: '/gt-admin/datagrid-demo',
  },
  {
    id: 'tanimlar',
    baslik: 'Tanımlar',
    ikon: '🗃️',
    kategori: 'Tanımlar',
    yol: '/gt-admin/tanimlar',
  },
];

/** Footer vb. üzerinden açılan, başlat menüsünde görünmeyen modüller */
export const adminGizliModuller: AdminModul[] = [
  {
    id: 'loglar',
    baslik: 'Log Takibi',
    ikon: '📜',
    kategori: 'Sistem',
    yol: '/gt-admin/loglar',
    menuGizle: true,
  },
  {
    id: 'veri-yedekleme',
    baslik: 'Veri Yedekleme',
    ikon: '💾',
    kategori: 'Sistem',
    yol: '/gt-admin/veri-yedekleme',
    menuGizle: true,
  },
];

export const adminKategoriler = ['Müşteri / Ajans', 'Sistem', 'Tanımlar', 'Datagrid'] as const;

export function modulBul(id: string): AdminModul | undefined {
  return adminModulleri.find((m) => m.id === id) ?? adminGizliModuller.find((m) => m.id === id);
}

/** /gt-admin/... yolundan modül bulur (iç linkler için) */
export function modulYolundanBul(pathname: string): AdminModul | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/gt-admin';
  const tumModuller = [...adminModulleri, ...adminGizliModuller];
  return tumModuller
    .slice()
    .sort((a, b) => b.yol.length - a.yol.length)
    .find((m) => {
      const yol = m.yol.replace(/\/+$/, '') || '/gt-admin';
      return normalized === yol;
    });
}

/** Panel modül id → veritabanı prefix (ör. sekme-yonetimi → sekme_yonetimi) */
export function modulIdDenPrefix(modulId: string): string {
  return modulId.replace(/-/g, '_');
}

const PANEL_ALTYAPI_MODUL_IDLERI = new Set(['ayarlar', 'sekme-yonetimi', 'kisayol-ayarlari', 'datagrid-demo']);

export function modulMenuGorunurMu(modulId: string, aktifPrefixler: Set<string> | null | undefined): boolean {
  if (PANEL_ALTYAPI_MODUL_IDLERI.has(modulId)) return true;
  if (!aktifPrefixler) return true;
  return aktifPrefixler.has(modulIdDenPrefix(modulId));
}

export function modulleriMenuyeGoreFiltrele(
  moduller: AdminModul[],
  aktifPrefixler: Set<string> | null | undefined
): AdminModul[] {
  return moduller.filter((m) => modulMenuGorunurMu(m.id, aktifPrefixler));
}

export function modulAra(terim: string, aktifPrefixler?: Set<string> | null): AdminModul[] {
  const q = terim.toLowerCase().trim();
  const kaynak = modulleriMenuyeGoreFiltrele(adminModulleri, aktifPrefixler);
  if (!q) return kaynak;
  return kaynak.filter(
    (m) =>
      m.baslik.toLowerCase().includes(q) ||
      m.kategori.toLowerCase().includes(q) ||
      m.id.includes(q)
  );
}
