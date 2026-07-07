import { sekmeOnizlemeAl, sekmeOnizlemeKaydet } from './sekmeOnizlemeOnbellek';

const yakalaKuyruk = new Map<string, Promise<string | null>>();

function panelBul(sekmeId: string): HTMLElement | null {
  return document.querySelector(`[data-ap-sekme-id="${sekmeId}"]`);
}

function arkaPlanRengi(panel: HTMLElement): string {
  const stil = getComputedStyle(panel);
  const bg = stil.backgroundColor;
  if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
    return getComputedStyle(document.documentElement).getPropertyValue('--ap-bg').trim() || '#f1f5f9';
  }
  return bg;
}

async function panelGorselYakala(panel: HTMLElement): Promise<string | null> {
  const { default: html2canvas } = await import('html2canvas');
  const genislik = panel.clientWidth || 800;
  const yukseklik = Math.min(panel.scrollHeight || panel.clientHeight, 820);
  const olcek = Math.min(0.42, 300 / Math.max(genislik, 1));

  const canvas = await html2canvas(panel, {
    scale: olcek,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: arkaPlanRengi(panel),
    width: genislik,
    height: yukseklik,
    windowWidth: genislik,
    windowHeight: yukseklik,
    scrollX: 0,
    scrollY: 0,
    ignoreElements: (node) => {
      if (!(node instanceof HTMLElement)) return false;
      return (
        node.classList.contains('ap-sekme-hover-onizleme') ||
        node.classList.contains('ap-ayri-pencere') ||
        node.classList.contains('ap-header') ||
        node.classList.contains('ap-alt-aksiyon-cubugu') ||
        node.classList.contains('ap-sekme-scroll-wrap')
      );
    },
  });

  return canvas.toDataURL('image/jpeg', 0.86);
}

export async function sekmeOnizlemeGuncelle(sekmeId: string): Promise<string | null> {
  const mevcut = yakalaKuyruk.get(sekmeId);
  if (mevcut) return mevcut;

  const is = (async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const panel = panelBul(sekmeId);
    if (!panel) return sekmeOnizlemeAl(sekmeId);

    try {
      const dataUrl = await panelGorselYakala(panel);
      if (dataUrl) sekmeOnizlemeKaydet(sekmeId, dataUrl);
      return dataUrl ?? sekmeOnizlemeAl(sekmeId);
    } catch {
      return sekmeOnizlemeAl(sekmeId);
    } finally {
      yakalaKuyruk.delete(sekmeId);
    }
  })();

  yakalaKuyruk.set(sekmeId, is);
  return is;
}
