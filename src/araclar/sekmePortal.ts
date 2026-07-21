import { useEffect } from 'react';

/** Sekme değişince portal/açılır menülerin tepki vermesi için */
export const AP_SEKME_DEGISTI = 'ap-sekme-degisti';

export function sekmeDegistiYayinla() {
  window.dispatchEvent(new CustomEvent(AP_SEKME_DEGISTI));
}

function panelKokBul(el: Element | null): HTMLElement | null {
  if (!el) return null;
  const pane = el.closest('.ap-sekme-split-pane');
  if (pane instanceof HTMLElement) return pane;
  if (el instanceof HTMLElement && el.classList.contains('ap-modul-panel')) return el;
  const panel = el.closest('.ap-modul-panel');
  return panel instanceof HTMLElement ? panel : null;
}

/**
 * Açılır liste / modal portal hedefi — sekme paneline bağlanır.
 * Gizli sekme display:none iken overlay başka sekmeye sızmaz;
 * keep-alive ile geri dönünce açık state korunur.
 */
export function sekmePortalHedefi(trigger?: HTMLElement | null, sekmeId?: string | null): HTMLElement {
  if (trigger) {
    const kok = panelKokBul(trigger);
    if (kok) return kok;
  }

  if (sekmeId) {
    const panel = document.querySelector(`[data-ap-sekme-id="${CSS.escape(sekmeId)}"]`);
    const kok = panelKokBul(panel);
    if (kok) return kok;
  }

  const aktif =
    document.querySelector('.ap-modul-panel[data-ap-kesif-aktif="true"]') ??
    document.querySelector('.ap-sekme-split-pane:not(.ap-sekme-canli-gizli) .ap-modul-panel');
  const aktifKok = panelKokBul(aktif);
  if (aktifKok) return aktifKok;

  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

/** Portal kökü şu an gizli sekmede mi? */
export function sekmePortaliGizliMi(kok: HTMLElement | null | undefined): boolean {
  if (!kok) return false;
  return !!kok.closest('.ap-sekme-canli-gizli') || kok.classList.contains('ap-sekme-canli-gizli');
}

/**
 * Sekme çubuğu / header tıklaması — açılır listeyi kapatma.
 * Böylece sekme değişince dropdown state korunur, geri dönünce açık kalır.
 */
export function sekmeGecisTiklamasiMi(hedef: EventTarget | null): boolean {
  if (!(hedef instanceof Element)) return false;
  return Boolean(
    hedef.closest(
      [
        '.ap-sekme-tab',
        '.ap-sekme-tab-sec',
        '.ap-sekme-kare-tab',
        '.ap-sekme-kare-tab-sec',
        '.ap-sekme-scroll-wrap',
        '.ap-sekme-grup',
        '.ap-header',
        '.ap-ust-bar',
        '.admin-header',
      ].join(',')
    )
  );
}

/** Sağ tık menüsü gibi öğeler için: sekme değişince kapat */
export function useSekmeDegisinceKapat(kapat: () => void) {
  useEffect(() => {
    window.addEventListener(AP_SEKME_DEGISTI, kapat);
    return () => window.removeEventListener(AP_SEKME_DEGISTI, kapat);
  }, [kapat]);
}

/** Dropdown açık kalsın; sekme geri gelince konumu yenile */
export function useSekmeDegisinceYenile(yenile: () => void) {
  useEffect(() => {
    window.addEventListener(AP_SEKME_DEGISTI, yenile);
    return () => window.removeEventListener(AP_SEKME_DEGISTI, yenile);
  }, [yenile]);
}

/**
 * Modal açıkken body scroll kilidi — yalnızca o sekme görünürken.
 */
export function useSekmeModalGovdeKilidi(acik: boolean, portalKok: HTMLElement | null) {
  useEffect(() => {
    if (!acik) return;

    function guncelle() {
      document.body.style.overflow = sekmePortaliGizliMi(portalKok) ? '' : 'hidden';
    }

    guncelle();
    window.addEventListener(AP_SEKME_DEGISTI, guncelle);
    return () => {
      window.removeEventListener(AP_SEKME_DEGISTI, guncelle);
      document.body.style.overflow = '';
    };
  }, [acik, portalKok]);
}
