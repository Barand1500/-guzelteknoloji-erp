/** Belge formu — cari alanlarının üst/alt yerleşimi */

export type BelgeCariAlanId =
  | 'cariTipi'
  | 'kimlik'
  | 'efatura'
  | 'eirsaliye'
  | 'alisFiyat'
  | 'satisFiyat'
  | 'tabelaAdi'
  | 'unvan'
  | 'adres'
  | 'telefon'
  | 'gsm'
  | 'eposta'
  | 'web';

export type BelgeCariAlanBolum = 'ust' | 'alt';

export interface BelgeCariAlanTanim {
  id: BelgeCariAlanId;
  etiket: string;
}

/** Alt satır sütun sayıları — örn. [2,4,2] veya [1,2,4,1] */
export type BelgeCariAltSatirlar = number[];

export interface BelgeCariAlanDuzeni {
  ust: BelgeCariAlanId[];
  alt: BelgeCariAlanId[];
  /** Alt alanların satır düzeni (her eleman o satırdaki sütun sayısı) */
  altSatirlar: BelgeCariAltSatirlar;
}

export interface BelgeCariAltDuzenSecenek {
  id: string;
  satirlar: BelgeCariAltSatirlar;
  etiket: string;
  aciklama: string;
}

/** Satır başına en fazla 4 sütun — alanlar daralıp bozulmasın */
export const BELGE_CARI_ALT_SATIR_SUTUN_MAX = 4;
/** En fazla 4 satır — dikey alan şişmesin */
export const BELGE_CARI_ALT_SATIR_MAX = 4;
export const BELGE_CARI_ALAN_UST_MAX = 5;
/** Mutlak tavan; gerçek alt kapasite = sum(altSatirlar) */
export const BELGE_CARI_ALAN_ALT_MAX = 8;

export const BELGE_CARI_ALT_DUZEN_VARSAYILAN: BelgeCariAltSatirlar = [2, 4, 2];

/** Hazır alt düzenleri — toplam her zaman ≤ ALT_MAX */
export const BELGE_CARI_ALT_DUZEN_SECENEKLERI: BelgeCariAltDuzenSecenek[] = [
  { id: '2-4-2', satirlar: [2, 4, 2], etiket: '2 · 4 · 2', aciklama: 'Klasik' },
  { id: '4-4', satirlar: [4, 4], etiket: '4 · 4', aciklama: 'İki sıra' },
  { id: '4-2-2', satirlar: [4, 2, 2], etiket: '4 · 2 · 2', aciklama: 'Geniş üst' },
  { id: '1-2-4-1', satirlar: [1, 2, 4, 1], etiket: '1 · 2 · 4 · 1', aciklama: 'Vurgu' },
  { id: '3-3-2', satirlar: [3, 3, 2], etiket: '3 · 3 · 2', aciklama: 'Orta' },
];

export const BELGE_CARI_ALANLARI: BelgeCariAlanTanim[] = [
  { id: 'cariTipi', etiket: 'Cari Tipi / İşletme' },
  { id: 'kimlik', etiket: 'Vergi / TC / Pasaport' },
  { id: 'efatura', etiket: 'E-Fatura' },
  { id: 'eirsaliye', etiket: 'E-İrsaliye' },
  { id: 'alisFiyat', etiket: 'Alış Fiyat Tanımı' },
  { id: 'satisFiyat', etiket: 'Satış Fiyat Tanımı' },
  { id: 'tabelaAdi', etiket: 'Tabela Adı' },
  { id: 'unvan', etiket: 'Ünvan' },
  { id: 'adres', etiket: 'Adres' },
  { id: 'telefon', etiket: 'Telefon' },
  { id: 'gsm', etiket: 'GSM' },
  { id: 'eposta', etiket: 'E-Posta' },
  { id: 'web', etiket: 'Web' },
];

export const BELGE_CARI_ALAN_ETIKET: Record<BelgeCariAlanId, string> = Object.fromEntries(
  BELGE_CARI_ALANLARI.map((a) => [a.id, a.etiket])
) as Record<BelgeCariAlanId, string>;

export const BELGE_CARI_ALAN_VARSAYILAN: BelgeCariAlanDuzeni = {
  ust: ['cariTipi', 'kimlik', 'efatura', 'eirsaliye', 'alisFiyat'],
  alt: ['tabelaAdi', 'unvan', 'adres', 'telefon', 'gsm', 'eposta', 'web', 'satisFiyat'],
  altSatirlar: [...BELGE_CARI_ALT_DUZEN_VARSAYILAN],
};

export const BELGE_CARI_ALAN_BOS: BelgeCariAlanDuzeni = {
  ust: [],
  alt: [],
  altSatirlar: [...BELGE_CARI_ALT_DUZEN_VARSAYILAN],
};

const DEPOLAMA_ANAHTARI = 'gt_belge_cari_alan_duzeni_v3';
const DEPOLAMA_ESKI = ['gt_belge_cari_alan_duzeni_v2', 'gt_belge_cari_alan_duzeni_v1'] as const;

const TUM_IDLER = new Set(BELGE_CARI_ALANLARI.map((a) => a.id));

function diziMi(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function alanIdMi(v: unknown): v is BelgeCariAlanId {
  return typeof v === 'string' && TUM_IDLER.has(v as BelgeCariAlanId);
}

export function belgeCariAltKapasite(satirlar: BelgeCariAltSatirlar): number {
  return satirlar.reduce((t, n) => t + n, 0);
}

/** Satır düzenini güvenli hale getirir (1–4 sütun, max 4 satır, toplam ≤ ALT_MAX). */
export function belgeCariAltSatirlariDuzelt(ham: unknown): BelgeCariAltSatirlar {
  if (!diziMi(ham) || ham.length === 0) {
    return [...BELGE_CARI_ALT_DUZEN_VARSAYILAN];
  }
  const temiz: number[] = [];
  let toplam = 0;
  for (const v of ham) {
    if (temiz.length >= BELGE_CARI_ALT_SATIR_MAX) break;
    const n = typeof v === 'number' ? Math.floor(v) : Number(v);
    if (!Number.isFinite(n) || n < 1) continue;
    const sutun = Math.min(BELGE_CARI_ALT_SATIR_SUTUN_MAX, n);
    if (toplam + sutun > BELGE_CARI_ALAN_ALT_MAX) break;
    temiz.push(sutun);
    toplam += sutun;
  }
  return temiz.length > 0 ? temiz : [...BELGE_CARI_ALT_DUZEN_VARSAYILAN];
}

export function belgeCariAltDuzenId(satirlar: BelgeCariAltSatirlar): string {
  return satirlar.join('-');
}

export function belgeCariAltSatirlariBol(
  alt: BelgeCariAlanId[],
  satirlar: BelgeCariAltSatirlar
): BelgeCariAlanId[][] {
  const sonuc: BelgeCariAlanId[][] = [];
  let i = 0;
  for (const n of satirlar) {
    if (i >= alt.length) break;
    sonuc.push(alt.slice(i, i + n));
    i += n;
  }
  return sonuc;
}

/** Eksik alanları doldurmaz — boş düzen geçerli; kapasiteyi aşmaz. */
function duzeniDuzelt(ham: BelgeCariAlanDuzeni): BelgeCariAlanDuzeni {
  const altSatirlar = belgeCariAltSatirlariDuzelt(ham.altSatirlar);
  const altMax = belgeCariAltKapasite(altSatirlar);
  const ust: BelgeCariAlanId[] = [];
  const alt: BelgeCariAlanId[] = [];
  const kullanilan = new Set<BelgeCariAlanId>();

  for (const id of ham.ust) {
    if (!alanIdMi(id) || kullanilan.has(id) || ust.length >= BELGE_CARI_ALAN_UST_MAX) continue;
    ust.push(id);
    kullanilan.add(id);
  }
  for (const id of ham.alt) {
    if (!alanIdMi(id) || kullanilan.has(id) || alt.length >= altMax) continue;
    alt.push(id);
    kullanilan.add(id);
  }

  return { ust, alt, altSatirlar };
}

export function belgeCariAlanHavuz(duzen: BelgeCariAlanDuzeni): BelgeCariAlanId[] {
  const kullanilan = new Set([...duzen.ust, ...duzen.alt]);
  return BELGE_CARI_ALANLARI.map((a) => a.id).filter((id) => !kullanilan.has(id));
}

function depodanOku(): BelgeCariAlanDuzeni | null {
  const anahtarlar = [DEPOLAMA_ANAHTARI, ...DEPOLAMA_ESKI];
  for (const anahtar of anahtarlar) {
    try {
      const ham = localStorage.getItem(anahtar);
      if (!ham) continue;
      const json = JSON.parse(ham) as { ust?: unknown; alt?: unknown; altSatirlar?: unknown };
      if (!diziMi(json.ust) || !diziMi(json.alt)) continue;
      return duzeniDuzelt({
        ust: json.ust.filter(alanIdMi),
        alt: json.alt.filter(alanIdMi),
        altSatirlar: belgeCariAltSatirlariDuzelt(json.altSatirlar),
      });
    } catch {
      /* sonraki anahtar */
    }
  }
  return null;
}

export function belgeCariAlanDuzeniOku(): BelgeCariAlanDuzeni {
  return (
    depodanOku() ?? {
      ust: [...BELGE_CARI_ALAN_VARSAYILAN.ust],
      alt: [...BELGE_CARI_ALAN_VARSAYILAN.alt],
      altSatirlar: [...BELGE_CARI_ALT_DUZEN_VARSAYILAN],
    }
  );
}

export function belgeCariAlanDuzeniKaydet(duzen: BelgeCariAlanDuzeni) {
  const temiz = duzeniDuzelt(duzen);
  try {
    localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(temiz));
  } catch {
    /* depolama kapalı */
  }
  return temiz;
}

/** Alt satır düzenini değiştir; fazla alanları havuza düşürür. */
export function belgeCariAltDuzenDegistir(
  duzen: BelgeCariAlanDuzeni,
  satirlar: BelgeCariAltSatirlar
): BelgeCariAlanDuzeni {
  const altSatirlar = belgeCariAltSatirlariDuzelt(satirlar);
  const max = belgeCariAltKapasite(altSatirlar);
  return {
    ...duzen,
    altSatirlar,
    alt: duzen.alt.slice(0, max),
  };
}

export function belgeCariAlanSiradaTasi(
  liste: BelgeCariAlanId[],
  from: number,
  to: number
): BelgeCariAlanId[] {
  if (from < 0 || to < 0 || from >= liste.length || to >= liste.length || from === to) {
    return liste;
  }
  const kopya = [...liste];
  const [oge] = kopya.splice(from, 1);
  if (!oge) return liste;
  kopya.splice(to, 0, oge);
  return kopya;
}

export function belgeCariAlanCikar(
  duzen: BelgeCariAlanDuzeni,
  bolum: BelgeCariAlanBolum,
  indeks: number
): BelgeCariAlanDuzeni {
  const liste = [...duzen[bolum]];
  if (indeks < 0 || indeks >= liste.length) return duzen;
  liste.splice(indeks, 1);
  return { ...duzen, [bolum]: liste };
}

export function belgeCariAlanEkle(
  duzen: BelgeCariAlanDuzeni,
  bolum: BelgeCariAlanBolum,
  id: BelgeCariAlanId,
  indeks?: number
): BelgeCariAlanDuzeni {
  const max =
    bolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : belgeCariAltKapasite(duzen.altSatirlar);
  if (duzen[bolum].length >= max) return duzen;
  if (duzen.ust.includes(id) || duzen.alt.includes(id)) return duzen;
  const liste = [...duzen[bolum]];
  const yer = indeks == null ? liste.length : Math.max(0, Math.min(indeks, liste.length));
  liste.splice(yer, 0, id);
  return { ...duzen, [bolum]: liste };
}

/** Aynı bölümde sırala; farklı bölümde taşı (kapasite doluysa takas). */
export function belgeCariAlanTakas(
  duzen: BelgeCariAlanDuzeni,
  kaynakBolum: BelgeCariAlanBolum,
  kaynakIndeks: number,
  hedefBolum: BelgeCariAlanBolum,
  hedefIndeks: number
): BelgeCariAlanDuzeni {
  if (kaynakBolum === hedefBolum) {
    const liste = belgeCariAlanSiradaTasi(duzen[kaynakBolum], kaynakIndeks, hedefIndeks);
    return { ...duzen, [kaynakBolum]: liste };
  }

  const kaynak = [...duzen[kaynakBolum]];
  const hedef = [...duzen[hedefBolum]];
  const a = kaynak[kaynakIndeks];
  if (!a) return duzen;

  const maxHedef =
    hedefBolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : belgeCariAltKapasite(duzen.altSatirlar);
  const b = hedef[hedefIndeks];

  if (b) {
    kaynak[kaynakIndeks] = b;
    hedef[hedefIndeks] = a;
    return { ...duzen, ust: kaynakBolum === 'ust' ? kaynak : hedef, alt: kaynakBolum === 'alt' ? kaynak : hedef };
  }

  if (hedef.length >= maxHedef) return duzen;
  kaynak.splice(kaynakIndeks, 1);
  const yer = Math.max(0, Math.min(hedefIndeks, hedef.length));
  hedef.splice(yer, 0, a);
  return { ...duzen, ust: kaynakBolum === 'ust' ? kaynak : hedef, alt: kaynakBolum === 'alt' ? kaynak : hedef };
}
