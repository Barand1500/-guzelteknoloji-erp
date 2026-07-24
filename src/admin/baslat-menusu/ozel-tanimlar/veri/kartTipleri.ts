/** Kart tipleri — Banka Kartı / Kredi Kartı / Ön Ödemeli */

export const KART_TIPLERI_GUNCELLENDI = 'ap-ozel-kart-tipleri-guncellendi';

const ANAHTAR = 'erp-ozel-kart-tipleri-v1';

export interface KartTipi {
  id: string;
  adi: string;
  aktif: boolean;
}

export type KartTipiGirdi = Omit<KartTipi, 'id'> & { id?: string };

const VARSAYILAN: KartTipi[] = [
  { id: 'kt-banka', adi: 'Banka Kartı', aktif: true },
  { id: 'kt-kredi', adi: 'Kredi Kartı', aktif: true },
  { id: 'kt-onodemeli', adi: 'Ön Ödemeli Kart', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(KART_TIPLERI_GUNCELLENDI));
}

function oku(): KartTipi[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as KartTipi[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((t) => ({ ...t }));
}

function yaz(liste: KartTipi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function kartTipleriGetir(): KartTipi[] {
  return oku();
}

export function kartTipleriAktifGetir(): KartTipi[] {
  return oku().filter((t) => t.aktif);
}

export function kartTipiFormSecenekleri(): { value: string; label: string }[] {
  return kartTipleriAktifGetir().map((t) => ({ value: t.id, label: t.adi }));
}

export function kartTipiEtiketi(id: string): string {
  return oku().find((t) => t.id === id)?.adi ?? id;
}

export function kartTipiEkle(girdi: KartTipiGirdi): KartTipi | null {
  const adi = girdi.adi.trim();
  if (!adi) return null;
  if (oku().some((t) => t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))) {
    return null;
  }
  const yeni: KartTipi = {
    id: girdi.id ?? `kt-${Date.now()}`,
    adi,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function kartTipiGuncelle(id: string, girdi: KartTipiGirdi): boolean {
  const adi = girdi.adi.trim();
  if (!adi) return false;
  const mevcut = oku();
  if (!mevcut.some((t) => t.id === id)) return false;
  if (
    mevcut.some(
      (t) => t.id !== id && t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(mevcut.map((t) => (t.id === id ? { ...t, adi, aktif: girdi.aktif !== false } : t)));
  return true;
}

export function kartTipiSil(id: string): void {
  yaz(oku().filter((t) => t.id !== id));
}
