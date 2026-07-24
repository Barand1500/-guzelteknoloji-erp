import { useEffect, type RefObject } from 'react';
import { sekmePortaliGizliMi } from '@/araclar/sekmePortal';

/** Yazı alanında, modalda veya gizli admin sekmesinde yön/numara tuşlarını yoksay */
export function otKlavyeYoksayMi(e: KeyboardEvent, kok: HTMLElement | null): boolean {
  if (sekmePortaliGizliMi(kok)) return true;

  const hedef = e.target;
  if (hedef instanceof HTMLElement) {
    const tag = hedef.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (hedef.isContentEditable) return true;
  }

  const panel =
    kok?.closest('.ap-modul-panel, .ap-sekme-split-pane') ?? kok;
  if (panel?.querySelector('.ap-sistem-modal-arka, .ap-sil-onay-modal')) return true;

  return false;
}

/** Aktif listedeki + Ekle butonuna tıkla */
export function otEkleButonunuTikla(kok: HTMLElement | null): boolean {
  const btn = kok?.querySelector<HTMLButtonElement>('button.ot-btn-ekle');
  if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return false;
  btn.click();
  return true;
}

/** Aktif listedeki Ara inputuna odaklan */
export function otAramaOdakla(kok: HTMLElement | null): boolean {
  const input = kok?.querySelector<HTMLInputElement>(
    '.ap-arama input.ap-arama-input, .ap-arama input[type="search"]'
  );
  if (!input || input.disabled || input.readOnly) return false;
  input.focus();
  input.select();
  return true;
}

/** Ara inputundaysa odaktan çık (yanlışlıkla S ile girince Esc) */
export function otAramaOdaktanCik(kok: HTMLElement | null, hedef: EventTarget | null): boolean {
  if (!(hedef instanceof HTMLInputElement) || !kok?.contains(hedef)) return false;
  if (!hedef.closest('.ap-arama')) return false;
  hedef.blur();
  return true;
}

/**
 * İç sekme şeridi için ← → gezinmesi.
 * Yalnızca Özel Tanımlar aktifken ve yazı/modal yokken çalışır.
 */
export function useOtIcSekmeKlavye<T extends string>(opts: {
  kokRef: RefObject<HTMLElement | null>;
  sekmeler: readonly { id: T }[];
  aktif: T;
  onSec: (id: T) => void;
  /** false ise dinleyici kapalı (ör. alt görünümde) */
  etkin?: boolean;
}) {
  const { kokRef, sekmeler, aktif, onSec, etkin = true } = opts;

  useEffect(() => {
    if (!etkin || sekmeler.length < 2) return;

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (otKlavyeYoksayMi(e, kokRef.current)) return;

      const idx = sekmeler.findIndex((s) => s.id === aktif);
      if (idx < 0) return;

      e.preventDefault();
      const sonraki =
        e.key === 'ArrowRight'
          ? (idx + 1) % sekmeler.length
          : (idx - 1 + sekmeler.length) % sekmeler.length;
      onSec(sekmeler[sonraki]!.id);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aktif, etkin, kokRef, onSec, sekmeler]);
}
