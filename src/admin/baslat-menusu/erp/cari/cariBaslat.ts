/** Cari modülüne geçiş için oturum köprüsü (belgeler -> cari düzenleme) */

export const CARI_BASLAT_ANAHTAR = 'erp-cari-baslat-v1';
export const CARI_BASLAT_OLAY = 'erp-cari-baslat';

export interface CariBaslatPayload {
  cariId?: string;
  duzenle?: boolean;
}

export function cariBaslatYaz(payload: CariBaslatPayload) {
  try {
    sessionStorage.setItem(CARI_BASLAT_ANAHTAR, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(CARI_BASLAT_OLAY));
  } catch {
    /* ignore */
  }
}

export function cariBaslatOkuVeTemizle(): CariBaslatPayload | null {
  try {
    const ham = sessionStorage.getItem(CARI_BASLAT_ANAHTAR);
    sessionStorage.removeItem(CARI_BASLAT_ANAHTAR);
    if (!ham) return null;
    const p = JSON.parse(ham) as CariBaslatPayload;
    if (!p || typeof p !== 'object') return null;
    return p;
  } catch {
    return null;
  }
}
