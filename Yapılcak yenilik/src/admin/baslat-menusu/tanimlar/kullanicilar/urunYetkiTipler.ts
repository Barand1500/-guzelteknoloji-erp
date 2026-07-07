export interface TanimlarUrun {
  id: string;
  ad: string;
  grup: string;
}

export const TANIMLAR_URUN_GRUPLARI = [
  'Tümü',
  'Döner Menü',
  'Dürüm',
  'Et Döner',
  'İçecek',
  'Tatlı',
  'Yan Ürün',
] as const;

export const TANIMLAR_URUN_KATALOGU: TanimlarUrun[] = [
  { id: 'u1', ad: 'Combo Zurna Tavuk Dürüm Menü', grup: 'Döner Menü' },
  { id: 'u2', ad: 'Tiktok Tavuk Döner Dürüm - 80 gr.', grup: 'Dürüm' },
  { id: 'u3', ad: 'Klasik Zurna Tavuk Döner Menü', grup: 'Döner Menü' },
  { id: 'u4', ad: '(Eski Usül) Ekmek Arası Et Döner', grup: 'Et Döner' },
  { id: 'u5', ad: 'Çikolatalı Puding', grup: 'Tatlı' },
  { id: 'u6', ad: 'Eker Ayran (270 Ml.)', grup: 'İçecek' },
  { id: 'u7', ad: 'Zurna Et Döner Menü', grup: 'Döner Menü' },
  { id: 'u8', ad: 'Tavuk Döner Dürüm - 100 gr.', grup: 'Dürüm' },
  { id: 'u9', ad: 'Et Döner Porsiyon', grup: 'Et Döner' },
  { id: 'u10', ad: 'Sütlaç', grup: 'Tatlı' },
  { id: 'u11', ad: 'Kola (330 Ml.)', grup: 'İçecek' },
  { id: 'u12', ad: 'Su (500 Ml.)', grup: 'İçecek' },
  { id: 'u13', ad: 'Patates Kızartması', grup: 'Yan Ürün' },
  { id: 'u14', ad: 'Soğan Halkası', grup: 'Yan Ürün' },
  { id: 'u15', ad: 'Mega Tavuk Döner Menü', grup: 'Döner Menü' },
  { id: 'u16', ad: 'Lavaş Arası Tavuk Döner', grup: 'Dürüm' },
  { id: 'u17', ad: 'İskender Et Döner', grup: 'Et Döner' },
  { id: 'u18', ad: 'Künefe', grup: 'Tatlı' },
  { id: 'u19', ad: 'Şalgam (250 Ml.)', grup: 'İçecek' },
  { id: 'u20', ad: 'Çoban Salata', grup: 'Yan Ürün' },
  { id: 'u21', ad: 'Tavuk Pilav Üstü', grup: 'Döner Menü' },
  { id: 'u22', ad: 'Zurna Karışık Dürüm Menü', grup: 'Döner Menü' },
  { id: 'u23', ad: 'Limonata', grup: 'İçecek' },
  { id: 'u24', ad: 'Baklava (3 Adet)', grup: 'Tatlı' },
];

export interface TanimlarUrunYetkiKaydi {
  yetkiliUrunIdleri: string[];
}

export function bosUrunYetkiKaydi(): TanimlarUrunYetkiKaydi {
  return { yetkiliUrunIdleri: [] };
}

export function urunYetkiKopyala(k: TanimlarUrunYetkiKaydi): TanimlarUrunYetkiKaydi {
  return { yetkiliUrunIdleri: [...k.yetkiliUrunIdleri] };
}

export function urunBul(id: string): TanimlarUrun | undefined {
  return TANIMLAR_URUN_KATALOGU.find((u) => u.id === id);
}
