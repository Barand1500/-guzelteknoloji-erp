export const PARA_BIRIMI_SECENEKLERI = [
  { deger: 'TRY', etiket: '₺ TRY', sembol: '₺' },
  { deger: 'USD', etiket: '$ USD', sembol: '$' },
  { deger: 'EUR', etiket: '€ EUR', sembol: '€' },
  { deger: 'GBP', etiket: '£ GBP', sembol: '£' },
] as const;

export type ParaBirimiKodu = (typeof PARA_BIRIMI_SECENEKLERI)[number]['deger'];

const GECERLI_PB = new Set<string>(PARA_BIRIMI_SECENEKLERI.map((p) => p.deger));

const SEMBOL_MAP: Record<string, ParaBirimiKodu> = {
  '₺': 'TRY',
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

export function paraBirimiSembolu(kod: string): string {
  return PARA_BIRIMI_SECENEKLERI.find((p) => p.deger === kod)?.sembol ?? kod;
}

export function paraBirimiEtiketi(kod: string): string {
  return paraBirimiSembolu(kod);
}

export function gecerliParaBirimi(
  kod: string | undefined,
  varsayilan: ParaBirimiKodu = 'TRY'
): ParaBirimiKodu {
  const ust = kod?.trim().toUpperCase();
  if (ust && GECERLI_PB.has(ust)) return ust as ParaBirimiKodu;
  const sembol = kod?.trim();
  if (sembol && SEMBOL_MAP[sembol]) return SEMBOL_MAP[sembol];
  return varsayilan;
}

export function paraBirimiSecenekleri() {
  return PARA_BIRIMI_SECENEKLERI.map((p) => ({ deger: p.deger, etiket: p.etiket }));
}
