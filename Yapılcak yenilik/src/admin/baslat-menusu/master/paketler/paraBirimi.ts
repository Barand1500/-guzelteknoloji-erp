export type PaketParaBirimi = 'TRY' | 'USD' | 'EUR' | 'GBP';

export const PAKET_PARA_BIRIMLERI: { kod: PaketParaBirimi; etiket: string; sembol: string }[] = [
  { kod: 'TRY', etiket: '₺ TRY', sembol: '₺' },
  { kod: 'USD', etiket: '$ USD', sembol: '$' },
  { kod: 'EUR', etiket: '€ EUR', sembol: '€' },
  { kod: 'GBP', etiket: '£ GBP', sembol: '£' },
];

export const VARSAYILAN_PARA_BIRIMI: PaketParaBirimi = 'TRY';

export function gecerliParaBirimi(kod: string): kod is PaketParaBirimi {
  return PAKET_PARA_BIRIMLERI.some((p) => p.kod === kod);
}

export function paketParaBirimiSembol(kod: string | undefined | null): string {
  return PAKET_PARA_BIRIMLERI.find((p) => p.kod === kod)?.sembol ?? '₺';
}

export function paketParaBirimiNormallestir(kod: string | undefined | null): PaketParaBirimi {
  const buyuk = String(kod ?? VARSAYILAN_PARA_BIRIMI).toUpperCase();
  return gecerliParaBirimi(buyuk) ? buyuk : VARSAYILAN_PARA_BIRIMI;
}
