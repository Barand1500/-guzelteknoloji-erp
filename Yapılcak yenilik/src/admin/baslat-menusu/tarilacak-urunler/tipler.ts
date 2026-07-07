export interface TartilacakUrunOge {
  id: string;
  ad: string;
  grup: string;
  stokKodu: string;
}

export interface TartilacakUrunKayit {
  tartilanUrunIdleri: string[];
}

export function bosTartilacakKayit(): TartilacakUrunKayit {
  return { tartilanUrunIdleri: [] };
}

export function tartilacakKayitKopyala(k: TartilacakUrunKayit): TartilacakUrunKayit {
  return { tartilanUrunIdleri: [...k.tartilanUrunIdleri] };
}

export function tartilacakKayitlariEsit(a: TartilacakUrunKayit, b: TartilacakUrunKayit): boolean {
  const sa = [...a.tartilanUrunIdleri].sort();
  const sb = [...b.tartilanUrunIdleri].sort();
  return sa.length === sb.length && sa.every((id, i) => id === sb[i]);
}
