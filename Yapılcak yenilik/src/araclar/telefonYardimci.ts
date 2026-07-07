/** Türkiye telefon maskeleme — 0XXX XXX XX XX */

export function telefonRakamlari(deger: string): string {
  let r = deger.replace(/\D/g, '');
  if (r.startsWith('90') && r.length > 11) r = r.slice(2);
  if (r.length > 0 && r[0] !== '0') r = `0${r}`;
  return r.slice(0, 11);
}

export function telefonFormatla(ham: string): string {
  const d = telefonRakamlari(ham);
  if (!d) return '';
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}

export function telefonGecerliMi(ham: string): boolean {
  const d = telefonRakamlari(ham);
  return d.length === 11 && d.startsWith('0');
}
