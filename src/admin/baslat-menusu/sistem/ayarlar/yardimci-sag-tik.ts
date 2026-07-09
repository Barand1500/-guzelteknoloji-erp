import {
  VARSAYILAN_SAG_TIK_PANEL,
  type SagTikOgeAyari,
  type SagTikOgeId,
  type SagTikPanelAyarlari,
} from '@/admin/ortak/tipler/sagTikPaneli';
import { SAG_TIK_OGE_TANIMLARI } from '@/admin/baslat-menusu/sistem/ayarlar/veri-sag-tik';

const GECERLI_IDLER = new Set(SAG_TIK_OGE_TANIMLARI.map((o) => o.id));
const KALDIRILAN_OGELER = new Set([
  'sayfalar',
  'yeniSayfa',
  'dashboard',
  'siteAc',
  'sistemKesif',
  'onizle',
]);

export function sagTikPanelNormalize(kaynak?: Partial<SagTikPanelAyarlari> | null): SagTikPanelAyarlari {
  if (!kaynak) return { ...VARSAYILAN_SAG_TIK_PANEL, ogeler: [...VARSAYILAN_SAG_TIK_PANEL.ogeler] };

  const varsayilanSira = VARSAYILAN_SAG_TIK_PANEL.ogeler;
  const gelenMap = new Map<SagTikOgeId, boolean>();

  if (Array.isArray(kaynak.ogeler)) {
    for (const o of kaynak.ogeler) {
      if (!o?.id) continue;
      const id = ((o.id as string) === 'onizle' ? 'guncelle' : o.id) as SagTikOgeId;
      if (KALDIRILAN_OGELER.has(id)) continue;
      if (GECERLI_IDLER.has(id)) gelenMap.set(id, Boolean(o.aktif));
    }
  }

  const ogeler: SagTikOgeAyari[] = varsayilanSira.map((v) => ({
    id: v.id,
    aktif: gelenMap.has(v.id) ? gelenMap.get(v.id)! : v.aktif,
  }));

  for (const [id, aktif] of gelenMap) {
    if (!ogeler.some((o) => o.id === id)) ogeler.push({ id, aktif });
  }

  return {
    aktif: typeof kaynak.aktif === 'boolean' ? kaynak.aktif : VARSAYILAN_SAG_TIK_PANEL.aktif,
    ogeler: ogeler.filter((o) => !KALDIRILAN_OGELER.has(o.id)),
    modulIdler:
      Array.isArray(kaynak.modulIdler) && kaynak.modulIdler.every((x) => typeof x === 'string')
        ? kaynak.modulIdler
        : VARSAYILAN_SAG_TIK_PANEL.modulIdler,
  };
}

export function metinAlaniMi(el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLInputElement) {
    const tip = el.type;
    return tip === 'text' || tip === 'search' || tip === 'url' || tip === 'email' || tip === 'password' || tip === 'tel' || tip === 'number' || tip === '';
  }
  return el instanceof HTMLTextAreaElement || el.isContentEditable;
}

export function secimVarMi(hedef: EventTarget | null) {
  if (!metinAlaniMi(hedef)) return false;
  if (hedef instanceof HTMLInputElement || hedef instanceof HTMLTextAreaElement) {
    return (hedef.selectionEnd ?? 0) > (hedef.selectionStart ?? 0);
  }
  return false;
}

export async function panoKopyala(hedef: EventTarget | null) {
  if (metinAlaniMi(hedef)) {
    hedef.focus();
    document.execCommand('copy');
    return;
  }
  const secim = window.getSelection()?.toString();
  if (secim) await navigator.clipboard.writeText(secim).catch(() => undefined);
}

export function panoKes(hedef: EventTarget | null) {
  if (!metinAlaniMi(hedef)) return;
  hedef.focus();
  document.execCommand('cut');
  hedef.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function panoYapistir(hedef: EventTarget | null) {
  if (!metinAlaniMi(hedef)) return;
  let metin = '';
  try {
    metin = await navigator.clipboard.readText();
  } catch {
    return;
  }
  const alan = hedef as HTMLInputElement | HTMLTextAreaElement;
  const bas = alan.selectionStart ?? alan.value.length;
  const son = alan.selectionEnd ?? bas;
  alan.value = alan.value.slice(0, bas) + metin + alan.value.slice(son);
  alan.selectionStart = alan.selectionEnd = bas + metin.length;
  alan.dispatchEvent(new Event('input', { bubbles: true }));
  alan.focus();
}

export function tumunuSec(hedef: EventTarget | null) {
  if (!metinAlaniMi(hedef)) return;
  hedef.focus();
  if (hedef instanceof HTMLInputElement || hedef instanceof HTMLTextAreaElement) {
    hedef.select();
  }
}

export function sagTikAyarlariYayinla() {
  window.dispatchEvent(new CustomEvent('ap-sag-tik-ayarlari-guncellendi'));
}
