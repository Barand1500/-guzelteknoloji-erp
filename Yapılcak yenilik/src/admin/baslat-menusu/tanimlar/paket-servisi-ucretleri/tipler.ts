export type PaketUcretTipi = 'tutar' | 'oran';

export interface PaketServisUcretKurali {
  id: number;
  /** Sipariş tutarı üst sınırı (TL) */
  tutaraKadar: string;
  /** Kullanıcının yazdığı servis ürün adı */
  servisUrunu: string;
  ucretTipi: PaketUcretTipi;
  /** Yalnızca sayısal değer — % işareti tutar modunda yok */
  ucretDegeri: string;
}

export type PaketServisUcretAlan = 'tutaraKadar' | 'servisUrunu' | 'ucretDegeri';

export function bosPaketServisKurali(id: number): PaketServisUcretKurali {
  return { id, tutaraKadar: '', servisUrunu: '', ucretTipi: 'tutar', ucretDegeri: '' };
}

export function ucretDegeriGecerli(deger: string): boolean {
  const ham = deger.trim().replace(',', '.');
  if (!ham) return false;
  const n = Number(ham);
  return !Number.isNaN(n) && n >= 0;
}

export function ucretOnizleme(tip: PaketUcretTipi, deger: string): string {
  const ham = deger.trim();
  if (!ham) return '—';
  if (tip === 'oran') return `%${ham}`;
  return `${ham} ₺`;
}

export function ucretDegeriTemizle(ham: string): string {
  return ham.replace(/%/g, '').replace(/[^\d.,]/g, '');
}
