/** Cari hareket özet kartları — görünüm tercihi (localStorage) */

export type CariOzetKartId =
  | 'firma'
  | 'vergi'
  | 'adres'
  | 'bakiye'
  | 'kod'
  | 'eposta'
  | 'web'
  | 'tip'
  | 'efatura';

export interface CariOzetKartTanim {
  id: CariOzetKartId;
  etiket: string;
  aciklama: string;
  /** Varsayılan görünümde açık mı */
  varsayilan: boolean;
}

export interface CariOzetGorunum {
  /** Tüm kartların sırası (gizli olanlar dahil) */
  sira: CariOzetKartId[];
  /** Gizli kart id'leri */
  gizli: CariOzetKartId[];
}

export const CARI_OZET_KARTLARI: CariOzetKartTanim[] = [
  { id: 'firma', etiket: 'Firma', aciklama: 'Cari adı / unvan ve yetkili', varsayilan: true },
  { id: 'vergi', etiket: 'Vergi', aciklama: 'Vergi no ve vergi dairesi', varsayilan: true },
  { id: 'adres', etiket: 'Adres / İletişim', aciklama: 'İl-ilçe ve telefon', varsayilan: true },
  { id: 'bakiye', etiket: 'Bakiye', aciklama: 'Borç / alacak ve net bakiye', varsayilan: true },
  { id: 'kod', etiket: 'Cari Kodu', aciklama: 'Kod ve unvan', varsayilan: false },
  { id: 'tip', etiket: 'Cari Tipi', aciklama: 'Tip ve işletme türü', varsayilan: false },
  { id: 'eposta', etiket: 'E-posta', aciklama: 'E-posta adresi', varsayilan: false },
  { id: 'web', etiket: 'Web', aciklama: 'Web sitesi', varsayilan: false },
  { id: 'efatura', etiket: 'e-Fatura', aciklama: 'e-Fatura / e-Arşiv durumu', varsayilan: false },
];

const DEPO_ANAHTAR = 'erp.cari.hareket.ozetKartlari.v2';
const ESKI_DEPO = 'erp.cari.hareket.ozetKartlari.v1';

const TUM_IDLER = CARI_OZET_KARTLARI.map((k) => k.id);
const BILINEN = new Set(TUM_IDLER);

export function varsayilanOzetGorunum(): CariOzetGorunum {
  return {
    sira: [...TUM_IDLER],
    gizli: CARI_OZET_KARTLARI.filter((k) => !k.varsayilan).map((k) => k.id),
  };
}

function siraNormalize(ham: unknown): CariOzetKartId[] {
  const gelen = Array.isArray(ham)
    ? ham.filter((x): x is CariOzetKartId => typeof x === 'string' && BILINEN.has(x as CariOzetKartId))
    : [];
  const eksik = TUM_IDLER.filter((id) => !gelen.includes(id));
  return [...gelen, ...eksik];
}

function gizliNormalize(ham: unknown, sira: CariOzetKartId[]): CariOzetKartId[] {
  if (!Array.isArray(ham)) return varsayilanOzetGorunum().gizli;
  const gizli = ham.filter(
    (x): x is CariOzetKartId => typeof x === 'string' && BILINEN.has(x as CariOzetKartId)
  );
  // En az bir kart görünür kalsın
  if (gizli.length >= sira.length) {
    return sira.slice(1);
  }
  return gizli;
}

export function ozetGorunumOku(): CariOzetGorunum {
  try {
    const ham = localStorage.getItem(DEPO_ANAHTAR);
    if (ham) {
      const parse = JSON.parse(ham) as Partial<CariOzetGorunum>;
      const sira = siraNormalize(parse.sira);
      return { sira, gizli: gizliNormalize(parse.gizli, sira) };
    }

    // Eski v1: yalnızca görünür id listesi
    const eski = localStorage.getItem(ESKI_DEPO);
    if (eski) {
      const gorunen = siraNormalize(JSON.parse(eski));
      const sira = [...gorunen, ...TUM_IDLER.filter((id) => !gorunen.includes(id))];
      const gizli = sira.filter((id) => !gorunen.includes(id));
      const gorunum = { sira, gizli };
      ozetGorunumYaz(gorunum);
      return gorunum;
    }
  } catch {
    /* varsayılan */
  }
  return varsayilanOzetGorunum();
}

export function ozetGorunumYaz(gorunum: CariOzetGorunum) {
  const sira = siraNormalize(gorunum.sira);
  const gizli = gizliNormalize(gorunum.gizli, sira);
  localStorage.setItem(DEPO_ANAHTAR, JSON.stringify({ sira, gizli }));
}

export function gorunenOzetKartlar(gorunum: CariOzetGorunum): CariOzetKartId[] {
  const gizli = new Set(gorunum.gizli);
  return gorunum.sira.filter((id) => !gizli.has(id));
}

export function ozetKartEtiketi(id: CariOzetKartId): string {
  return CARI_OZET_KARTLARI.find((k) => k.id === id)?.etiket ?? id;
}
