export type YedeklemeFormati = 'json' | 'sql' | 'zip';

export const YEDEKLEME_FORMATLARI: { deger: YedeklemeFormati; ad: string; aciklama: string }[] = [
  { deger: 'json', ad: 'JSON', aciklama: 'Tüm site verisi JSON dosyası' },
  { deger: 'sql', ad: 'SQL', aciklama: 'Veritabanı SQL dökümü' },
  { deger: 'zip', ad: 'ZIP', aciklama: 'Sıkıştırılmış arşiv' },
];

export const VARSAYILAN_YEDEKLEME_FORMATI: YedeklemeFormati = 'json';

export function yedeklemeFormatiNormalize(format?: string): YedeklemeFormati {
  if (format === 'sql' || format === 'zip') return format;
  return VARSAYILAN_YEDEKLEME_FORMATI;
}

export function yedekDosyaAdiFormatla(ad: string, format: YedeklemeFormati): string {
  const temiz = ad.replace(/\.(json|sql|zip)$/i, '');
  return `${temiz}.${format}`;
}

export function yedeklemeFormatiUzantisi(format: YedeklemeFormati): string {
  return `.${format}`;
}
