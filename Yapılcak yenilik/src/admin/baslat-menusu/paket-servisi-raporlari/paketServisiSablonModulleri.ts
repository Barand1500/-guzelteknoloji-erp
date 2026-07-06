export const PAKET_SERVISI_SABLON_MODUL_IDLERI = [
  'ps-gun-sonu',
  'ps-paket-restoran-birlesik-gun-sonu',
] as const;

export type PaketServisiSablonModulId = (typeof PAKET_SERVISI_SABLON_MODUL_IDLERI)[number];

export function paketServisiSablonMu(id: string): id is PaketServisiSablonModulId {
  return (PAKET_SERVISI_SABLON_MODUL_IDLERI as readonly string[]).includes(id);
}
