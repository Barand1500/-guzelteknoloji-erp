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

export interface BelgeCariAlanDuzeni {
  ust: BelgeCariAlanId[];
  alt: BelgeCariAlanId[];
}

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

/** Varsayılan: üst 5 + alt 8 */
export const BELGE_CARI_ALAN_VARSAYILAN: BelgeCariAlanDuzeni = {
  ust: ['cariTipi', 'kimlik', 'efatura', 'eirsaliye', 'alisFiyat'],
  alt: ['tabelaAdi', 'unvan', 'adres', 'telefon', 'gsm', 'eposta', 'web', 'satisFiyat'],
};

export const BELGE_CARI_ALAN_BOS: BelgeCariAlanDuzeni = { ust: [], alt: [] };

const DEPOLAMA_ANAHTARI = 'gt_belge_cari_alan_duzeni_v2';

const TUM_IDLER = new Set(BELGE_CARI_ALANLARI.map((a) => a.id));

function diziMi(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function alanIdMi(v: unknown): v is BelgeCariAlanId {
  return typeof v === 'string' && TUM_IDLER.has(v as BelgeCariAlanId);
}

/** Eksik alanları doldurmaz — boş düzen geçerli; kapasiteyi aşmaz. */
function duzeniDuzelt(ham: BelgeCariAlanDuzeni): BelgeCariAlanDuzeni {
  const ust: BelgeCariAlanId[] = [];
  const alt: BelgeCariAlanId[] = [];
  const kullanilan = new Set<BelgeCariAlanId>();

  for (const id of ham.ust) {
    if (!alanIdMi(id) || kullanilan.has(id) || ust.length >= BELGE_CARI_ALAN_UST_MAX) continue;
    ust.push(id);
    kullanilan.add(id);
  }
  for (const id of ham.alt) {
    if (!alanIdMi(id) || kullanilan.has(id) || alt.length >= BELGE_CARI_ALAN_ALT_MAX) continue;
    alt.push(id);
    kullanilan.add(id);
  }

  return { ust, alt };
}

export function belgeCariAlanHavuz(duzen: BelgeCariAlanDuzeni): BelgeCariAlanId[] {
  const kullanilan = new Set([...duzen.ust, ...duzen.alt]);
  return BELGE_CARI_ALANLARI.map((a) => a.id).filter((id) => !kullanilan.has(id));
}

export function belgeCariAlanDuzeniOku(): BelgeCariAlanDuzeni {
  try {
    const ham = localStorage.getItem(DEPOLAMA_ANAHTARI) ?? localStorage.getItem('gt_belge_cari_alan_duzeni_v1');
    if (!ham) {
      return { ust: [...BELGE_CARI_ALAN_VARSAYILAN.ust], alt: [...BELGE_CARI_ALAN_VARSAYILAN.alt] };
    }
    const json = JSON.parse(ham) as { ust?: unknown; alt?: unknown };
    if (!diziMi(json.ust) || !diziMi(json.alt)) {
      return { ust: [...BELGE_CARI_ALAN_VARSAYILAN.ust], alt: [...BELGE_CARI_ALAN_VARSAYILAN.alt] };
    }
    return duzeniDuzelt({
      ust: json.ust.filter(alanIdMi),
      alt: json.alt.filter(alanIdMi),
    });
  } catch {
    return { ust: [...BELGE_CARI_ALAN_VARSAYILAN.ust], alt: [...BELGE_CARI_ALAN_VARSAYILAN.alt] };
  }
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
  const max = bolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : BELGE_CARI_ALAN_ALT_MAX;
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

  const maxHedef = hedefBolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : BELGE_CARI_ALAN_ALT_MAX;
  const b = hedef[hedefIndeks];

  if (b) {
    kaynak[kaynakIndeks] = b;
    hedef[hedefIndeks] = a;
    return { ust: kaynakBolum === 'ust' ? kaynak : hedef, alt: kaynakBolum === 'alt' ? kaynak : hedef };
  }

  if (hedef.length >= maxHedef) return duzen;
  kaynak.splice(kaynakIndeks, 1);
  const yer = Math.max(0, Math.min(hedefIndeks, hedef.length));
  hedef.splice(yer, 0, a);
  return { ust: kaynakBolum === 'ust' ? kaynak : hedef, alt: kaynakBolum === 'alt' ? kaynak : hedef };
}
