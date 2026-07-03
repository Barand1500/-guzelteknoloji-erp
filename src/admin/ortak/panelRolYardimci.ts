/** ERP panel — firma yoneticisi ve ust duzey roller */
export const PANEL_UST_ROLLER = ['SUPER_ADMIN', 'AJANS_ADMIN', 'YONETICI'] as const;

export function panelUstRolMu(rol?: string | null): boolean {
  return !!rol && (PANEL_UST_ROLLER as readonly string[]).includes(rol);
}

/** Rol matrisini duzenleyebilir (kaydet/sil) */
export function panelRolYoneticisiMi(rol?: string | null): boolean {
  return rol === 'SUPER_ADMIN' || rol === 'YONETICI';
}

/** Matriste yetkisi degistirilemeyen roller */
export function korunmusRolMu(rolKod: string): boolean {
  return rolKod === 'SUPER_ADMIN' || rolKod === 'YONETICI';
}
