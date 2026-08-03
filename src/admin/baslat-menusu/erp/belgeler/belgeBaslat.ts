/** Belgeler modülüne geçiş için oturum köprüsü (cari → belge ekle / belge aç) */

export const BELGE_BASLAT_ANAHTAR = 'erp-belge-baslat-v1';
export const BELGE_BASLAT_OLAY = 'erp-belge-baslat';

export interface BelgeBaslatPayload {
  cariId?: string;
  belgeId?: string;
  yeni?: boolean;
  belgeNeviId?: string;
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
    if (!ham) return null;
    const p = JSON.parse(ham) as BelgeBaslatPayload;
    if (!p || typeof p !== 'object') return null;
    return p;
  } catch {
    return null;
  }
}
