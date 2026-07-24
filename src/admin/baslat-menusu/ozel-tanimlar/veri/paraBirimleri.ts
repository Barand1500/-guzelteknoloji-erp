/** Site genelinde para birimi / döviz cinsi tek kaynağı */

export const PARA_BIRIMLERI_GUNCELLENDI = 'ap-para-birimleri-guncellendi';

const ANAHTAR = 'erp-ozel-para-birimleri-v1';

export const KUR_TIPLERI = [
  { value: 'doviz-alis', label: 'Döviz Alış' },
  { value: 'doviz-satis', label: 'Döviz Satış' },
  { value: 'efektif-alis', label: 'Efektif Alış' },
  { value: 'efektif-satis', label: 'Efektif Satış' },
] as const;

export type KurTipi = (typeof KUR_TIPLERI)[number]['value'];

export interface ParaBirimi {
  id: string;
  adi: string;
  kisaAdi: string;
  sembol: string;
  kurTipi: KurTipi;
  kur: number;
  otoGuncelleme: boolean;
  apiUrl: string;
  aktif: boolean;
}

export type ParaBirimiGirdi = Omit<ParaBirimi, 'id'> & { id?: string };

const VARSAYILAN: ParaBirimi[] = [
  {
    id: 'pb-try',
    adi: 'Türk Lirası',
    kisaAdi: 'TRY',
    sembol: '₺',
    kurTipi: 'efektif-satis',
    kur: 1,
    otoGuncelleme: false,
    apiUrl: '',
    aktif: true,
  },
  {
    id: 'pb-usd',
    adi: 'ABD Doları',
    kisaAdi: 'USD',
    sembol: '$',
    kurTipi: 'efektif-satis',
    kur: 47.3025,
    otoGuncelleme: true,
    apiUrl: '',
    aktif: true,
  },
  {
    id: 'pb-eur',
    adi: 'Euro',
    kisaAdi: 'EUR',
    sembol: '€',
    kurTipi: 'efektif-satis',
    kur: 51.12,
    otoGuncelleme: true,
    apiUrl: '',
    aktif: true,
  },
  {
    id: 'pb-gbp',
    adi: 'İngiliz Sterlini',
    kisaAdi: 'GBP',
    sembol: '£',
    kurTipi: 'efektif-satis',
    kur: 59.8,
    otoGuncelleme: false,
    apiUrl: '',
    aktif: true,
  },
];

/** Eski kayıtlar: TL ↔ TRY */
const KOD_ESLEME: Record<string, string> = {
  TL: 'TRY',
  TRY: 'TRY',
};

function duyur() {
  window.dispatchEvent(new CustomEvent(PARA_BIRIMLERI_GUNCELLENDI));
}

function oku(): ParaBirimi[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as ParaBirimi[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((p) => ({ ...p }));
}

function yaz(liste: ParaBirimi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function kurTipiEtiketi(tip: string): string {
  return KUR_TIPLERI.find((k) => k.value === tip)?.label ?? tip;
}

export function paraBirimiKodNormalize(kod: string | undefined | null): string {
  const ust = (kod ?? '').trim().toUpperCase();
  if (!ust) return '';
  return KOD_ESLEME[ust] ?? ust;
}

export function paraBirimleriGetir(): ParaBirimi[] {
  return oku();
}

export function paraBirimleriAktifGetir(): ParaBirimi[] {
  return oku().filter((p) => p.aktif);
}

export function paraBirimiBul(kod: string): ParaBirimi | undefined {
  const n = paraBirimiKodNormalize(kod);
  return oku().find((p) => paraBirimiKodNormalize(p.kisaAdi) === n || p.kisaAdi.toUpperCase() === kod.trim().toUpperCase());
}

export function paraBirimiSembolu(kod: string): string {
  return paraBirimiBul(kod)?.sembol ?? kod;
}

export function paraBirimiEtiketi(kod: string): string {
  const p = paraBirimiBul(kod);
  if (!p) return kod;
  return `${p.sembol} ${p.kisaAdi}`;
}

export function paraBirimiTamEtiket(kod: string): string {
  const p = paraBirimiBul(kod);
  if (!p) return kod;
  return `${p.sembol} - ${p.adi}`;
}

/** Sipariş / datagrid: { deger, etiket } */
export function paraBirimiSecenekleri(sadeceAktif = true): { deger: string; etiket: string; sembol: string }[] {
  const liste = sadeceAktif ? paraBirimleriAktifGetir() : paraBirimleriGetir();
  return liste.map((p) => ({
    deger: p.kisaAdi,
    etiket: `${p.sembol} ${p.kisaAdi}`,
    sembol: p.sembol,
  }));
}

/** FormAcilirSecim / CariOutlined: { value, label } */
export function paraBirimiFormSecenekleri(sadeceAktif = true): { value: string; label: string }[] {
  const liste = sadeceAktif ? paraBirimleriAktifGetir() : paraBirimleriGetir();
  return liste.map((p) => ({
    value: p.kisaAdi,
    label: `${p.sembol} - ${p.adi}`,
  }));
}

/** Kasa vb. düz kod listesi */
export function paraBirimiKodlari(sadeceAktif = true): string[] {
  return paraBirimiFormSecenekleri(sadeceAktif).map((p) => p.value);
}

export function gecerliParaBirimi(kod: string | undefined, varsayilan = 'TRY'): string {
  const n = paraBirimiKodNormalize(kod);
  const liste = paraBirimleriGetir();
  if (n && liste.some((p) => paraBirimiKodNormalize(p.kisaAdi) === n)) {
    const bulunan = liste.find((p) => paraBirimiKodNormalize(p.kisaAdi) === n);
    return bulunan?.kisaAdi ?? n;
  }
  const sembol = kod?.trim();
  if (sembol) {
    const sembolden = liste.find((p) => p.sembol === sembol);
    if (sembolden) return sembolden.kisaAdi;
  }
  const v = paraBirimiKodNormalize(varsayilan) || 'TRY';
  return liste.find((p) => paraBirimiKodNormalize(p.kisaAdi) === v)?.kisaAdi ?? liste[0]?.kisaAdi ?? 'TRY';
}

function kisaAdBenzersizMi(kisaAdi: string, haricId?: string): boolean {
  const n = paraBirimiKodNormalize(kisaAdi);
  return !oku().some(
    (p) => p.id !== haricId && paraBirimiKodNormalize(p.kisaAdi) === n
  );
}

export function paraBirimiEkle(girdi: ParaBirimiGirdi): ParaBirimi | null {
  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toUpperCase();
  const sembol = girdi.sembol.trim();
  if (!adi || !kisaAdi || !sembol || !girdi.kurTipi) return null;
  if (!kisaAdBenzersizMi(kisaAdi)) return null;

  const yeni: ParaBirimi = {
    id: girdi.id ?? `pb-${Date.now()}`,
    adi,
    kisaAdi,
    sembol,
    kurTipi: girdi.kurTipi,
    kur: Number.isFinite(girdi.kur) ? girdi.kur : 0,
    otoGuncelleme: Boolean(girdi.otoGuncelleme),
    apiUrl: (girdi.apiUrl ?? '').trim(),
    aktif: Boolean(girdi.aktif),
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function paraBirimiGuncelle(id: string, girdi: ParaBirimiGirdi): boolean {
  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toUpperCase();
  const sembol = girdi.sembol.trim();
  if (!adi || !kisaAdi || !sembol || !girdi.kurTipi) return false;
  if (!kisaAdBenzersizMi(kisaAdi, id)) return false;

  const mevcut = oku();
  if (!mevcut.some((p) => p.id === id)) return false;

  yaz(
    mevcut.map((p) =>
      p.id === id
        ? {
            ...p,
            adi,
            kisaAdi,
            sembol,
            kurTipi: girdi.kurTipi,
            kur: Number.isFinite(girdi.kur) ? girdi.kur : 0,
            otoGuncelleme: Boolean(girdi.otoGuncelleme),
            apiUrl: (girdi.apiUrl ?? '').trim(),
            aktif: Boolean(girdi.aktif),
          }
        : p
    )
  );
  return true;
}

export function paraBirimiSil(id: string): void {
  yaz(oku().filter((p) => p.id !== id));
}

/** Stok ekranları için sembol/etiket (dinamik) */
export function stokPbSembolu(kod: string): string {
  return paraBirimiSembolu(kod);
}

export function stokPbEtiketi(kod: string): string {
  return paraBirimiEtiketi(kod);
}
