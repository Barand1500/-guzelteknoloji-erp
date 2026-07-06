export const RAPOR_SABLON_MODUL_IDLERI = [
  'gun-sonu',
  'gunluk-toplamlar',
  'ozet-ciro',
  'masalara-gore-ciro',
  'personel-tahsilat-raporu',
  'faaliyet-raporu',
  'gider-gelir-kayitlari-raporu',
  'silinen-siparisler',
] as const;

export type RaporSablonModulId = (typeof RAPOR_SABLON_MODUL_IDLERI)[number];

export function raporSablonMu(id: string): id is RaporSablonModulId {
  return (RAPOR_SABLON_MODUL_IDLERI as readonly string[]).includes(id);
}
