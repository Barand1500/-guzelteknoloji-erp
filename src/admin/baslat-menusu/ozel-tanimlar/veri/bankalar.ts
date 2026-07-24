/** Özel Tanımlar — Bankalar merkezi kaynağı */

export const BANKALAR_GUNCELLENDI = 'ap-ozel-bankalar-guncellendi';

const ANAHTAR = 'erp-ozel-bankalar-v1';
const ESKI_ANAHTAR = 'erp-banka-anlasmalari-bankalar-v2';

export interface OzelBanka {
  id: string;
  adi: string;
  kisaAdi: string;
  gorselUrl: string;
  aktif: boolean;
}

export type OzelBankaGirdi = Omit<OzelBanka, 'id' | 'gorselUrl'> & {
  id?: string;
  gorselUrl?: string;
};

/** Geriye dönük Banka Anlaşmaları seçenek formatı */
export interface BankaSecenek {
  value: string;
  label: string;
  ikonUrl?: string;
}

const VARSAYILAN: OzelBanka[] = [
  { id: 'b-akbank', adi: 'AKBANK T.A.Ş.', kisaAdi: 'AKBANK', gorselUrl: '', aktif: true },
  { id: 'b-aktif', adi: 'AKTİF YATIRIM BANKASI A.Ş.', kisaAdi: 'AKTIFBANK', gorselUrl: '', aktif: true },
  { id: 'b-albaraka', adi: 'ALBARAKA TÜRK KATILIM BANKASI A.Ş.', kisaAdi: 'ALBARAKA', gorselUrl: '', aktif: true },
  { id: 'b-alternatif', adi: 'ALTERNATİFBANK A.Ş.', kisaAdi: 'ALTERNATIF', gorselUrl: '', aktif: true },
  { id: 'b-anadolu', adi: 'ANADOLUBANK A.Ş.', kisaAdi: 'ANADOLU', gorselUrl: '', aktif: true },
  { id: 'b-burgan', adi: 'BURGAN BANK A.Ş.', kisaAdi: 'BURGAN', gorselUrl: '', aktif: true },
  { id: 'b-citi', adi: 'CITIBANK A.Ş.', kisaAdi: 'CITIBANK', gorselUrl: '', aktif: true },
  { id: 'b-deniz', adi: 'DENİZBANK A.Ş.', kisaAdi: 'DENIZBANK', gorselUrl: '', aktif: true },
  { id: 'b-garanti', adi: 'T. GARANTİ BANKASI A.Ş.', kisaAdi: 'GARANTI', gorselUrl: '', aktif: true },
  { id: 'b-halk', adi: 'TÜRKİYE HALK BANKASI A.Ş.', kisaAdi: 'HALKBANK', gorselUrl: '', aktif: true },
  { id: 'b-is', adi: 'TÜRKİYE İŞ BANKASI A.Ş.', kisaAdi: 'ISBANK', gorselUrl: '', aktif: true },
  { id: 'b-qnb', adi: 'QNB BANK A.Ş.', kisaAdi: 'QNB', gorselUrl: '', aktif: true },
  { id: 'b-teb', adi: 'TÜRK EKONOMİ BANKASI A.Ş.', kisaAdi: 'TEB', gorselUrl: '', aktif: true },
  { id: 'b-vakif', adi: 'TÜRKİYE VAKIFLAR BANKASI T.A.O.', kisaAdi: 'VAKIFBANK', gorselUrl: '', aktif: true },
  { id: 'b-ykb', adi: 'YAPI VE KREDİ BANKASI A.Ş.', kisaAdi: 'YAPIKREDI', gorselUrl: '', aktif: true },
  { id: 'b-ziraat', adi: 'T.C. ZİRAAT BANKASI A.Ş.', kisaAdi: 'ZIRAAT', gorselUrl: '', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(BANKALAR_GUNCELLENDI));
}

function normalize(b: Partial<OzelBanka> & { adi: string; kisaAdi: string; id: string }): OzelBanka {
  return {
    id: b.id,
    adi: b.adi,
    kisaAdi: b.kisaAdi,
    gorselUrl: typeof b.gorselUrl === 'string' ? b.gorselUrl : '',
    aktif: b.aktif !== false,
  };
}

function alfabetik(liste: OzelBanka[]): OzelBanka[] {
  return [...liste].sort((a, b) => a.adi.localeCompare(b.adi, 'tr', { sensitivity: 'base' }));
}

function eskiyiTasi(): OzelBanka[] | null {
  try {
    const ham = localStorage.getItem(ESKI_ANAHTAR);
    if (!ham) return null;
    const eski = JSON.parse(ham) as { value?: string; label?: string }[];
    if (!Array.isArray(eski) || eski.length === 0) return null;
    return eski
      .filter((e) => e.value && e.label)
      .map((e, i) =>
        normalize({
          id: `b-mig-${e.value}-${i}`,
          adi: String(e.label),
          kisaAdi: String(e.value).toLocaleUpperCase('tr'),
          aktif: true,
        })
      );
  } catch {
    return null;
  }
}

function oku(): OzelBanka[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<OzelBanka>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return alfabetik(
          liste
            .filter((b): b is Partial<OzelBanka> & { adi: string; kisaAdi: string; id: string } =>
              Boolean(b?.id && b?.adi && b?.kisaAdi)
            )
            .map(normalize)
        );
      }
    }
  } catch {
    /* bozuk */
  }
  const tasinan = eskiyiTasi();
  if (tasinan?.length) {
    yaz(tasinan);
    return alfabetik(tasinan);
  }
  return alfabetik(VARSAYILAN.map((b) => ({ ...b })));
}

function yaz(liste: OzelBanka[]) {
  const sirali = alfabetik(liste);
  localStorage.setItem(ANAHTAR, JSON.stringify(sirali));
  localStorage.setItem(
    ESKI_ANAHTAR,
    JSON.stringify(sirali.map((b) => ({ value: b.kisaAdi, label: b.adi })))
  );
  duyur();
}

export function bankalariGetir(): OzelBanka[] {
  return oku();
}

export function bankalariAktifGetir(): OzelBanka[] {
  return oku().filter((b) => b.aktif);
}

export function bankaFormSecenekleri(sadeceAktif = true): BankaSecenek[] {
  const liste = sadeceAktif ? bankalariAktifGetir() : bankalariGetir();
  return liste.map((b) => ({
    value: b.kisaAdi,
    label: b.adi,
    ikonUrl: b.gorselUrl || undefined,
  }));
}

/** Banka Anlaşmaları uyumluluk */
export function bankalariSecenekGetir(): BankaSecenek[] {
  return bankaFormSecenekleri(true);
}

export function bankaEtiketi(kod: string): string {
  const k = kod.trim().toLocaleUpperCase('tr');
  return oku().find((b) => b.kisaAdi === k || b.id === kod)?.adi ?? kod;
}

export function bankaGorseli(kod: string): string {
  return bankaBul(kod)?.gorselUrl ?? '';
}

export function bankaBul(kod: string): OzelBanka | undefined {
  const k = kod.trim().toLocaleUpperCase('tr');
  return oku().find((b) => b.kisaAdi === k || b.id === kod);
}

function kisaAdBenzersiz(kisaAdi: string, haricId?: string): boolean {
  const k = kisaAdi.trim().toLocaleUpperCase('tr');
  return !oku().some((b) => b.id !== haricId && b.kisaAdi === k);
}

export function bankaEkle(girdi: OzelBankaGirdi | string): OzelBanka | null {
  if (typeof girdi === 'string') {
    const ad = girdi.trim();
    if (!ad) return null;
    const kisaAdi = ad
      .toLocaleUpperCase('tr')
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
    return bankaEkle({ adi: ad, kisaAdi: kisaAdi || `BANKA_${Date.now()}`, aktif: true });
  }

  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toLocaleUpperCase('tr');
  if (!adi || !kisaAdi) return null;
  if (!kisaAdBenzersiz(kisaAdi)) return null;

  const yeni: OzelBanka = {
    id: girdi.id ?? `b-${Date.now()}`,
    adi,
    kisaAdi,
    gorselUrl: (girdi.gorselUrl ?? '').trim(),
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function bankaGuncelle(idOrValue: string, girdi: OzelBankaGirdi | string): boolean {
  if (typeof girdi === 'string') {
    const ad = girdi.trim();
    if (!ad) return false;
    const mevcut = oku();
    const hedef = mevcut.find((b) => b.kisaAdi === idOrValue || b.id === idOrValue);
    if (!hedef) return false;
    if (
      mevcut.some(
        (b) =>
          b.id !== hedef.id && b.adi.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
      )
    ) {
      return false;
    }
    yaz(mevcut.map((b) => (b.id === hedef.id ? { ...b, adi: ad } : b)));
    return true;
  }

  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toLocaleUpperCase('tr');
  if (!adi || !kisaAdi) return false;
  if (!kisaAdBenzersiz(kisaAdi, idOrValue)) return false;
  const mevcut = oku();
  if (!mevcut.some((b) => b.id === idOrValue)) return false;
  yaz(
    mevcut.map((b) =>
      b.id === idOrValue
        ? {
            ...b,
            adi,
            kisaAdi,
            gorselUrl: (girdi.gorselUrl ?? '').trim(),
            aktif: girdi.aktif !== false,
          }
        : b
    )
  );
  return true;
}

export function bankaSil(idOrValue: string): void {
  yaz(oku().filter((b) => b.id !== idOrValue && b.kisaAdi !== idOrValue));
}
