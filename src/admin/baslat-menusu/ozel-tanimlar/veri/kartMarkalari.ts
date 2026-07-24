/** Kart markaları — Visa, MasterCard, TROY, ... */

export const KART_MARKALARI_GUNCELLENDI = 'ap-ozel-kart-markalari-guncellendi';

const ANAHTAR = 'erp-ozel-kart-markalari-v1';

export interface KartMarka {
  id: string;
  adi: string;
  gorselUrl: string;
  aktif: boolean;
}

export type KartMarkaGirdi = Omit<KartMarka, 'id'> & { id?: string; gorselUrl?: string };

const VARSAYILAN: KartMarka[] = [
  { id: 'km-amex', adi: 'Amex', gorselUrl: '', aktif: true },
  { id: 'km-diners', adi: 'Diners', gorselUrl: '', aktif: true },
  { id: 'km-jcb', adi: 'JCB', gorselUrl: '', aktif: true },
  { id: 'km-mc', adi: 'MasterCard', gorselUrl: '', aktif: true },
  { id: 'km-ozel', adi: 'Özel Logolu', gorselUrl: '', aktif: true },
  { id: 'km-troy', adi: 'TROY', gorselUrl: '', aktif: true },
  { id: 'km-union', adi: 'UnionPay', gorselUrl: '', aktif: true },
  { id: 'km-visa', adi: 'Visa', gorselUrl: '', aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(KART_MARKALARI_GUNCELLENDI));
}

function normalize(m: Partial<KartMarka> & { adi: string; id: string }): KartMarka {
  return {
    id: m.id,
    adi: m.adi,
    gorselUrl: typeof m.gorselUrl === 'string' ? m.gorselUrl : '',
    aktif: m.aktif !== false,
  };
}

function oku(): KartMarka[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<KartMarka>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return liste
          .filter((m): m is Partial<KartMarka> & { adi: string; id: string } =>
            Boolean(m?.id && m?.adi)
          )
          .map(normalize);
      }
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((m) => ({ ...m }));
}

function yaz(liste: KartMarka[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function kartMarkalariGetir(): KartMarka[] {
  return oku();
}

export function kartMarkalariAktifGetir(): KartMarka[] {
  return oku().filter((m) => m.aktif);
}

export function kartMarkaFormSecenekleri(): { value: string; label: string; ikonUrl?: string }[] {
  return kartMarkalariAktifGetir().map((m) => ({
    value: m.id,
    label: m.adi,
    ikonUrl: m.gorselUrl || undefined,
  }));
}

export function kartMarkaEtiketi(id: string): string {
  return oku().find((m) => m.id === id)?.adi ?? id;
}

export function kartMarkaGorseli(id: string): string {
  return oku().find((m) => m.id === id)?.gorselUrl ?? '';
}

export function kartMarkaEkle(girdi: KartMarkaGirdi): KartMarka | null {
  const adi = girdi.adi.trim();
  if (!adi) return null;
  if (oku().some((m) => m.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))) {
    return null;
  }
  const yeni: KartMarka = {
    id: girdi.id ?? `km-${Date.now()}`,
    adi,
    gorselUrl: (girdi.gorselUrl ?? '').trim(),
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function kartMarkaGuncelle(id: string, girdi: KartMarkaGirdi): boolean {
  const adi = girdi.adi.trim();
  if (!adi) return false;
  const mevcut = oku();
  if (!mevcut.some((m) => m.id === id)) return false;
  if (
    mevcut.some(
      (m) => m.id !== id && m.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((m) =>
      m.id === id
        ? {
            ...m,
            adi,
            gorselUrl: (girdi.gorselUrl ?? '').trim(),
            aktif: girdi.aktif !== false,
          }
        : m
    )
  );
  return true;
}

export function kartMarkaSil(id: string): void {
  yaz(oku().filter((m) => m.id !== id));
}
