/** Belgeler listesi — üst bar + tarih filtre düzeni */

export type ListeTarihDonem =
  | 'HEPSI'
  | 'BUGUN'
  | 'DUN'
  | 'HAFTA'
  | 'GECEN_HAFTA'
  | 'AY'
  | 'GECEN_AY'
  | 'YIL'
  | 'GECEN_YIL'
  | 'SON_7'
  | 'SON_30'
  | 'SON_90'
  | 'ARALIK';

/** Tümü dışında seçilebilir dönemler */
export type ListeTarihDonemSecilebilir = Exclude<ListeTarihDonem, 'HEPSI'>;

/** Liste üst barında sıralanabilir / gizlenebilir bloklar */
export type ListeUstBilesenId = 'ARAMA' | 'TARIH' | 'NEVI';

export interface ListeTarihDonemTanim {
  id: ListeTarihDonemSecilebilir;
  etiket: string;
}

export interface ListeUstBilesenTanim {
  id: ListeUstBilesenId;
  etiket: string;
  aciklama: string;
}

export interface BelgeListeFiltreDuzeni {
  ustBilesenler: ListeUstBilesenId[];
  tarihFiltreleri: ListeTarihDonemSecilebilir[];
}

export const LISTE_TARIH_SECILI_MAX = 5;

export const LISTE_TARIH_HAVUZ: ListeTarihDonemTanim[] = [
  { id: 'BUGUN', etiket: 'Bugün' },
  { id: 'DUN', etiket: 'Dün' },
  { id: 'HAFTA', etiket: 'Bu hafta' },
  { id: 'GECEN_HAFTA', etiket: 'Geçen hafta' },
  { id: 'AY', etiket: 'Bu ay' },
  { id: 'GECEN_AY', etiket: 'Geçen ay' },
  { id: 'YIL', etiket: 'Bu yıl' },
  { id: 'GECEN_YIL', etiket: 'Geçen yıl' },
  { id: 'SON_7', etiket: 'Son 7 gün' },
  { id: 'SON_30', etiket: 'Son 30 gün' },
  { id: 'SON_90', etiket: 'Son 90 gün' },
  { id: 'ARALIK', etiket: 'Tarih aralığı' },
];

export const LISTE_TARIH_ETIKET: Record<ListeTarihDonem, string> = {
  HEPSI: 'Tümü',
  BUGUN: 'Bugün',
  DUN: 'Dün',
  HAFTA: 'Bu hafta',
  GECEN_HAFTA: 'Geçen hafta',
  AY: 'Bu ay',
  GECEN_AY: 'Geçen ay',
  YIL: 'Bu yıl',
  GECEN_YIL: 'Geçen yıl',
  SON_7: 'Son 7 gün',
  SON_30: 'Son 30 gün',
  SON_90: 'Son 90 gün',
  ARALIK: 'Tarih aralığı',
};

export const LISTE_UST_BILESEN_HAVUZ: ListeUstBilesenTanim[] = [
  { id: 'ARAMA', etiket: 'Arama', aciklama: 'Belge no, cari, nevi arama kutusu' },
  { id: 'TARIH', etiket: 'Tarih filtreleri', aciklama: 'Tümü / Bugün / Bu ay…' },
  { id: 'NEVI', etiket: 'Belge nevi sekmeleri', aciklama: 'Hepsi, alış / satış faturası…' },
];

export const LISTE_UST_BILESEN_ETIKET: Record<ListeUstBilesenId, string> = {
  ARAMA: 'Arama',
  TARIH: 'Tarih filtreleri',
  NEVI: 'Belge nevi sekmeleri',
};

/** Varsayılan görünür 5’li (havuzun tamamı değil) */
export const LISTE_TARIH_VARSAYILAN: ListeTarihDonemSecilebilir[] = [
  'BUGUN',
  'HAFTA',
  'AY',
  'YIL',
  'ARALIK',
];

export const LISTE_UST_BILESEN_VARSAYILAN: ListeUstBilesenId[] = ['ARAMA', 'TARIH', 'NEVI'];

export const LISTE_FILTRE_VARSAYILAN: BelgeListeFiltreDuzeni = {
  ustBilesenler: [...LISTE_UST_BILESEN_VARSAYILAN],
  tarihFiltreleri: [...LISTE_TARIH_VARSAYILAN],
};

const DEPOLAMA = 'gt_belge_liste_filtre_duzeni_v2';
/** Eski yalnızca tarih dizisi */
const DEPOLAMA_ESKI = 'gt_belge_liste_tarih_filtre_v1';

const TARIH_SET = new Set(LISTE_TARIH_HAVUZ.map((d) => d.id));
const UST_SET = new Set(LISTE_UST_BILESEN_HAVUZ.map((d) => d.id));

function tarihIdMi(v: unknown): v is ListeTarihDonemSecilebilir {
  return typeof v === 'string' && TARIH_SET.has(v as ListeTarihDonemSecilebilir);
}

function ustIdMi(v: unknown): v is ListeUstBilesenId {
  return typeof v === 'string' && UST_SET.has(v as ListeUstBilesenId);
}

export function belgeListeTarihFiltreDuzelt(ham: unknown): ListeTarihDonemSecilebilir[] {
  if (!Array.isArray(ham)) return [...LISTE_TARIH_VARSAYILAN];
  const temiz: ListeTarihDonemSecilebilir[] = [];
  const kullanilan = new Set<ListeTarihDonemSecilebilir>();
  for (const v of ham) {
    if (!tarihIdMi(v) || kullanilan.has(v) || temiz.length >= LISTE_TARIH_SECILI_MAX) continue;
    temiz.push(v);
    kullanilan.add(v);
  }
  return temiz.length > 0 ? temiz : [...LISTE_TARIH_VARSAYILAN];
}

export function belgeListeUstBilesenDuzelt(ham: unknown): ListeUstBilesenId[] {
  if (!Array.isArray(ham)) return [...LISTE_UST_BILESEN_VARSAYILAN];
  const temiz: ListeUstBilesenId[] = [];
  const kullanilan = new Set<ListeUstBilesenId>();
  for (const v of ham) {
    if (!ustIdMi(v) || kullanilan.has(v)) continue;
    temiz.push(v);
    kullanilan.add(v);
  }
  return temiz;
}

export function belgeListeFiltreDuzeniDuzelt(ham: unknown): BelgeListeFiltreDuzeni {
  if (Array.isArray(ham)) {
    return {
      ustBilesenler: [...LISTE_UST_BILESEN_VARSAYILAN],
      tarihFiltreleri: belgeListeTarihFiltreDuzelt(ham),
    };
  }
  if (!ham || typeof ham !== 'object') return { ...LISTE_FILTRE_VARSAYILAN, ustBilesenler: [...LISTE_UST_BILESEN_VARSAYILAN], tarihFiltreleri: [...LISTE_TARIH_VARSAYILAN] };
  const o = ham as Record<string, unknown>;
  return {
    ustBilesenler: belgeListeUstBilesenDuzelt(o.ustBilesenler),
    tarihFiltreleri: belgeListeTarihFiltreDuzelt(o.tarihFiltreleri),
  };
}

export function belgeListeFiltreDuzeniOku(): BelgeListeFiltreDuzeni {
  try {
    const ham = localStorage.getItem(DEPOLAMA);
    if (ham) return belgeListeFiltreDuzeniDuzelt(JSON.parse(ham));
    const eski = localStorage.getItem(DEPOLAMA_ESKI);
    if (eski) {
      const duzen = belgeListeFiltreDuzeniDuzelt(JSON.parse(eski));
      belgeListeFiltreDuzeniKaydet(duzen);
      return duzen;
    }
  } catch {
    /* depolama kapalı */
  }
  return {
    ustBilesenler: [...LISTE_UST_BILESEN_VARSAYILAN],
    tarihFiltreleri: [...LISTE_TARIH_VARSAYILAN],
  };
}

export function belgeListeFiltreDuzeniKaydet(duzen: BelgeListeFiltreDuzeni) {
  const temiz = belgeListeFiltreDuzeniDuzelt(duzen);
  try {
    localStorage.setItem(DEPOLAMA, JSON.stringify(temiz));
  } catch {
    /* depolama kapalı */
  }
  return temiz;
}

/** @deprecated — geriye uyum */
export function belgeListeFiltreOku(): ListeTarihDonemSecilebilir[] {
  return belgeListeFiltreDuzeniOku().tarihFiltreleri;
}

/** @deprecated — geriye uyum */
export function belgeListeFiltreKaydet(secilen: ListeTarihDonemSecilebilir[]) {
  const mevcut = belgeListeFiltreDuzeniOku();
  return belgeListeFiltreDuzeniKaydet({ ...mevcut, tarihFiltreleri: secilen }).tarihFiltreleri;
}

/** @deprecated — geriye uyum */
export function belgeListeFiltreDuzelt(ham: unknown): ListeTarihDonemSecilebilir[] {
  return belgeListeTarihFiltreDuzelt(ham);
}

export function belgeListeSiradaTasi<T>(liste: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= liste.length || to >= liste.length || from === to) {
    return liste;
  }
  const kopya = [...liste];
  const [oge] = kopya.splice(from, 1);
  if (oge === undefined) return liste;
  kopya.splice(to, 0, oge);
  return kopya;
}

/** @deprecated */
export function belgeListeFiltreSiradaTasi(
  liste: ListeTarihDonemSecilebilir[],
  from: number,
  to: number
): ListeTarihDonemSecilebilir[] {
  return belgeListeSiradaTasi(liste, from, to);
}
