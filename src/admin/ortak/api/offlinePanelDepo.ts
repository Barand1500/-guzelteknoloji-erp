/**
 * Gerçek backend modunda yalnızca ESKİ offline panel anahtarlarını temizler.
 * erp-mock-belgeler-v2 / stok-hareket / cari-hareket / seri hâlâ belgeler
 * ekranı tarafından kullanıldığı için silinmez (aksi halde sunucuda kayıt kaybolur).
 */

const OFFLINE_ANAHTARLAR = [
  'erp-offline-kullanicilar',
  'erp-offline-tanimlar',
  'erp-offline-datagrid-demo',
  'erp-offline-belgeler-v1',
  'erp-offline-belge-hareketleri-v1',
  'erp-mock-stok-seed-v2',
  'erp-offline-sistem-ayarlari',
  'erp-offline-moduller',
  'erp-offline-loglar',
  'erp-offline-eklenti-kurulum',
] as const;

export function offlinePanelDeposuTemizle() {
  try {
    for (const anahtar of OFFLINE_ANAHTARLAR) {
      localStorage.removeItem(anahtar);
    }
    sessionStorage.removeItem('gt_auth_offline');
    sessionStorage.removeItem('gt_offline_oturum_kodu');
  } catch {
    /* storage yok */
  }
}
