export const PLATFORM_GRUPLARI = [
  'Getir',
  'Yemeksepeti',
  'Trendyol',
  'Migros Yemek',
  'Kuver',
  'Rezervasyon',
] as const;

export type PlatformGrubu = (typeof PLATFORM_GRUPLARI)[number];

export const ESLESTIRME_DURUMLARI = [
  { id: 'tumu', etiket: 'Tümü' },
  { id: 'eslesmis', etiket: 'Eşleşmiş' },
  { id: 'eslesmemis', etiket: 'Eşleşmemiş' },
] as const;

export type EslestirmeDurumu = (typeof ESLESTIRME_DURUMLARI)[number]['id'];

export interface UrunEslestirmeOpsiyon {
  id: string;
  opsiyon: string;
  product: string;
  anaUrun: boolean;
  menuYuzdesi: string;
  miktar: string;
  menuFiyat: string;
}

export interface PlatformEslestirme {
  esDegerUrun: string;
  carpan: number;
  secenek1: string;
  secenek2: string;
  opsiyonlar: UrunEslestirmeOpsiyon[];
}

export interface UrunEslestirKayit {
  /** urunId → platform → eşleştirme */
  harita: Record<string, Record<string, PlatformEslestirme>>;
}

export interface UrunEslestirOge {
  id: string;
  stokKodu: string;
  ad: string;
  urunGrubu: string;
}

export function bosPlatformEslestirme(): PlatformEslestirme {
  return {
    esDegerUrun: '',
    carpan: 1,
    secenek1: '',
    secenek2: '',
    opsiyonlar: [],
  };
}

export function yeniEslestirmeOpsiyon(): UrunEslestirmeOpsiyon {
  return {
    id: `eo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    opsiyon: '',
    product: '',
    anaUrun: false,
    menuYuzdesi: '',
    miktar: '',
    menuFiyat: '',
  };
}

export function eslestirmeDolu(e: PlatformEslestirme | undefined): boolean {
  if (!e) return false;
  return Boolean(e.esDegerUrun.trim());
}

export function urunEslestirKayitKopyala(k: UrunEslestirKayit): UrunEslestirKayit {
  const harita: UrunEslestirKayit['harita'] = {};
  for (const [urunId, platformlar] of Object.entries(k.harita)) {
    harita[urunId] = {};
    for (const [platform, es] of Object.entries(platformlar)) {
      harita[urunId][platform] = {
        ...es,
        opsiyonlar: es.opsiyonlar.map((o) => ({ ...o })),
      };
    }
  }
  return { harita };
}

export function urunEslestirKayitlariEsit(a: UrunEslestirKayit, b: UrunEslestirKayit): boolean {
  return JSON.stringify(a.harita) === JSON.stringify(b.harita);
}
