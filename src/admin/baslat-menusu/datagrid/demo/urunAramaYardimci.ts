export interface UrunBarkodDetay {
  birim: string;
  fiyat: number;
  kdv: number;
}

export interface UrunKaydi {
  sku: string;
  ad: string;
  kur?: string;
  birim: string;
  fiyat: number;
  envanter: number;
  kdv: number;
  /** Birim satırlarındaki barkodlar (arama / okutma) */
  barkodlar?: string[];
  /** Barkod → birim/fiyat/kdv (okutulunca doğru birim gelsin) */
  barkodDetay?: Record<string, UrunBarkodDetay>;
}

function barkodNormalize(ham: string | undefined | null): string {
  return (ham ?? '').trim().toLocaleLowerCase('tr');
}

/** Katalogda barkod ile ürün bul (tam eşleşme) */
export function urunBarkodlaBul(
  katalog: UrunKaydi[],
  hamBarkod: string | undefined
): { urun: UrunKaydi; detay?: UrunBarkodDetay } | null {
  const q = barkodNormalize(hamBarkod);
  if (!q) return null;
  for (const u of katalog) {
    const liste = u.barkodlar ?? [];
    if (!liste.some((b) => barkodNormalize(b) === q)) continue;
    const anahtar =
      Object.keys(u.barkodDetay ?? {}).find((b) => barkodNormalize(b) === q) ?? q;
    return { urun: u, detay: u.barkodDetay?.[anahtar] };
  }
  return null;
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
  const qBarkod = barkodNormalize(sorgu);
  return katalog.filter((u) => {
    if (u.sku.toLowerCase().includes(q) || u.ad.toLowerCase().includes(q)) return true;
    return (u.barkodlar ?? []).some((b) => barkodNormalize(b).includes(qBarkod));
  });
}

/** Ürün alanı metninden arama sorgusu üretir (% varsa kaldırır). */
export function urunAramaSorgusuMetni(deger: string | undefined): string {
  if (!deger?.trim()) return '';
  const temiz = deger.trimStart();
  if (temiz.startsWith('%')) return temiz.slice(1).trim();
  return deger.trim();
}

/** Hızlı giriş / satırda gösterilecek «kod / ad» metni */
export function urunKoduAdiEtiket(sku: string, ad: string): string {
  const kod = sku.trim();
  const adi = ad.trim();
  if (!kod) return adi;
  if (!adi || adi.toLocaleLowerCase('tr') === kod.toLocaleLowerCase('tr')) return kod;
  return `${kod} / ${adi}`;
}

/** «kod / ad» veya düz metinden kod kısmını ayıklar */
export function urunKoduAdiKodAl(ham: string | undefined): string {
  const metin = urunAramaSorgusuMetni(ham);
  if (!metin) return '';
  const ayirac = metin.indexOf(' / ');
  if (ayirac > 0) return metin.slice(0, ayirac).trim();
  return metin;
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

/** Tek alandan ürün kodu, adını (ve barkod eşleşmesinde birim/fiyat) çözümler. */
export function urunKoduAdiCozumle(
  ham: string | undefined,
  katalog: UrunKaydi[] = []
): { sku: string; ad: string; kur?: string; birim?: string; fiyat?: number; kdv?: number } {
  const metin = ham?.trim() ?? '';
  if (!metin) return { sku: 'YENİ-KOD', ad: 'Yeni ürün' };

  const aramaMetni = urunAramaSorgusuMetni(metin);

  // Barkod tam eşleşme (okuyucu / elle giriş)
  const barkodEslesen = urunBarkodlaBul(katalog, aramaMetni);
  if (barkodEslesen) {
    const { urun, detay } = barkodEslesen;
    return {
      sku: urun.sku,
      ad: urun.ad,
      kur: urun.kur,
      birim: detay?.birim ?? urun.birim,
      fiyat: detay?.fiyat ?? urun.fiyat,
      kdv: detay?.kdv ?? urun.kdv,
    };
  }

  // «SKU / Ad» formatı
  const ayirac = aramaMetni.indexOf(' / ');
  if (ayirac > 0) {
    const kod = aramaMetni.slice(0, ayirac).trim();
    const ad = aramaMetni.slice(ayirac + 3).trim();
    const skuTam = katalog.find((u) => u.sku.toLowerCase() === kod.toLowerCase());
    if (skuTam) return { sku: skuTam.sku, ad: skuTam.ad, kur: skuTam.kur };
    if (kod) return { sku: kod, ad: ad || kod };
  }

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
