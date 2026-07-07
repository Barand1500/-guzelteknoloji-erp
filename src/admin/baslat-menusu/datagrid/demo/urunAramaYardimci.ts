export interface UrunKaydi {
  sku: string;
  ad: string;
  kur?: string;
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

/** Ürün alanı metninden arama sorgusu üretir (% varsa kaldırır). */
export function urunAramaSorgusuMetni(deger: string | undefined): string {
  if (!deger?.trim()) return '';
  const temiz = deger.trimStart();
  if (temiz.startsWith('%')) return temiz.slice(1).trim();
  return deger.trim();
}

export const URUN_ARAMA_ALANLARI = ['urunKoduAdi'] as const;

export function hizliGirisUrunSorgusu(
  degerler: Record<string, string>,
  alanId: string
): string {
  const alanDeger = degerler[alanId];
  const yuzdeSorgu = yuzdeAramaModu(alanDeger) ? yuzdeAramaSorgusu(alanDeger) : null;
  if (yuzdeSorgu !== null) return yuzdeSorgu;
  return urunAramaSorgusuMetni(alanDeger ?? degerler.urunKoduAdi);
}

export function hizliGirisUrunAlaniDolu(degerler: Record<string, string>): boolean {
  return Boolean(degerler.urunKoduAdi?.trim());
}

/** Tek alandan ürün kodu ve adını çözümler. */
export function urunKoduAdiCozumle(
  ham: string | undefined,
  katalog: UrunKaydi[] = []
): { sku: string; ad: string; kur?: string } {
  const metin = ham?.trim() ?? '';
  if (!metin) return { sku: 'YENİ-KOD', ad: 'Yeni ürün' };

  const aramaMetni = urunAramaSorgusuMetni(metin);

  const skuTam = katalog.find((u) => u.sku.toLowerCase() === aramaMetni.toLowerCase());
  if (skuTam) return { sku: skuTam.sku, ad: skuTam.ad, kur: skuTam.kur };

  const adTam = katalog.find((u) => u.ad.toLowerCase() === aramaMetni.toLowerCase());
  if (adTam) return { sku: adTam.sku, ad: adTam.ad, kur: adTam.kur };

  if (aramaMetni) {
    const sonuclar = urunleriAra(katalog, aramaMetni);
    if (sonuclar.length === 1) {
      return { sku: sonuclar[0].sku, ad: sonuclar[0].ad, kur: sonuclar[0].kur };
    }
  }

  if (!metin.includes(' ')) {
    return { sku: metin, ad: metin };
  }
  return { sku: 'YENİ-KOD', ad: metin };
}
