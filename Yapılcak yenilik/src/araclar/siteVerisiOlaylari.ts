/** Admin kaydı sonrası public site verisini yenilemek için olay */
export const SITE_VERISI_GUNCELLENDI = 'gt:site-verisi-guncellendi';

export function siteVerisiGuncellendiYayinla() {
  window.dispatchEvent(new CustomEvent(SITE_VERISI_GUNCELLENDI));
  try {
    localStorage.setItem(SITE_VERISI_GUNCELLENDI, String(Date.now()));
  } catch {
    /* gizli mod vb. */
  }
}

export function siteVerisiGuncellemeDinle(callback: () => void) {
  const olayHandler = () => callback();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === SITE_VERISI_GUNCELLENDI) callback();
  };
  window.addEventListener(SITE_VERISI_GUNCELLENDI, olayHandler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(SITE_VERISI_GUNCELLENDI, olayHandler);
    window.removeEventListener('storage', storageHandler);
  };
}
