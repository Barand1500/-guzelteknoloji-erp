/** Vergi oran kayıtları — tür + oran */

export const VERGILER_GUNCELLENDI = 'ap-ozel-vergiler-guncellendi';

const ANAHTAR = 'erp-ozel-vergiler-v1';

export interface VergiKayit {
  id: string;
  vergiTuruId: string;
  oran: number;
  aktif: boolean;
}

export type VergiKayitGirdi = Omit<VergiKayit, 'id'> & { id?: string };

const VARSAYILAN: VergiKayit[] = [
  { id: 'vg-kdv-0', vergiTuruId: 'vt-kdv', oran: 0, aktif: true },
  { id: 'vg-kdv-1', vergiTuruId: 'vt-kdv', oran: 1, aktif: true },
  { id: 'vg-kdv-10', vergiTuruId: 'vt-kdv', oran: 10, aktif: true },
  { id: 'vg-kdv-20', vergiTuruId: 'vt-kdv', oran: 20, aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(VERGILER_GUNCELLENDI));
}

function varsayilanlariTamamla(liste: VergiKayit[]): VergiKayit[] {
  const anahtar = (v: VergiKayit) => `${v.vergiTuruId}:${v.oran}`;
  const mevcut = new Set(liste.map(anahtar));
  const ekler = VARSAYILAN.filter((v) => !mevcut.has(anahtar(v)));
  return ekler.length === 0 ? liste : [...liste, ...ekler.map((v) => ({ ...v }))];
}

function oku(): VergiKayit[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as VergiKayit[];
      if (Array.isArray(liste) && liste.length > 0) {
        const tamam = varsayilanlariTamamla(liste);
        if (tamam.length !== liste.length) yaz(tamam);
        return tamam;
      }
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((v) => ({ ...v }));
}

function yaz(liste: VergiKayit[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function vergileriGetir(): VergiKayit[] {
  return oku();
}

export function vergiEkle(girdi: VergiKayitGirdi): VergiKayit | null {
  if (!girdi.vergiTuruId) return null;
  const oran = Number(girdi.oran);
  if (!Number.isFinite(oran) || oran < 0 || oran > 100) return null;
  const yeni: VergiKayit = {
    id: girdi.id ?? `vg-${Date.now()}`,
    vergiTuruId: girdi.vergiTuruId,
    oran,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function vergiGuncelle(id: string, girdi: VergiKayitGirdi): boolean {
  if (!girdi.vergiTuruId) return false;
  const oran = Number(girdi.oran);
  if (!Number.isFinite(oran) || oran < 0 || oran > 100) return false;
  const mevcut = oku();
  if (!mevcut.some((v) => v.id === id)) return false;
  yaz(
    mevcut.map((v) =>
      v.id === id
        ? { ...v, vergiTuruId: girdi.vergiTuruId, oran, aktif: girdi.aktif !== false }
        : v
    )
  );
  return true;
}

export function vergiSil(id: string): void {
  yaz(oku().filter((v) => v.id !== id));
}

/** Aktif vergi oranları (tür filtresi opsiyonel) */
export function vergiOranlariGetir(vergiTuruId?: string, sadeceAktif = true): number[] {
  const liste = sadeceAktif ? oku().filter((v) => v.aktif) : oku();
  const filtre = vergiTuruId
    ? liste.filter((v) => v.vergiTuruId === vergiTuruId)
    : liste;
  return [...new Set(filtre.map((v) => v.oran))].sort((a, b) => a - b);
}

/** Stok KDV dropdown — Özel Tanımlar KDV oranları */
export function kdvOranlariGetir(sadeceAktif = true): number[] {
  return vergiOranlariGetir('vt-kdv', sadeceAktif);
}

export function kdvOranFormSecenekleri(
  ekstra?: number | null,
  sadeceAktif = true
): { value: string; label: string }[] {
  const degerler = new Set(kdvOranlariGetir(sadeceAktif).map(String));
  if (ekstra !== null && ekstra !== undefined && Number.isFinite(ekstra)) {
    degerler.add(String(ekstra));
  }
  if (degerler.size === 0) {
    degerler.add('0');
    degerler.add('10');
    degerler.add('20');
  }
  return [...degerler]
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => ({ value: k, label: `% ${k}` }));
}
