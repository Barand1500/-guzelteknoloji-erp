export interface FormulaOrnek {
  girdi: string;
  sonuc: string;
  aciklama: string;
}

export interface FormulaOrnekGrubu {
  id: string;
  baslik: string;
  ornekler: FormulaOrnek[];
}

export const SAYI_FORMUL_GRUPLARI: FormulaOrnekGrubu[] = [
  {
    id: 'yuzde',
    baslik: 'Yüzde',
    ornekler: [
      { girdi: '1000+%10', sonuc: '1100', aciklama: 'Tutara %10 Ekle' },
      { girdi: '1000-%10', sonuc: '900', aciklama: 'Tutardan %10 Düş' },
      { girdi: '1000+10%', sonuc: '1100', aciklama: '+%10 ile Aynı (Yüzde Sonda)' },
    ],
  },
  {
    id: 'temel',
    baslik: 'İşlemler',
    ornekler: [
      { girdi: '10+10', sonuc: '20', aciklama: 'Toplama' },
      { girdi: '100-25', sonuc: '75', aciklama: 'Çıkarma' },
      { girdi: '500*2', sonuc: '1000', aciklama: 'Çarpma' },
      { girdi: '1000/4', sonuc: '250', aciklama: 'Bölme' },
    ],
  },
  {
    id: 'parantez',
    baslik: 'Parantez',
    ornekler: [
      { girdi: '(100+50)*2', sonuc: '300', aciklama: 'Önce Topla, Sonra Çarp' },
      { girdi: '(500+500)+%10', sonuc: '1100', aciklama: 'Parantez Sonucuna %10 Ekle' },
      { girdi: '1000+%10+50', sonuc: '1150', aciklama: 'Sırayla İşle' },
    ],
  },
  {
    id: 'kdv',
    baslik: 'Oran',
    ornekler: [{ girdi: '%20', sonuc: '20', aciklama: 'KDV Oranı' }],
  },
];

/** İskonto alanlarında kullanılabilecek örnekler */
export const ISKONTO_FORMUL_ORNEKLERI: FormulaOrnek[] = [
  { girdi: '20', sonuc: '%20', aciklama: 'Tek İskonto' },
  { girdi: '20+20', sonuc: '%36', aciklama: 'Bileşik İskonto (20 Ardından 20)' },
  { girdi: '10+10+10', sonuc: '%27,1', aciklama: 'Üç Kademeli İskonto' },
];

type Op = '+' | '-' | '*' | '/';

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'pct'; value: number }
  | { kind: 'pctPost'; value: number }
  | { kind: 'op'; value: Op }
  | { kind: 'lparen' }
  | { kind: 'rparen' };

function sayiGirdisiniTemizle(girdi: string): string {
  return girdi.trim().replace(/\s+/g, '').replace(/,/g, '.');
}

function tokenize(girdi: string): Token[] | null {
  const s = sayiGirdisiniTemizle(girdi);
  if (!s) return null;

  const tokens: Token[] = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if (c === '(') {
      tokens.push({ kind: 'lparen' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ kind: 'rparen' });
      i++;
      continue;
    }

    if (c === '+' || c === '-' || c === '*' || c === '/') {
      const onceki = tokens[tokens.length - 1];
      const unaryEksi =
        c === '-' &&
        (!onceki || onceki.kind === 'op' || onceki.kind === 'lparen');
      if (unaryEksi) {
        const m = s.slice(i).match(/^-(\d+(?:\.\d+)?)/);
        if (m) {
          tokens.push({ kind: 'num', value: -parseFloat(m[1]) });
          i += m[0].length;
          continue;
        }
      }
      tokens.push({ kind: 'op', value: c });
      i++;
      continue;
    }

    if (c === '%') {
      const m = s.slice(i).match(/^%(\d+(?:\.\d+)?)/);
      if (!m) return null;
      tokens.push({ kind: 'pct', value: parseFloat(m[1]) });
      i += m[0].length;
      continue;
    }

    const m = s.slice(i).match(/^(\d+(?:\.\d+)?)(%)?/);
    if (m) {
      const num = parseFloat(m[1]);
      tokens.push(m[2] ? { kind: 'pctPost', value: num } : { kind: 'num', value: num });
      i += m[0].length;
      continue;
    }

    return null;
  }

  return tokens;
}

class SayiIfadeCozucu {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  coz(): number {
    const sonuc = this.ifade();
    if (this.pos !== this.tokens.length) throw new Error('fazla token');
    return sonuc;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private ileri(): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new Error('eksik token');
    this.pos++;
    return t;
  }

  private ifade(): number {
    let sol = this.terim();
    while (this.peek()?.kind === 'op' && (this.peek() as { value: Op }).value.match(/[+-]/)) {
      const op = (this.ileri() as { kind: 'op'; value: Op }).value;
      const sag = this.terim(sol);
      sol = op === '+' ? sol + sag : sol - sag;
    }
    return sol;
  }

  private terim(solBaglam?: number): number {
    let sol = this.carpan(solBaglam);
    while (this.peek()?.kind === 'op' && (this.peek() as { value: Op }).value.match(/[*/]/)) {
      const op = (this.ileri() as { kind: 'op'; value: Op }).value;
      const sag = this.carpan(sol);
      sol = op === '*' ? sol * sag : sol / sag;
    }
    return sol;
  }

  private carpan(solBaglam?: number): number {
    const t = this.peek();
    if (!t) throw new Error('eksik carpan');

    if (t.kind === 'pct') {
      this.ileri();
      if (solBaglam === undefined) return t.value;
      return (solBaglam * t.value) / 100;
    }

    if (t.kind === 'pctPost') {
      this.ileri();
      if (solBaglam === undefined) return t.value;
      return (solBaglam * t.value) / 100;
    }

    if (t.kind === 'num') {
      this.ileri();
      return t.value;
    }

    if (t.kind === 'lparen') {
      this.ileri();
      const ic = this.ifade();
      const kapanis = this.ileri();
      if (kapanis.kind !== 'rparen') throw new Error('parantez');
      return ic;
    }

    if (t.kind === 'op' && t.value === '-' && solBaglam === undefined) {
      this.ileri();
      return -this.carpan();
    }

    throw new Error('gecersiz carpan');
  }
}

function sonucYuvarla(deger: number): number {
  return Math.round(deger * 10000) / 10000;
}

/**
 * Sayı ifadesi: + - * / parantez ve yüzde.
 * %10 veya 10% sol taraftaki değerin yüzdesi olarak yorumlanır (1000+%10 → 1100).
 * Tek başına %20 veya 20% → 20 (KDV oranı gibi).
 */
export function sayiIfadesiHesapla(girdi: string): number | null {
  const temiz = sayiGirdisiniTemizle(girdi);
  if (!temiz) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(temiz)) return parseFloat(temiz);

  const tokens = tokenize(temiz);
  if (!tokens?.length) return null;

  try {
    const sonuc = new SayiIfadeCozucu(tokens).coz();
    if (!Number.isFinite(sonuc)) return null;
    return sonucYuvarla(sonuc);
  } catch {
    const guvenli = temiz.replace(/[^0-9+\-*/().%]/g, '');
    if (!guvenli || !/[\d]/.test(guvenli)) return null;
    try {
      const yuzdesiz = guvenli.replace(/%/g, '');
      const sonuc = Function(`"use strict"; return (${yuzdesiz})`)() as unknown;
      if (typeof sonuc !== 'number' || !Number.isFinite(sonuc)) return null;
      return sonucYuvarla(sonuc);
    } catch {
      return null;
    }
  }
}

/**
 * İskonto ifadesi: 20+20 → bileşik %36 (1-(1-0.2)*(1-0.2))
 * Tek değer veya + ile ayrılmış yüzdeler.
 */
export function iskontoIfadesiHesapla(girdi: string): number | null {
  const temiz = girdi.trim().replace(/%/g, '').replace(/,/g, '.');
  if (!temiz) return null;

  if (temiz.includes('+') && !temiz.match(/[*/()-]/)) {
    const parcalar = temiz
      .split('+')
      .map((p) => parseFloat(p.trim()))
      .filter((n) => !Number.isNaN(n));
    if (parcalar.length >= 2) {
      let carpim = 1;
      for (const yuzde of parcalar) {
        carpim *= 1 - Math.min(100, Math.max(0, yuzde)) / 100;
      }
      return sonucYuvarla((1 - carpim) * 100);
    }
  }

  return sayiIfadesiHesapla(temiz);
}

export function ifadeHesapla(girdi: string, tip: 'sayi' | 'iskonto'): number | null {
  return tip === 'iskonto' ? iskontoIfadesiHesapla(girdi) : sayiIfadesiHesapla(girdi);
}

/** Düzenleme alanı ipucu metni */
export function formulaIpucuMetni(tip: 'sayi' | 'iskonto'): string {
  if (tip === 'iskonto') return 'Örn: 20 veya 20+20 (bileşik iskonto)';
  return 'Örn: 1000+%10, 500*2, 10+10';
}
