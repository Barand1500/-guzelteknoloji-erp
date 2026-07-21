import type { CariIletisimKisi } from './tipler';

const DEPOLAMA_ANAHTARI = 'cari_iletisim_v1';

function oku(): Record<string, CariIletisimKisi[]> {
  try {
    const ham = localStorage.getItem(DEPOLAMA_ANAHTARI);
    if (!ham) return {};
    const veri = JSON.parse(ham) as Record<string, CariIletisimKisi[]>;
    return veri && typeof veri === 'object' ? veri : {};
  } catch {
    return {};
  }
}

function yaz(veri: Record<string, CariIletisimKisi[]>) {
  localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(veri));
}

export function cariIletisimGetir(cariId: string): CariIletisimKisi[] {
  if (!cariId) return [];
  return oku()[cariId] ?? [];
}

export function cariIletisimKaydet(cariId: string, kisiler: CariIletisimKisi[]) {
  if (!cariId) return;
  const veri = oku();
  const temiz = kisiler.filter((k) => !iletisimKisiBosMu(k));
  if (temiz.length === 0) {
    delete veri[cariId];
  } else {
    veri[cariId] = temiz;
  }
  yaz(veri);
}

export function iletisimKisiBosMu(kisi: CariIletisimKisi): boolean {
  return !(
    kisi.adSoyad.trim() ||
    kisi.gorevi.trim() ||
    kisi.eposta.trim() ||
    kisi.telefon.trim() ||
    kisi.il.trim() ||
    kisi.ilce.trim() ||
    kisi.adres.trim()
  );
}

export function bosIletisimKisi(il = '', ilce = ''): CariIletisimKisi {
  return {
    id: `ik-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    adSoyad: '',
    gorevi: '',
    eposta: '',
    telefon: '',
    il,
    ilce,
    adres: '',
  };
}
