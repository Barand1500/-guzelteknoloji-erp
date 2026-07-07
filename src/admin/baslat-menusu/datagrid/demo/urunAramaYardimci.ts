export interface UrunKaydi {
  sku: string;
  ad: string;
  kur?: string;
  kategori?: string;
}

/** Alan değeri % ile başlıyorsa arama modundadır. */
export function yuzdeAramaModu(deger: string | undefined): boolean {
  return Boolean(deger?.trimStart().startsWith('%'));
}

/** %bar → bar; yalnızca % → boş sorgu (tümü). */
export function yuzdeAramaSorgusu(deger: string | undefined): string | null {
  if (!yuzdeAramaModu(deger)) return null;
  return deger!.trimStart().slice(1).trim();
}

export function urunleriAra(katalog: UrunKaydi[], sorgu: string): UrunKaydi[] {
  const q = sorgu.trim().toLowerCase();
  if (!q) return katalog;
  return katalog.filter(
    (u) => u.sku.toLowerCase().includes(q) || u.ad.toLowerCase().includes(q)
  );
}

export function hizliGirisYuzdeSorgusu(degerler: Record<string, string>, alanId: string): string | null {
  const alanDeger = degerler[alanId];
  if (yuzdeAramaModu(alanDeger)) return yuzdeAramaSorgusu(alanDeger);

  const stok = yuzdeAramaSorgusu(degerler.stokKodu);
  const urun = yuzdeAramaSorgusu(degerler.urun);
  if (alanId === 'stokKodu' || alanId === 'urun') {
    return stok ?? urun;
  }
  return stok ?? urun;
}

/** Ürün alanı metninden arama sorgusu üretir (% varsa kaldırır). */
export function urunAramaSorgusuMetni(deger: string | undefined): string {
  if (!deger?.trim()) return '';
  const temiz = deger.trimStart();
  if (temiz.startsWith('%')) return temiz.slice(1).trim();
  return deger.trim();
}

export const URUN_ARAMA_ALANLARI = ['stokKodu', 'urun'] as const;

export function hizliGirisUrunSorgusu(
  degerler: Record<string, string>,
  alanId: string
): string {
  const alanDeger = degerler[alanId];
  const yuzdeSorgu = hizliGirisYuzdeSorgusu(degerler, alanId);
  if (yuzdeSorgu !== null) return yuzdeSorgu;

  if (alanId === 'stokKodu' || alanId === 'urun') {
    return urunAramaSorgusuMetni(alanDeger);
  }

  const stok = urunAramaSorgusuMetni(degerler.stokKodu);
  const urun = urunAramaSorgusuMetni(degerler.urun);
  return stok || urun;
}

export function hizliGirisUrunAlaniDolu(degerler: Record<string, string>): boolean {
  return Boolean(degerler.stokKodu?.trim() || degerler.urun?.trim());
}
