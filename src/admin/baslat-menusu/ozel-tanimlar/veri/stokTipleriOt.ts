/** Stok tipleri — Basit / Grup / Varyasyonlu (Özel Tanımlar merkezi kaynak) */

export const STOK_TIPLERI_OT_GUNCELLENDI = 'ap-ozel-stok-tipleri-guncellendi';

const ANAHTAR = 'erp-ozel-stok-tipleri-v1';
const ESKI_ANAHTAR = 'erp-stok-tipleri-v1';

export interface StokTipiOt {
  id: string;
  kod: string;
  adi: string;
  aktif: boolean;
}

export type StokTipiOtGirdi = Omit<StokTipiOt, 'id' | 'kod'> & { id?: string; kod?: string };

export interface StokTipiSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: StokTipiOt[] = [
  { id: 'st-basit', kod: 'BASIT_URUN', adi: 'Basit Ürün', aktif: true },
  { id: 'st-grup', kod: 'GRUP_URUN', adi: 'Grup Ürün', aktif: true },
  { id: 'st-varyasyon', kod: 'VARYASYONLU_URUN', adi: 'Varyasyonlu Ürün', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(STOK_TIPLERI_OT_GUNCELLENDI));
}

export function stokTipiKodUret(adi: string): string {
  return adi
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
}

function normalize(t: Partial<StokTipiOt> & { adi: string; id: string }): StokTipiOt {
  const adi = t.adi.trim();
  const kod = (t.kod?.trim() || stokTipiKodUret(adi) || t.id).toLocaleUpperCase('tr');
  return { id: t.id, kod, adi, aktif: t.aktif !== false };
}

function eskiyiTasi(): StokTipiOt[] | null {
  try {
    const ham = localStorage.getItem(ESKI_ANAHTAR);
    if (!ham) return null;
    const eski = JSON.parse(ham) as { value?: string; label?: string }[];
    if (!Array.isArray(eski) || eski.length === 0) return null;
    return eski
      .filter((e) => e.value && e.label)
      .map((e, i) =>
        normalize({
          id: `st-mig-${e.value}-${i}`,
          kod: String(e.value).toLocaleUpperCase('tr'),
          adi: String(e.label),
          aktif: true,
        })
      );
  } catch {
    return null;
  }
}

function oku(): StokTipiOt[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<StokTipiOt>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return liste
          .filter((t): t is Partial<StokTipiOt> & { adi: string; id: string } =>
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

function yaz(liste: StokTipiOt[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function stokTipleriOtGetir(): StokTipiOt[] {
  return oku();
}

export function stokTipleriOtAktifGetir(): StokTipiOt[] {
  return oku().filter((t) => t.aktif);
}

export function stokTipiOtBul(kodVeyaId: string): StokTipiOt | undefined {
  const k = kodVeyaId.trim();
  const ku = k.toLocaleUpperCase('tr');
  return oku().find(
    (t) =>
      t.id === k ||
      t.kod === ku ||
      t.adi.toLocaleLowerCase('tr') === k.toLocaleLowerCase('tr')
  );
}

export function stokTipiOtEtiketi(kod: string): string {
  return stokTipiOtBul(kod)?.adi ?? kod;
}

export function stokTipiFormSecenekleri(sadeceAktif = true): StokTipiSecenek[] {
  const liste = sadeceAktif ? stokTipleriOtAktifGetir() : stokTipleriOtGetir();
  return liste.map((t) => ({ value: t.kod, label: t.adi }));
}

export function gecerliStokTipiKodu(kod: string | undefined, varsayilan?: string): string {
  if (kod && stokTipiOtBul(kod)) return stokTipiOtBul(kod)!.kod;
  if (varsayilan && stokTipiOtBul(varsayilan)) return stokTipiOtBul(varsayilan)!.kod;
  return oku()[0]?.kod ?? 'BASIT_URUN';
}

function kodBenzersiz(kod: string, haricId?: string): boolean {
  const ku = kod.toLocaleUpperCase('tr');
  return !oku().some((t) => t.id !== haricId && t.kod === ku);
}

export function stokTipiOtEkle(girdi: StokTipiOtGirdi | string): StokTipiOt | null {
  if (typeof girdi === 'string') {
    const adi = girdi.trim();
    if (!adi) return null;
    return stokTipiOtEkle({ adi, aktif: true });
  }
  const adi = girdi.adi.trim();
  if (!adi) return null;
  const kod = (girdi.kod?.trim() || stokTipiKodUret(adi) || `TIP_${Date.now()}`).toLocaleUpperCase('tr');
  if (!kodBenzersiz(kod)) return null;
  if (oku().some((t) => t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))) return null;
  const yeni: StokTipiOt = {
    id: girdi.id ?? `st-${Date.now()}`,
    kod,
    adi,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function stokTipiOtGuncelle(idVeyaKod: string, girdi: StokTipiOtGirdi | string): boolean {
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

export function stokTipiOtSil(idVeyaKod: string): void {
  const ku = idVeyaKod.toLocaleUpperCase('tr');
  yaz(oku().filter((t) => t.id !== idVeyaKod && t.kod !== ku));
}
