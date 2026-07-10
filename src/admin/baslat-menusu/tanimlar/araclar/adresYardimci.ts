export type EskiAdresAlanlari = {
  adres?: string;
  cadde?: string;
  sokak?: string;
  bina?: string;
  no?: string;
};

/** Eski cadde/sokak/bina/no alanlarından veya doğrudan adres alanından metin üretir. */
export function adresMetniniOku(kayit: EskiAdresAlanlari): string {
  if (kayit.adres?.trim()) return kayit.adres.trim();
  const parcalar: string[] = [];
  if (kayit.cadde?.trim()) parcalar.push(kayit.cadde.trim());
  if (kayit.sokak?.trim()) parcalar.push(kayit.sokak.trim());
  if (kayit.bina?.trim()) parcalar.push(kayit.bina.trim());
  if (kayit.no?.trim()) parcalar.push(kayit.no.trim());
  return parcalar.join(' ');
}
