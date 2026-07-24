/** Özel Tanımlar — Vergi daireleri */

export const VERGI_DAIRELERI_GUNCELLENDI = 'ap-ozel-vergi-daireleri-guncellendi';

const ANAHTAR = 'erp-ozel-vergi-daireleri-v1';

export type VergiSureTipi = 'surekli' | 'sureksiz' | '';

export interface VergiDairesi {
  id: string;
  adi: string;
  detayli: boolean;
  il: string;
  ilce: string;
  gibKodu: string;
  muhBirKodu: string;
  vergiDairesiAdi: string;
  sureTipi: VergiSureTipi;
  mtv: boolean;
  kdv: boolean;
  otv: boolean;
  aktif: boolean;
}

export type VergiDairesiGirdi = Omit<VergiDairesi, 'id'> & { id?: string };

const VARSAYILAN: VergiDairesi[] = [
  {
    id: 'vd-belirtilmemis',
    adi: 'Belirtilmemiş',
    detayli: false,
    il: '',
    ilce: '',
    gibKodu: '',
    muhBirKodu: '',
    vergiDairesiAdi: '',
    sureTipi: '',
    mtv: false,
    kdv: false,
    otv: false,
    aktif: true,
  },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(VERGI_DAIRELERI_GUNCELLENDI));
}

function normalize(d: Partial<VergiDairesi> & { id: string; adi: string }): VergiDairesi {
  return {
    id: d.id,
    adi: d.adi,
    detayli: Boolean(d.detayli),
    il: d.il ?? '',
    ilce: d.ilce ?? '',
    gibKodu: d.gibKodu ?? '',
    muhBirKodu: d.muhBirKodu ?? '',
    vergiDairesiAdi: d.vergiDairesiAdi ?? '',
    sureTipi: (d.sureTipi as VergiSureTipi) || '',
    mtv: Boolean(d.mtv),
    kdv: Boolean(d.kdv),
    otv: Boolean(d.otv),
    aktif: d.aktif !== false,
  };
}

function oku(): VergiDairesi[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<VergiDairesi>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return liste
          .filter((d): d is Partial<VergiDairesi> & { id: string; adi: string } =>
            Boolean(d?.id && d?.adi)
          )
          .map(normalize);
      }
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((d) => ({ ...d }));
}

function yaz(liste: VergiDairesi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function vergiDaireleriOtGetir(): VergiDairesi[] {
  return oku();
}

export function vergiDairesiOtEkle(girdi: VergiDairesiGirdi): VergiDairesi | null {
  const adi = girdi.adi.trim();
  if (!adi) return null;
  const yeni = normalize({
    id: girdi.id ?? `vd-${Date.now()}`,
    adi,
    detayli: girdi.detayli,
    il: girdi.il,
    ilce: girdi.ilce,
    gibKodu: girdi.gibKodu,
    muhBirKodu: girdi.muhBirKodu,
    vergiDairesiAdi: girdi.vergiDairesiAdi,
    sureTipi: girdi.sureTipi,
    mtv: girdi.mtv,
    kdv: girdi.kdv,
    otv: girdi.otv,
    aktif: girdi.aktif,
  });
  yaz([...oku(), yeni]);
  return yeni;
}

export function vergiDairesiOtGuncelle(id: string, girdi: VergiDairesiGirdi): boolean {
  const adi = girdi.adi.trim();
  if (!adi) return false;
  const mevcut = oku();
  if (!mevcut.some((d) => d.id === id)) return false;
  yaz(
    mevcut.map((d) =>
      d.id === id
        ? normalize({
            id,
            adi,
            detayli: girdi.detayli,
            il: girdi.il,
            ilce: girdi.ilce,
            gibKodu: girdi.gibKodu,
            muhBirKodu: girdi.muhBirKodu,
            vergiDairesiAdi: girdi.vergiDairesiAdi,
            sureTipi: girdi.sureTipi,
            mtv: girdi.mtv,
            kdv: girdi.kdv,
            otv: girdi.otv,
            aktif: girdi.aktif,
          })
        : d
    )
  );
  return true;
}

export function vergiDairesiOtSil(id: string): void {
  yaz(oku().filter((d) => d.id !== id));
}

export function vergiDaireleriOtAktifGetir(): VergiDairesi[] {
  return oku().filter((d) => d.aktif);
}

/** Seçici için OT daire adları (vergiDairesiAdi veya adi) */
export function vergiDairesiOtAdlari(): string[] {
  const adlar = vergiDaireleriOtAktifGetir()
    .map((d) => (d.vergiDairesiAdi.trim() || d.adi.trim()))
    .filter((ad) => ad && ad.toLocaleLowerCase('tr') !== 'belirtilmemiş');
  return [...new Set(adlar)].sort((a, b) => a.localeCompare(b, 'tr'));
}

/** OT + ulusal API listesini birleştirir (OT önce) */
export function vergiDairesiSecenekleriBirlesik(apiAdlari: string[]): string[] {
  const ot = vergiDairesiOtAdlari();
  const set = new Set(ot.map((a) => a.toLocaleUpperCase('tr')));
  const sonuc = [...ot];
  for (const ad of apiAdlari) {
    const t = ad.trim();
    if (!t) continue;
    const ku = t.toLocaleUpperCase('tr');
    if (set.has(ku)) continue;
    set.add(ku);
    sonuc.push(t);
  }
  return sonuc;
}
