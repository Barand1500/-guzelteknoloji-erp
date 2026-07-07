export const VARSAYILAN_FIYAT_LISTELERI = ['PAKET', 'SALON', 'GEL-AL'] as const;

export interface FiyatListesiKaydi {
  listeAdi: string;
  fiyat: number | null;
}

export function bosFiyatListesi(): FiyatListesiKaydi[] {
  return [];
}

export function fiyatListesiKopyala(liste: FiyatListesiKaydi[]): FiyatListesiKaydi[] {
  return liste.map((k) => ({ ...k }));
}

/** Kayıtlı listeleri varsayılan adlarla birleştirir; tanımsız satırlar null fiyatla gelir */
export function fiyatListesiHazirla(kayitli: FiyatListesiKaydi[] | undefined): FiyatListesiKaydi[] {
  const harita = new Map<string, number | null>();
  for (const k of kayitli ?? []) {
    if (k.listeAdi.trim()) harita.set(k.listeAdi.trim().toUpperCase(), k.fiyat);
  }
  const adlar = new Set<string>([...VARSAYILAN_FIYAT_LISTELERI]);
  for (const k of kayitli ?? []) {
    const ad = k.listeAdi.trim().toUpperCase();
    if (ad) adlar.add(ad);
  }
  return [...adlar].map((listeAdi) => ({
    listeAdi,
    fiyat: harita.get(listeAdi) ?? null,
  }));
}

export function fiyatListesiKaydet(liste: FiyatListesiKaydi[]): FiyatListesiKaydi[] {
  return liste
    .filter((k) => k.listeAdi.trim())
    .map((k) => ({
      listeAdi: k.listeAdi.trim().toUpperCase(),
      fiyat: k.fiyat,
    }));
}

export function ozelFiyatSayisi(liste: FiyatListesiKaydi[] | undefined): number {
  return (liste ?? []).filter((k) => k.fiyat != null && Number.isFinite(k.fiyat)).length;
}
