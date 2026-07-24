/** Vergi türleri — KDV, ÖTV, … */

export const VERGI_TURLERI_GUNCELLENDI = 'ap-ozel-vergi-turleri-guncellendi';

const ANAHTAR = 'erp-ozel-vergi-turleri-v1';

export interface VergiTuru {
  id: string;
  adi: string;
  kisaAdi: string;
  aktif: boolean;
}

export type VergiTuruGirdi = Omit<VergiTuru, 'id'> & { id?: string };

const VARSAYILAN: VergiTuru[] = [
  { id: 'vt-kdv', adi: 'Katma Değer Vergisi', kisaAdi: 'KDV', aktif: true },
  { id: 'vt-otv', adi: 'Özel Tüketim Vergisi', kisaAdi: 'ÖTV', aktif: true },
  { id: 'vt-mtv', adi: 'Motorlu Taşıtlar Vergisi', kisaAdi: 'MTV', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(VERGI_TURLERI_GUNCELLENDI));
}

function oku(): VergiTuru[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as VergiTuru[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((t) => ({ ...t }));
}

function yaz(liste: VergiTuru[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function vergiTurleriGetir(): VergiTuru[] {
  return oku();
}

export function vergiTurleriAktifGetir(): VergiTuru[] {
  return oku().filter((t) => t.aktif);
}

export function vergiTuruFormSecenekleri(): { value: string; label: string }[] {
  return vergiTurleriAktifGetir().map((t) => ({
    value: t.id,
    label: `${t.adi} (${t.kisaAdi})`,
  }));
}

export function vergiTuruEtiketi(id: string): string {
  const t = oku().find((x) => x.id === id);
  return t ? t.adi : id;
}

export function vergiTuruKisaAdi(id: string): string {
  return oku().find((x) => x.id === id)?.kisaAdi ?? '';
}

export function vergiTuruEkle(girdi: VergiTuruGirdi): VergiTuru | null {
  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toLocaleUpperCase('tr');
  if (!adi || !kisaAdi) return null;
  if (
    oku().some(
      (t) =>
        t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr') ||
        t.kisaAdi === kisaAdi
    )
  ) {
    return null;
  }
  const yeni: VergiTuru = {
    id: girdi.id ?? `vt-${Date.now()}`,
    adi,
    kisaAdi,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function vergiTuruGuncelle(id: string, girdi: VergiTuruGirdi): boolean {
  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim().toLocaleUpperCase('tr');
  if (!adi || !kisaAdi) return false;
  const mevcut = oku();
  if (!mevcut.some((t) => t.id === id)) return false;
  if (
    mevcut.some(
      (t) =>
        t.id !== id &&
        (t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr') || t.kisaAdi === kisaAdi)
    )
  ) {
    return false;
  }
  yaz(mevcut.map((t) => (t.id === id ? { ...t, adi, kisaAdi, aktif: girdi.aktif !== false } : t)));
  return true;
}

export function vergiTuruSil(id: string): void {
  yaz(oku().filter((t) => t.id !== id));
}
