import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { tanimlarAdminModulleri } from '@/admin/baslat-menusu/tanimlar/tanimlarModulleri';
import { raporlarAdminModulleri } from '@/admin/baslat-menusu/raporlar/raporlarModulleri';
import { paketServisiRaporlariAdminModulleri } from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiRaporlariModulleri';
import { rezervasyonRaporlariAdminModulleri } from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonRaporlariModulleri';
import { uygulamaAyarlarAdminModulleri } from '@/admin/baslat-menusu/uygulama-ayarlari/uygulamaAyarlarModulleri';

/** Master modülü menüde geçici gizli — tekrar açmak için true yapın */
export const MASTER_MENU_GORUNUR = true;

export const adminModulleri: AdminModul[] = [
  ...tanimlarAdminModulleri(),
  ...raporlarAdminModulleri(),
  ...paketServisiRaporlariAdminModulleri(),
  ...rezervasyonRaporlariAdminModulleri(),
  ...uygulamaAyarlarAdminModulleri(),
  {
    id: 'master',
    baslik: 'Master',
    ikon: '🗄️',
    kategori: 'Master',
    yol: '/gt-admin/master',
  },
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

export const adminKategoriler = [
  'Tanımlar',
  'Raporlar',
  'Paket Servisi Raporları',
  'Rezervasyon Raporları',
  'Ayarlar',
  ...(MASTER_MENU_GORUNUR ? (['Master'] as const) : []),
  'Müşteri / Ajans',
  'Sistem',
] as const;

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

/** Panel altyapısı — Master modül kataloğundan bağımsız menüde her zaman görünür */
const PANEL_ALTYAPI_MODUL_IDLERI = new Set(['ayarlar', 'sekme-yonetimi', 'kisayol-ayarlari']);

export function modulMenuGorunurMu(modulId: string, aktifPrefixler: Set<string> | null | undefined): boolean {
  const modul = modulBul(modulId);
  if (modul?.kategori === 'Tanımlar') return true;
  if (modul?.kategori === 'Raporlar') return true;
  if (modul?.kategori === 'Paket Servisi Raporları') return true;
  if (modul?.kategori === 'Rezervasyon Raporları') return true;
  if (modul?.kategori === 'Ayarlar') return true;
  if (modulId === 'master') return MASTER_MENU_GORUNUR;
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
