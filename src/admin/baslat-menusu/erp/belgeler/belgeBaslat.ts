/** Belgeler modülüne geçiş için oturum köprüsü (cari → belge ekle / belge aç) */

export const BELGE_BASLAT_ANAHTAR = 'erp-belge-baslat-v1';
export const BELGE_BASLAT_OLAY = 'erp-belge-baslat';

export interface BelgeBaslatPayload {
  cariId?: string;
  belgeId?: string;
  yeni?: boolean;
  belgeNeviId?: string;
}

function belgeBaslatParse(ham: string | null): BelgeBaslatPayload | null {
  if (!ham) return null;
  try {
    const p = JSON.parse(ham) as BelgeBaslatPayload;
    if (!p || typeof p !== 'object') return null;
    return p;
  } catch {
    return null;
  }
}

/** Silmeden okur — ilk render'da liste flaşını önlemek için */
export function belgeBaslatGozat(): BelgeBaslatPayload | null {
  try {
    return belgeBaslatParse(sessionStorage.getItem(BELGE_BASLAT_ANAHTAR));
  } catch {
    return null;
  }
}

export function belgeBaslatYaz(payload: BelgeBaslatPayload) {
  try {
    sessionStorage.setItem(BELGE_BASLAT_ANAHTAR, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(BELGE_BASLAT_OLAY));
  } catch {
    /* ignore */
  }
}

export function belgeBaslatOkuVeTemizle(): BelgeBaslatPayload | null {
  try {
    const ham = sessionStorage.getItem(BELGE_BASLAT_ANAHTAR);
    sessionStorage.removeItem(BELGE_BASLAT_ANAHTAR);
    return belgeBaslatParse(ham);
  } catch {
    return null;
  }
}

/** Liste yükü beklemeden uygulanabilir mi? (yeni belge / cari ile aç) */
export function belgeBaslatHemenUygulanir(p: BelgeBaslatPayload | null | undefined): boolean {
  if (!p) return false;
  if (p.belgeId) return false;
  return Boolean(p.yeni || p.cariId);
}
