/** Gercek backend modunda eski offline mock verisini temizler */

const OFFLINE_ANAHTARLAR = [
  'erp-offline-kullanicilar',
  'erp-offline-tanimlar',
  'erp-offline-datagrid-demo',
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
