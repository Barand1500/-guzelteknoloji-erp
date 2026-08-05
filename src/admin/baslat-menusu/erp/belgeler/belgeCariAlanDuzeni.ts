/** Belge formu — cari alanları: üst (yan yana) + alt (serbest satırlar) */

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

export type BelgeCariAlanHedef = 'ust' | 'alt';

export interface BelgeCariAlanTanim {
  id: BelgeCariAlanId;
  etiket: string;
}

export interface BelgeCariAlanDuzeni {
  /** Cari kodunun yanında yan yana */
  ust: BelgeCariAlanId[];
  /** Açılır detaydaki satır düzeni */
  satirlar: BelgeCariAlanId[][];
}

export const BELGE_CARI_SATIR_SUTUN_MAX = 6;
export const BELGE_CARI_ALAN_UST_MAX = 5;
export const BELGE_CARI_ALAN_ALT_MAX = 8;

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
  satirlar: [['tabelaAdi'], ['unvan'], ['adres'], ['telefon', 'gsm']],
};

export const BELGE_CARI_ALAN_BOS: BelgeCariAlanDuzeni = {
  ust: [],
  satirlar: [],
};

const DEPOLAMA_ANAHTARI = 'gt_belge_cari_alan_duzeni_v5';
const DEPOLAMA_ESKI = [
  'gt_belge_cari_alan_duzeni_v4',
  'gt_belge_cari_alan_duzeni_v3',
  'gt_belge_cari_alan_duzeni_v2',
  'gt_belge_cari_alan_duzeni_v1',
] as const;

const TUM_IDLER = new Set(BELGE_CARI_ALANLARI.map((a) => a.id));

function diziMi(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function alanIdMi(v: unknown): v is BelgeCariAlanId {
  return typeof v === 'string' && TUM_IDLER.has(v as BelgeCariAlanId);
}

export function belgeCariAltToplam(duzen: BelgeCariAlanDuzeni): number {
  return duzen.satirlar.reduce((t, s) => t + s.length, 0);
}

export function belgeCariAlanToplam(duzen: BelgeCariAlanDuzeni): number {
  return duzen.ust.length + belgeCariAltToplam(duzen);
}

export function belgeCariAlanKullanilan(duzen: BelgeCariAlanDuzeni): Set<BelgeCariAlanId> {
  const set = new Set<BelgeCariAlanId>(duzen.ust);
  for (const satir of duzen.satirlar) {
    for (const id of satir) set.add(id);
  }
  return set;
}

export function belgeCariAlanHavuz(duzen: BelgeCariAlanDuzeni): BelgeCariAlanId[] {
  const kullanilan = belgeCariAlanKullanilan(duzen);
  return BELGE_CARI_ALANLARI.map((a) => a.id).filter((id) => !kullanilan.has(id));
}

function ustDuzelt(ham: unknown, kullanilan: Set<BelgeCariAlanId>): BelgeCariAlanId[] {
  if (!diziMi(ham)) return [];
  const ust: BelgeCariAlanId[] = [];
  for (const v of ham) {
    if (!alanIdMi(v) || kullanilan.has(v) || ust.length >= BELGE_CARI_ALAN_UST_MAX) continue;
    ust.push(v);
    kullanilan.add(v);
  }
  return ust;
}

/** Alt satırları güvenli hale getirir. Boş satırlar düşer. */
export function belgeCariSatirlariDuzelt(
  ham: unknown,
  kullanilan?: Set<BelgeCariAlanId>
): BelgeCariAlanId[][] {
  if (!diziMi(ham)) return [];
  const kullan = kullanilan ?? new Set<BelgeCariAlanId>();
  const sonuc: BelgeCariAlanId[][] = [];
  let toplam = 0;

  for (const satirHam of ham) {
    if (!diziMi(satirHam) || toplam >= BELGE_CARI_ALAN_ALT_MAX) continue;
    const satir: BelgeCariAlanId[] = [];
    for (const v of satirHam) {
      if (satir.length >= BELGE_CARI_SATIR_SUTUN_MAX) break;
      if (toplam >= BELGE_CARI_ALAN_ALT_MAX) break;
      if (!alanIdMi(v) || kullan.has(v)) continue;
      satir.push(v);
      kullan.add(v);
      toplam += 1;
    }
    if (satir.length > 0) sonuc.push(satir);
  }
  return sonuc;
}

function duzeniDuzelt(ham: BelgeCariAlanDuzeni): BelgeCariAlanDuzeni {
  const kullanilan = new Set<BelgeCariAlanId>();
  const ust = ustDuzelt(ham.ust, kullanilan);
  const satirlar = belgeCariSatirlariDuzelt(ham.satirlar, kullanilan);
  return { ust, satirlar };
}

function eskiDuzeniMigrate(json: {
  ust?: unknown;
  alt?: unknown;
  altSatirlar?: unknown;
  satirlar?: unknown;
}): BelgeCariAlanDuzeni | null {
  /* v4: sadece satirlar — üst boş */
  if (diziMi(json.satirlar) && !diziMi(json.ust) && !diziMi(json.alt)) {
    return duzeniDuzelt({ ust: [], satirlar: json.satirlar as BelgeCariAlanId[][] });
  }
  /* v5 veya v4+ust */
  if (diziMi(json.satirlar)) {
    return duzeniDuzelt({
      ust: diziMi(json.ust) ? (json.ust as BelgeCariAlanId[]) : [],
      satirlar: json.satirlar as BelgeCariAlanId[][],
    });
  }
  if (!diziMi(json.ust) && !diziMi(json.alt)) return null;

  const kullanilan = new Set<BelgeCariAlanId>();
  const ust = ustDuzelt(json.ust, kullanilan);

  const altHam = diziMi(json.alt) ? json.alt.filter(alanIdMi) : [];
  const altSatirlarHam = diziMi(json.altSatirlar)
    ? json.altSatirlar
        .map((n) => (typeof n === 'number' ? Math.floor(n) : Number(n)))
        .filter((n) => Number.isFinite(n) && n >= 1)
        .map((n) => Math.min(BELGE_CARI_SATIR_SUTUN_MAX, n))
    : [];

  const satirlar: BelgeCariAlanId[][] = [];
  let toplam = 0;
  let i = 0;

  if (altSatirlarHam.length > 0) {
    for (const n of altSatirlarHam) {
      if (toplam >= BELGE_CARI_ALAN_ALT_MAX) break;
      const satir: BelgeCariAlanId[] = [];
      while (satir.length < n && i < altHam.length && toplam < BELGE_CARI_ALAN_ALT_MAX) {
        const id = altHam[i++]!;
        if (kullanilan.has(id)) continue;
        satir.push(id);
        kullanilan.add(id);
        toplam += 1;
      }
      if (satir.length > 0) satirlar.push(satir);
    }
  }
  while (i < altHam.length && toplam < BELGE_CARI_ALAN_ALT_MAX) {
    const id = altHam[i++]!;
    if (kullanilan.has(id)) continue;
    satirlar.push([id]);
    kullanilan.add(id);
    toplam += 1;
  }

  return duzeniDuzelt({ ust, satirlar });
}

function depodanOku(): BelgeCariAlanDuzeni | null {
  const anahtarlar = [DEPOLAMA_ANAHTARI, ...DEPOLAMA_ESKI];
  for (const anahtar of anahtarlar) {
    try {
      const ham = localStorage.getItem(anahtar);
      if (!ham) continue;
      const json = JSON.parse(ham) as {
        ust?: unknown;
        alt?: unknown;
        altSatirlar?: unknown;
        satirlar?: unknown;
      };
      const migrate = eskiDuzeniMigrate(json);
      if (migrate) return migrate;
    } catch {
      /* sonraki */
    }
  }
  return null;
}

function kopyaDuzen(d: BelgeCariAlanDuzeni): BelgeCariAlanDuzeni {
  return {
    ust: [...d.ust],
    satirlar: d.satirlar.map((s) => [...s]),
  };
}

export function belgeCariAlanDuzeniOku(): BelgeCariAlanDuzeni {
  return depodanOku() ?? kopyaDuzen(BELGE_CARI_ALAN_VARSAYILAN);
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

export function belgeCariUsteEkle(
  duzen: BelgeCariAlanDuzeni,
  id: BelgeCariAlanId
): BelgeCariAlanDuzeni {
  if (!alanIdMi(id)) return duzen;
  if (belgeCariAlanKullanilan(duzen).has(id)) return duzen;
  if (duzen.ust.length >= BELGE_CARI_ALAN_UST_MAX) return duzen;
  return { ...duzen, ust: [...duzen.ust, id] };
}

export function belgeCariUstenCikar(
  duzen: BelgeCariAlanDuzeni,
  indeks: number
): BelgeCariAlanDuzeni {
  if (indeks < 0 || indeks >= duzen.ust.length) return duzen;
  const ust = [...duzen.ust];
  ust.splice(indeks, 1);
  return { ...duzen, ust };
}

export function belgeCariUstSirala(
  duzen: BelgeCariAlanDuzeni,
  from: number,
  to: number
): BelgeCariAlanDuzeni {
  if (from < 0 || to < 0 || from >= duzen.ust.length || to >= duzen.ust.length || from === to) {
    return duzen;
  }
  const ust = [...duzen.ust];
  const [oge] = ust.splice(from, 1);
  if (!oge) return duzen;
  ust.splice(to, 0, oge);
  return { ...duzen, ust };
}

export function belgeCariBosSatirEkle(
  duzen: BelgeCariAlanDuzeni,
  sutunSayisi: number
): { duzen: BelgeCariAlanDuzeni; satirIndeks: number; sutun: number } {
  const kalan = BELGE_CARI_ALAN_ALT_MAX - belgeCariAltToplam(duzen);
  if (kalan <= 0) {
    return { duzen, satirIndeks: -1, sutun: 0 };
  }
  const sutun = Math.min(
    BELGE_CARI_SATIR_SUTUN_MAX,
    Math.max(1, Math.floor(sutunSayisi)),
    kalan
  );
  const satirlar = [...duzen.satirlar, []];
  return {
    duzen: { ...duzen, satirlar },
    satirIndeks: satirlar.length - 1,
    sutun,
  };
}

export function belgeCariSatirSil(
  duzen: BelgeCariAlanDuzeni,
  satirIndeks: number
): BelgeCariAlanDuzeni {
  if (satirIndeks < 0 || satirIndeks >= duzen.satirlar.length) return duzen;
  return { ...duzen, satirlar: duzen.satirlar.filter((_, i) => i !== satirIndeks) };
}

export function belgeCariSatirTasi(
  duzen: BelgeCariAlanDuzeni,
  from: number,
  to: number
): BelgeCariAlanDuzeni {
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
  return { ...duzen, satirlar };
}

export function belgeCariAlanSatiraEkle(
  duzen: BelgeCariAlanDuzeni,
  satirIndeks: number,
  id: BelgeCariAlanId,
  hedefSutun: number
): BelgeCariAlanDuzeni {
  if (!alanIdMi(id)) return duzen;
  if (belgeCariAlanKullanilan(duzen).has(id)) return duzen;
  if (belgeCariAltToplam(duzen) >= BELGE_CARI_ALAN_ALT_MAX) return duzen;
  if (satirIndeks < 0 || satirIndeks >= duzen.satirlar.length) return duzen;

  const maxSutun = Math.min(BELGE_CARI_SATIR_SUTUN_MAX, Math.max(1, hedefSutun));
  const satir = [...(duzen.satirlar[satirIndeks] ?? [])];
  if (satir.length >= maxSutun) return duzen;

  satir.push(id);
  const satirlar = [...duzen.satirlar];
  satirlar[satirIndeks] = satir;
  return { ...duzen, satirlar };
}

export function belgeCariAlanCikar(
  duzen: BelgeCariAlanDuzeni,
  satirIndeks: number,
  slotIndeks: number
): BelgeCariAlanDuzeni {
  if (satirIndeks < 0 || satirIndeks >= duzen.satirlar.length) return duzen;
  const satir = [...(duzen.satirlar[satirIndeks] ?? [])];
  if (slotIndeks < 0 || slotIndeks >= satir.length) return duzen;
  satir.splice(slotIndeks, 1);
  const satirlar = [...duzen.satirlar];
  satirlar[satirIndeks] = satir;
  return { ...duzen, satirlar };
}
