export interface BarkodSembolTanim {
  kod: string;
  baslik: string;
  aciklama: string;
}

export const BARKOD_SEMBOLLER: BarkodSembolTanim[] = [
  { kod: 'B', baslik: 'Ürün kodu', aciklama: 'Ürünü tanımlayan karakterler' },
  { kod: 'G', baslik: 'Gramaj', aciklama: 'Ağırlık bilgisi (gram)' },
  { kod: 'A', baslik: 'Adet', aciklama: 'Miktar / parça bilgisi' },
  { kod: 'C', baslik: 'Kontrol', aciklama: 'Check digit veya herhangi bir karakter' },
];

export const BARKOD_ORNEK_DESENLER = [
  { desen: '27BBBBBGGGGGC', aciklama: '5 haneli ürün kodu, 5 haneli ağırlık' },
  { desen: '27BBBBBCGGGGGC', aciklama: '5 haneli ürün kodu, 4 haneli ağırlık' },
  { desen: '27BBBBBCAAAAC', aciklama: '5 haneli ürün kodu, 4 haneli adet' },
] as const;

export const BARKOD_DESEN_REGEX = /^[0-9BGAC]+$/i;

export function barkodDesenGecerli(desen: string): boolean {
  const ham = desen.trim();
  return ham.length > 0 && BARKOD_DESEN_REGEX.test(ham);
}

export type BarkodSembolTipi = 'sabit' | 'B' | 'G' | 'A' | 'C' | 'diger';

export function desenParcala(desen: string): { tip: BarkodSembolTipi; metin: string }[] {
  const parcalar: { tip: BarkodSembolTipi; metin: string }[] = [];
  let i = 0;
  while (i < desen.length) {
    const ch = desen[i].toUpperCase();
    if (ch >= '0' && ch <= '9') {
      let sayi = ch;
      while (i + 1 < desen.length && desen[i + 1] >= '0' && desen[i + 1] <= '9') {
        i += 1;
        sayi += desen[i];
      }
      parcalar.push({ tip: 'sabit', metin: sayi });
    } else if (ch === 'B' || ch === 'G' || ch === 'A' || ch === 'C') {
      parcalar.push({ tip: ch, metin: ch });
    } else {
      parcalar.push({ tip: 'diger', metin: desen[i] });
    }
    i += 1;
  }
  return parcalar;
}
