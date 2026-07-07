export const BIRIM_SECENEKLERI = [
  { deger: 'ADET', etiket: 'Adet' },
  { deger: 'KG', etiket: 'Kg' },
  { deger: 'LT', etiket: 'Lt' },
  { deger: 'PAKET', etiket: 'Paket' },
  { deger: 'KUTU', etiket: 'Kutu' },
  { deger: 'METRE', etiket: 'Metre' },
] as const;

export type BirimKodu = (typeof BIRIM_SECENEKLERI)[number]['deger'];

const GECERLI_BIRIMLER = new Set<string>(BIRIM_SECENEKLERI.map((b) => b.deger));

export function birimEtiketi(kod: string): string {
  return BIRIM_SECENEKLERI.find((b) => b.deger === kod)?.etiket ?? kod;
}

export function gecerliBirim(kod: string | undefined, varsayilan: BirimKodu = 'ADET'): BirimKodu {
  const ust = kod?.trim().toUpperCase();
  if (ust && GECERLI_BIRIMLER.has(ust)) return ust as BirimKodu;
  return varsayilan;
}

export function birimSecenekleri() {
  return BIRIM_SECENEKLERI.map((b) => ({ deger: b.deger, etiket: b.etiket }));
}
