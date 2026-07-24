/** Cari tipleri — Bayi, Dağıtıcı, … (Özel Tanımlar merkezi kaynak) */

export const CARI_TIPLERI_GUNCELLENDI = 'ap-ozel-cari-tipleri-guncellendi';

const ANAHTAR = 'erp-ozel-cari-tipleri-v1';
const ESKI_ANAHTAR = 'erp-cari-kart-tipleri-v1';

export interface CariTipi {
  id: string;
  /** Form / API değeri (BAYI, DAGITICI, …) */
  kod: string;
  adi: string;
  aktif: boolean;
}

export type CariTipiGirdi = Omit<CariTipi, 'id' | 'kod'> & { id?: string; kod?: string };

/** ERP uyumluluk: { value, label } */
export interface CariTipiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: CariTipi[] = [
  { id: 'ct-bayi', kod: 'BAYI', adi: 'Bayi', aktif: true },
  { id: 'ct-dagitici', kod: 'DAGITICI', adi: 'Dağıtıcı', aktif: true },
  { id: 'ct-son', kod: 'SON_KULLANICI', adi: 'Son Kullanıcı', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(CARI_TIPLERI_GUNCELLENDI));
}

export function cariTipiKodUret(adi: string): string {
  return adi
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
}

function normalize(t: Partial<CariTipi> & { adi: string; id: string }): CariTipi {
  const adi = t.adi.trim();
  const kod = (t.kod?.trim() || cariTipiKodUret(adi) || t.id).toLocaleUpperCase('tr');
  return {
    id: t.id,
    kod,
    adi,
    aktif: t.aktif !== false,
  };
}

function eskiyiTasi(): CariTipi[] | null {
  try {
    const ham = localStorage.getItem(ESKI_ANAHTAR);
    if (!ham) return null;
    const eski = JSON.parse(ham) as { value?: string; label?: string }[];
    if (!Array.isArray(eski) || eski.length === 0) return null;
    return eski
      .filter((e) => e.value && e.label)
      .map((e, i) =>
        normalize({
          id: `ct-mig-${e.value}-${i}`,
          kod: String(e.value).toLocaleUpperCase('tr'),
          adi: String(e.label),
          aktif: true,
        })
      );
  } catch {
    return null;
  }
}

function oku(): CariTipi[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<CariTipi>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return liste
          .filter((t): t is Partial<CariTipi> & { adi: string; id: string } =>
            Boolean(t?.id && t?.adi)
          )
          .map(normalize);
      }
    }
  } catch {
    /* bozuk */
  }
  const tasinan = eskiyiTasi();
  if (tasinan && tasinan.length > 0) {
    yaz(tasinan);
    return tasinan;
  }
  return VARSAYILAN.map((t) => ({ ...t }));
}

function yaz(liste: CariTipi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function cariTipleriGetir(): CariTipi[] {
  return oku();
}

export function cariTipleriAktifGetir(): CariTipi[] {
  return oku().filter((t) => t.aktif);
}

export function cariTipiBul(kodVeyaId: string): CariTipi | undefined {
  const k = kodVeyaId.trim();
  const ku = k.toLocaleUpperCase('tr');
  return oku().find((t) => t.id === k || t.kod === ku || t.adi.toLocaleLowerCase('tr') === k.toLocaleLowerCase('tr'));
}

export function cariTipiEtiketi(kod: string): string {
  return cariTipiBul(kod)?.adi ?? kod;
}

export function cariTipiFormSecenekleri(sadeceAktif = true): CariTipiSecenek[] {
  const liste = sadeceAktif ? cariTipleriAktifGetir() : cariTipleriGetir();
  return liste.map((t) => ({ value: t.kod, label: t.adi }));
}

export function gecerliCariTipiKodu(kod: string | undefined, varsayilan?: string): string {
  const liste = cariTipleriGetir();
  if (kod && cariTipiBul(kod)) return cariTipiBul(kod)!.kod;
  if (varsayilan && cariTipiBul(varsayilan)) return cariTipiBul(varsayilan)!.kod;
  return liste[0]?.kod ?? 'BAYI';
}

function kodBenzersiz(kod: string, haricId?: string): boolean {
  const ku = kod.toLocaleUpperCase('tr');
  return !oku().some((t) => t.id !== haricId && t.kod === ku);
}

export function cariTipiEkle(girdi: CariTipiGirdi | string): CariTipi | null {
  if (typeof girdi === 'string') {
    const adi = girdi.trim();
    if (!adi) return null;
    return cariTipiEkle({ adi, aktif: true });
  }
  const adi = girdi.adi.trim();
  if (!adi) return null;
  const kod = (girdi.kod?.trim() || cariTipiKodUret(adi) || `TIP_${Date.now()}`).toLocaleUpperCase('tr');
  if (!kodBenzersiz(kod)) return null;
  if (oku().some((t) => t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))) return null;
  const yeni: CariTipi = {
    id: girdi.id ?? `ct-${Date.now()}`,
    kod,
    adi,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function cariTipiGuncelle(idVeyaKod: string, girdi: CariTipiGirdi | string): boolean {
  const adi = typeof girdi === 'string' ? girdi.trim() : girdi.adi.trim();
  if (!adi) return false;
  const mevcut = oku();
  const hedef = mevcut.find((t) => t.id === idVeyaKod || t.kod === idVeyaKod.toLocaleUpperCase('tr'));
  if (!hedef) return false;
  const kod =
    typeof girdi === 'string'
      ? hedef.kod
      : (girdi.kod?.trim() || hedef.kod).toLocaleUpperCase('tr');
  if (!kodBenzersiz(kod, hedef.id)) return false;
  if (
    mevcut.some(
      (t) => t.id !== hedef.id && t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  const aktif = typeof girdi === 'string' ? hedef.aktif : girdi.aktif !== false;
  yaz(mevcut.map((t) => (t.id === hedef.id ? { ...t, adi, kod, aktif } : t)));
  return true;
}

export function cariTipiSil(idVeyaKod: string): void {
  const ku = idVeyaKod.toLocaleUpperCase('tr');
  yaz(oku().filter((t) => t.id !== idVeyaKod && t.kod !== ku));
}
