/** Cari hareket özeti — satır satır alan düzeni */

export type CariOzetAlanId =
  | 'cariTipi'
  | 'isletmeTuru'
  | 'unvan'
  | 'vergiNo'
  | 'vergiDairesi'
  | 'adres'
  | 'il'
  | 'ilce'
  | 'telefon'
  | 'gsm'
  | 'eposta'
  | 'web'
  | 'efatura'
  | 'efaturaTipi'
  | 'alias'
  | 'earsivTeslim'
  | 'eirsaliye'
  | 'earsivAlias';

export interface CariOzetAlanTanim {
  id: CariOzetAlanId;
  etiket: string;
  mono?: boolean;
}

export interface CariOzetAlanDuzeni {
  /** Her satır 1–6 alan (yan yana) */
  satirlar: CariOzetAlanId[][];
  /** Özet kart kutularının boyutu */
  kutuBoyutu: CariOzetKutuBoyutu;
  /** Tipografi ve davranış */
  gorunum: CariOzetGorunum;
}

export type CariOzetKutuBoyutu = 'kompakt' | 'normal' | 'genis';
export type CariOzetYaziAgirlik = 'ince' | 'normal' | 'kalin';
export type CariOzetYaziBoyut = 'kucuk' | 'orta' | 'buyuk';

export interface CariOzetGorunum {
  etiketAgirlik: CariOzetYaziAgirlik;
  etiketBoyut: CariOzetYaziBoyut;
  etiketBuyukHarf: boolean;
  degerAgirlik: CariOzetYaziAgirlik;
  degerBoyut: CariOzetYaziBoyut;
  ozetBaslangicAcik: boolean;
  bosAlanGoster: boolean;
}

export const CARI_OZET_GORUNUM_VARSAYILAN: CariOzetGorunum = {
  etiketAgirlik: 'kalin',
  etiketBoyut: 'orta',
  etiketBuyukHarf: true,
  degerAgirlik: 'normal',
  degerBoyut: 'orta',
  ozetBaslangicAcik: true,
  bosAlanGoster: true,
};

export const CARI_OZET_KUTU_BOYUTLARI: {
  id: CariOzetKutuBoyutu;
  etiket: string;
  aciklama: string;
}[] = [
  { id: 'kompakt', etiket: 'Kompakt', aciklama: 'Sıkı, daha çok alan sığar' },
  { id: 'normal', etiket: 'Normal', aciklama: 'Dengeli boşluk' },
  { id: 'genis', etiket: 'Geniş', aciklama: 'Rahat, okunaklı' },
];

export const CARI_OZET_SATIR_SUTUN_MAX = 6;
export const CARI_OZET_ALAN_MAX = 18;

export const CARI_OZET_ALANLARI: CariOzetAlanTanim[] = [
  { id: 'cariTipi', etiket: 'Cari Tipi' },
  { id: 'isletmeTuru', etiket: 'İşletme Türü' },
  { id: 'unvan', etiket: 'Ünvanı' },
  { id: 'vergiNo', etiket: 'Vergi No', mono: true },
  { id: 'vergiDairesi', etiket: 'Vergi Dairesi' },
  { id: 'adres', etiket: 'Adres' },
  { id: 'il', etiket: 'İl' },
  { id: 'ilce', etiket: 'İlçe' },
  { id: 'telefon', etiket: 'Telefon' },
  { id: 'gsm', etiket: 'GSM' },
  { id: 'eposta', etiket: 'E-posta' },
  { id: 'web', etiket: 'Web' },
  { id: 'efatura', etiket: 'E-Fatura' },
  { id: 'efaturaTipi', etiket: 'Fatura Tipi' },
  { id: 'alias', etiket: 'E-Fatura Alias', mono: true },
  { id: 'earsivTeslim', etiket: 'E-Arşiv Teslim' },
  { id: 'eirsaliye', etiket: 'E-İrsaliye' },
  { id: 'earsivAlias', etiket: 'E-İrsaliye Alias', mono: true },
];

export const CARI_OZET_ALAN_ETIKET: Record<CariOzetAlanId, string> = Object.fromEntries(
  CARI_OZET_ALANLARI.map((a) => [a.id, a.etiket])
) as Record<CariOzetAlanId, string>;

/** Varsayılan satır düzeni */
export const CARI_OZET_ALAN_VARSAYILAN: CariOzetAlanDuzeni = {
  kutuBoyutu: 'normal',
  gorunum: { ...CARI_OZET_GORUNUM_VARSAYILAN },
  satirlar: [
    ['cariTipi', 'isletmeTuru', 'vergiNo', 'vergiDairesi'],
    ['unvan', 'adres'],
    ['il', 'ilce'],
    ['telefon', 'eposta', 'web'],
    ['efatura', 'alias', 'eirsaliye', 'earsivAlias'],
  ],
};

export const CARI_OZET_ALAN_BOS: CariOzetAlanDuzeni = {
  kutuBoyutu: 'normal',
  gorunum: { ...CARI_OZET_GORUNUM_VARSAYILAN },
  satirlar: [],
};

const TUM_IDLER = new Set(CARI_OZET_ALANLARI.map((a) => a.id));
const GLOBAL_ANAHTAR = 'gt_cari_ozet_alan_duzeni_v2';
const CARI_ANAHTAR = 'gt_cari_ozet_alan_duzeni_cari_v2';
const GLOBAL_ESKI = 'gt_cari_ozet_alan_duzeni_v1';
const CARI_ESKI = 'gt_cari_ozet_alan_duzeni_cari_v1';

function alanIdMi(v: unknown): v is CariOzetAlanId {
  return typeof v === 'string' && TUM_IDLER.has(v as CariOzetAlanId);
}

function yaziAgirlikMu(v: unknown): v is CariOzetYaziAgirlik {
  return v === 'ince' || v === 'normal' || v === 'kalin';
}

function yaziBoyutMu(v: unknown): v is CariOzetYaziBoyut {
  return v === 'kucuk' || v === 'orta' || v === 'buyuk';
}

export function cariOzetGorunumDuzelt(ham: unknown): CariOzetGorunum {
  const v = ham && typeof ham === 'object' ? (ham as Record<string, unknown>) : {};
  return {
    etiketAgirlik: yaziAgirlikMu(v.etiketAgirlik)
      ? v.etiketAgirlik
      : CARI_OZET_GORUNUM_VARSAYILAN.etiketAgirlik,
    etiketBoyut: yaziBoyutMu(v.etiketBoyut) ? v.etiketBoyut : CARI_OZET_GORUNUM_VARSAYILAN.etiketBoyut,
    etiketBuyukHarf:
      typeof v.etiketBuyukHarf === 'boolean'
        ? v.etiketBuyukHarf
        : CARI_OZET_GORUNUM_VARSAYILAN.etiketBuyukHarf,
    degerAgirlik: yaziAgirlikMu(v.degerAgirlik)
      ? v.degerAgirlik
      : CARI_OZET_GORUNUM_VARSAYILAN.degerAgirlik,
    degerBoyut: yaziBoyutMu(v.degerBoyut) ? v.degerBoyut : CARI_OZET_GORUNUM_VARSAYILAN.degerBoyut,
    ozetBaslangicAcik:
      typeof v.ozetBaslangicAcik === 'boolean'
        ? v.ozetBaslangicAcik
        : CARI_OZET_GORUNUM_VARSAYILAN.ozetBaslangicAcik,
    bosAlanGoster:
      typeof v.bosAlanGoster === 'boolean'
        ? v.bosAlanGoster
        : CARI_OZET_GORUNUM_VARSAYILAN.bosAlanGoster,
  };
}

function duzenKopyala(d: CariOzetAlanDuzeni): CariOzetAlanDuzeni {
  return {
    kutuBoyutu: d.kutuBoyutu ?? 'normal',
    gorunum: cariOzetGorunumDuzelt(d.gorunum),
    satirlar: d.satirlar.map((s) => [...s]),
  };
}

function satirlarla(duzen: CariOzetAlanDuzeni, satirlar: CariOzetAlanId[][]): CariOzetAlanDuzeni {
  return {
    kutuBoyutu: duzen.kutuBoyutu ?? 'normal',
    gorunum: cariOzetGorunumDuzelt(duzen.gorunum),
    satirlar,
  };
}

function kutuBoyutuMu(v: unknown): v is CariOzetKutuBoyutu {
  return v === 'kompakt' || v === 'normal' || v === 'genis';
}

function duzListeyiSatirlara(alanlar: CariOzetAlanId[]): CariOzetAlanId[][] {
  const satirlar: CariOzetAlanId[][] = [];
  for (let i = 0; i < alanlar.length; i += CARI_OZET_SATIR_SUTUN_MAX) {
    satirlar.push(alanlar.slice(i, i + CARI_OZET_SATIR_SUTUN_MAX));
  }
  return satirlar;
}

export function cariOzetAlanDuzeniDuzelt(ham: unknown): CariOzetAlanDuzeni {
  if (!ham || typeof ham !== 'object') return duzenKopyala(CARI_OZET_ALAN_VARSAYILAN);

  const obj = ham as {
    satirlar?: unknown;
    alanlar?: unknown;
    kutuBoyutu?: unknown;
    gorunum?: unknown;
  };
  const kutuBoyutu: CariOzetKutuBoyutu = kutuBoyutuMu(obj.kutuBoyutu)
    ? obj.kutuBoyutu
    : 'normal';
  const gorunum = cariOzetGorunumDuzelt(obj.gorunum);
  const gorulen = new Set<CariOzetAlanId>();
  const satirlar: CariOzetAlanId[][] = [];

  if (Array.isArray(obj.satirlar)) {
    for (const satirHam of obj.satirlar) {
      if (!Array.isArray(satirHam)) continue;
      const satir: CariOzetAlanId[] = [];
      for (const v of satirHam) {
        if (!alanIdMi(v) || gorulen.has(v)) continue;
        if (satir.length >= CARI_OZET_SATIR_SUTUN_MAX) break;
        gorulen.add(v);
        satir.push(v);
      }
      if (satir.length > 0) satirlar.push(satir);
    }
    return { kutuBoyutu, gorunum, satirlar };
  }

  /* v1 düz liste → satırlara böl */
  if (Array.isArray(obj.alanlar)) {
    const alanlar: CariOzetAlanId[] = [];
    for (const v of obj.alanlar) {
      if (!alanIdMi(v) || gorulen.has(v)) continue;
      gorulen.add(v);
      alanlar.push(v);
    }
    return { kutuBoyutu, gorunum, satirlar: duzListeyiSatirlara(alanlar) };
  }

  return duzenKopyala(CARI_OZET_ALAN_VARSAYILAN);
}

export function cariOzetAlanToplam(duzen: CariOzetAlanDuzeni): number {
  return duzen.satirlar.reduce((t, s) => t + s.length, 0);
}

export function cariOzetAlanKullanilan(duzen: CariOzetAlanDuzeni): Set<CariOzetAlanId> {
  const set = new Set<CariOzetAlanId>();
  for (const satir of duzen.satirlar) {
    for (const id of satir) set.add(id);
  }
  return set;
}

export function cariOzetAlanHavuz(duzen: CariOzetAlanDuzeni): CariOzetAlanId[] {
  const kullanilan = cariOzetAlanKullanilan(duzen);
  return CARI_OZET_ALANLARI.filter((a) => !kullanilan.has(a.id)).map((a) => a.id);
}

export function cariOzetBosSatirEkle(
  duzen: CariOzetAlanDuzeni,
  sutun: number
): { duzen: CariOzetAlanDuzeni; satirIndeks: number; sutun: number } {
  const kalan = CARI_OZET_ALAN_MAX - cariOzetAlanToplam(duzen);
  if (kalan <= 0) return { duzen, satirIndeks: -1, sutun: 0 };
  const gercek = Math.max(1, Math.min(CARI_OZET_SATIR_SUTUN_MAX, sutun, kalan));
  const satirlar = [...duzen.satirlar, []];
  return {
    duzen: satirlarla(duzen, satirlar),
    satirIndeks: satirlar.length - 1,
    sutun: gercek,
  };
}

export function cariOzetAlanSatiraEkle(
  duzen: CariOzetAlanDuzeni,
  satirIndeks: number,
  id: CariOzetAlanId,
  sutunKapasite: number
): CariOzetAlanDuzeni {
  if (cariOzetAlanKullanilan(duzen).has(id)) return duzen;
  if (cariOzetAlanToplam(duzen) >= CARI_OZET_ALAN_MAX) return duzen;
  const satirlar = duzen.satirlar.map((s) => [...s]);
  const satir = satirlar[satirIndeks];
  if (!satir) return duzen;
  const kapasite = Math.max(1, Math.min(CARI_OZET_SATIR_SUTUN_MAX, sutunKapasite));
  if (satir.length >= kapasite) return duzen;
  satir.push(id);
  return satirlarla(duzen, satirlar);
}

export function cariOzetAlanCikar(
  duzen: CariOzetAlanDuzeni,
  satirIndeks: number,
  slotIndeks: number
): CariOzetAlanDuzeni {
  const satirlar = duzen.satirlar.map((s) => [...s]);
  const satir = satirlar[satirIndeks];
  if (!satir || slotIndeks < 0 || slotIndeks >= satir.length) return duzen;
  satir.splice(slotIndeks, 1);
  return satirlarla(duzen, satirlar);
}

export function cariOzetSatirSil(duzen: CariOzetAlanDuzeni, satirIndeks: number): CariOzetAlanDuzeni {
  if (satirIndeks < 0 || satirIndeks >= duzen.satirlar.length) return duzen;
  return satirlarla(
    duzen,
    duzen.satirlar.filter((_, i) => i !== satirIndeks)
  );
}

export function cariOzetSatirTasi(
  duzen: CariOzetAlanDuzeni,
  from: number,
  to: number
): CariOzetAlanDuzeni {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= duzen.satirlar.length ||
    to >= duzen.satirlar.length
  ) {
    return duzen;
  }
  const satirlar = [...duzen.satirlar];
  const [oge] = satirlar.splice(from, 1);
  satirlar.splice(to, 0, oge);
  return satirlarla(duzen, satirlar);
}

export function cariOzetAlanSiradaTasi<T>(liste: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= liste.length || to >= liste.length) {
    return liste;
  }
  const kopya = [...liste];
  const [oge] = kopya.splice(from, 1);
  kopya.splice(to, 0, oge);
  return kopya;
}

function eskiDuzeniOku(anahtar: string): CariOzetAlanDuzeni | null {
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return null;
    return cariOzetAlanDuzeniDuzelt(JSON.parse(ham));
  } catch {
    return null;
  }
}

function globalOku(): CariOzetAlanDuzeni {
  try {
    const ham = localStorage.getItem(GLOBAL_ANAHTAR);
    if (ham) return cariOzetAlanDuzeniDuzelt(JSON.parse(ham));
  } catch {
    /* yoksay */
  }
  const eski = eskiDuzeniOku(GLOBAL_ESKI);
  if (eski) return eski;
  return duzenKopyala(CARI_OZET_ALAN_VARSAYILAN);
}

function cariHaritaOku(): Record<string, CariOzetAlanDuzeni> {
  const sonuc: Record<string, CariOzetAlanDuzeni> = {};
  try {
    const ham = localStorage.getItem(CARI_ANAHTAR);
    if (ham) {
      const parse = JSON.parse(ham) as unknown;
      if (parse && typeof parse === 'object' && !Array.isArray(parse)) {
        for (const [cariId, deger] of Object.entries(parse as Record<string, unknown>)) {
          const temiz = cariOzetAlanDuzeniDuzelt(deger);
          if (temiz.satirlar.length > 0) sonuc[cariId] = temiz;
        }
      }
    }
  } catch {
    /* yoksay */
  }
  /* v1: cariId → alanlar[] */
  try {
    const eskiHam = localStorage.getItem(CARI_ESKI);
    if (eskiHam) {
      const parse = JSON.parse(eskiHam) as unknown;
      if (parse && typeof parse === 'object' && !Array.isArray(parse)) {
        for (const [cariId, deger] of Object.entries(parse as Record<string, unknown>)) {
          if (sonuc[cariId]) continue;
          const temiz = cariOzetAlanDuzeniDuzelt({ alanlar: deger });
          if (temiz.satirlar.length > 0) sonuc[cariId] = temiz;
        }
      }
    }
  } catch {
    /* yoksay */
  }
  return sonuc;
}

export function cariOzetAlanDuzeniOku(cariId?: string | null): CariOzetAlanDuzeni {
  if (cariId) {
    const ozel = cariHaritaOku()[cariId];
    if (ozel) return duzenKopyala(ozel);
  }
  return globalOku();
}

export function cariOzetAlanDuzeniGlobalKaydet(duzen: CariOzetAlanDuzeni): CariOzetAlanDuzeni {
  const temiz = cariOzetAlanDuzeniDuzelt(duzen);
  localStorage.setItem(GLOBAL_ANAHTAR, JSON.stringify(temiz));
  return temiz;
}

export function cariOzetAlanDuzeniCariKaydet(
  cariId: string,
  duzen: CariOzetAlanDuzeni
): CariOzetAlanDuzeni {
  const temiz = cariOzetAlanDuzeniDuzelt(duzen);
  const harita = cariHaritaOku();
  harita[cariId] = temiz;
  localStorage.setItem(CARI_ANAHTAR, JSON.stringify(harita));
  return temiz;
}

export function cariOzetAlanDuzeniCariSil(cariId: string): void {
  const harita = cariHaritaOku();
  if (!(cariId in harita)) return;
  delete harita[cariId];
  localStorage.setItem(CARI_ANAHTAR, JSON.stringify(harita));
}

export function cariOzetAlanTanimBul(id: CariOzetAlanId): CariOzetAlanTanim {
  return CARI_OZET_ALANLARI.find((a) => a.id === id) ?? { id, etiket: id };
}
