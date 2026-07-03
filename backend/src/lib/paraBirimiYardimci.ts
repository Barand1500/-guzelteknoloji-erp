const GECERLI_PARA_BIRIMLERI = new Set(['TRY', 'USD', 'EUR', 'GBP']);

export function paraBirimiDogrula(deger: unknown, varsayilan = 'TRY'): string | null {
  const kod = String(deger ?? varsayilan).trim().toUpperCase();
  return GECERLI_PARA_BIRIMLERI.has(kod) ? kod : null;
}
