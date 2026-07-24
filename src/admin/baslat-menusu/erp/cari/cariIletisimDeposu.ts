import type { CariIletisimKisi } from './tipler';

const DEPOLAMA_ANAHTARI = 'cari_iletisim_v2';

function kisiNormalize(k: Partial<CariIletisimKisi> & { id?: string }): CariIletisimKisi {
  return {
    id: k.id?.trim() || `ik-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    adresBasligi: (k.adresBasligi ?? '').trim() ? String(k.adresBasligi) : '',
    adSoyad: k.adSoyad ?? '',
    gorevi: k.gorevi ?? '',
    eposta: k.eposta ?? '',
    telefon: k.telefon ?? '',
    telefonDahili: String(k.telefonDahili ?? '').replace(/\D/g, '').slice(0, 4),
    gsm: k.gsm ?? '',
    web: k.web ?? '',
    il: k.il ?? '',
    ilce: k.ilce ?? '',
    adres: k.adres ?? '',
  };
}

function oku(): Record<string, CariIletisimKisi[]> {
  try {
    const ham = localStorage.getItem(DEPOLAMA_ANAHTARI) ?? localStorage.getItem('cari_iletisim_v1');
    if (!ham) return {};
    const veri = JSON.parse(ham) as Record<string, Partial<CariIletisimKisi>[]>;
    if (!veri || typeof veri !== 'object') return {};
    const sonuc: Record<string, CariIletisimKisi[]> = {};
    for (const [cariId, liste] of Object.entries(veri)) {
      if (!Array.isArray(liste)) continue;
      sonuc[cariId] = liste.map((k) => kisiNormalize(k));
    }
    return sonuc;
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
  const temiz = kisiler.filter((k) => !iletisimKisiBosMu(k)).map((k) => kisiNormalize(k));
  if (temiz.length === 0) {
    delete veri[cariId];
  } else {
    veri[cariId] = temiz;
  }
  yaz(veri);
}

export function iletisimKisiBosMu(kisi: CariIletisimKisi): boolean {
  return !(
    kisi.adresBasligi.trim() ||
    kisi.adSoyad.trim() ||
    kisi.gorevi.trim() ||
    kisi.eposta.trim() ||
    kisi.telefon.trim() ||
    kisi.telefonDahili.trim() ||
    kisi.gsm.trim() ||
    kisi.web.trim() ||
    kisi.il.trim() ||
    kisi.ilce.trim() ||
    kisi.adres.trim()
  );
}

export function bosIletisimKisi(il = '', ilce = ''): CariIletisimKisi {
  return {
    id: `ik-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    adresBasligi: '',
    adSoyad: '',
    gorevi: '',
    eposta: '',
    telefon: '',
    telefonDahili: '',
    gsm: '',
    web: '',
    il,
    ilce,
    adres: '',
  };
}
