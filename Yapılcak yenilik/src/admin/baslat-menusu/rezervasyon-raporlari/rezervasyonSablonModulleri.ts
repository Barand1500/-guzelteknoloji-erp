export const REZERVASYON_SABLON_MODUL_IDLERI = ['rezervasyon-listesi'] as const;

export type RezervasyonSablonModulId = (typeof REZERVASYON_SABLON_MODUL_IDLERI)[number];

export function rezervasyonSablonMu(id: string): id is RezervasyonSablonModulId {
  return (REZERVASYON_SABLON_MODUL_IDLERI as readonly string[]).includes(id);
}
