export const YAZICI_TUMU = '*';

export type YaziciSekme = 'mutfak' | 'pusula' | 'resmi-adisyon';

export const YAZICI_SEKMELER: { id: YaziciSekme; etiket: string; ikon: string }[] = [
  { id: 'mutfak', etiket: 'Mutfak Çıktıları', ikon: '🍳' },
  { id: 'pusula', etiket: 'Pusula Çıktıları', ikon: '🧾' },
  { id: 'resmi-adisyon', etiket: 'Resmi Adisyon', ikon: '📄' },
];

export const YAZICI_ONERILERI = ['MUTFAK', 'PUSULA', 'BAR', 'KASA', 'IZGARA'] as const;

export const MUTFAK_EKRAN_ONERILERI = ['Mutfak-1', 'Mutfak-2', 'Bar Ekranı'] as const;

export interface MutfakYaziciKurali {
  id: string;
  bilgisayar: string;
  masaPrefix: string;
  garson: string;
  urunGrubu: string;
  urun: string;
  yazici: string;
  mutfakEkrani: string;
}

export interface BasitYaziciKurali {
  id: string;
  bilgisayar: string;
  garson: string;
  yazici: string;
}

export interface YaziciTanimlariKayit {
  mutfak: MutfakYaziciKurali[];
  pusula: BasitYaziciKurali[];
  resmiAdisyon: BasitYaziciKurali[];
}

export function yeniMutfakKurali(): MutfakYaziciKurali {
  return {
    id: `my-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bilgisayar: YAZICI_TUMU,
    masaPrefix: YAZICI_TUMU,
    garson: YAZICI_TUMU,
    urunGrubu: YAZICI_TUMU,
    urun: YAZICI_TUMU,
    yazici: '',
    mutfakEkrani: '',
  };
}

export function yeniBasitKural(yazici = ''): BasitYaziciKurali {
  return {
    id: `by-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bilgisayar: YAZICI_TUMU,
    garson: YAZICI_TUMU,
    yazici,
  };
}

export function yaziciKaydiKopyala(k: YaziciTanimlariKayit): YaziciTanimlariKayit {
  return {
    mutfak: k.mutfak.map((r) => ({ ...r })),
    pusula: k.pusula.map((r) => ({ ...r })),
    resmiAdisyon: k.resmiAdisyon.map((r) => ({ ...r })),
  };
}

export function yaziciKayitlariEsit(a: YaziciTanimlariKayit, b: YaziciTanimlariKayit): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
