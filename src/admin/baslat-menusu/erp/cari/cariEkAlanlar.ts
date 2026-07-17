import type { CariKartForm, CariKartSekmeId } from './tipler';
import { bosCariKartForm } from './tipler';

const ANAHTAR = 'erp-cari-ek-alanlar-v1';

type Depo = Record<string, Partial<CariKartForm>>;

function oku(): Depo {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) return JSON.parse(ham) as Depo;
  } catch {
    /* bozuk */
  }
  return {};
}

function yaz(depo: Depo) {
  localStorage.setItem(ANAHTAR, JSON.stringify(depo));
}

export function cariEkAlanlariGetir(id: string): Partial<CariKartForm> {
  return oku()[id] ?? {};
}

export function cariEkAlanlariKaydet(id: string, form: CariKartForm) {
  const depo = oku();
  depo[id] = form;
  yaz(depo);
}

export function cariEkAlanlariSil(id: string) {
  const depo = oku();
  delete depo[id];
  yaz(depo);
}

export function cariEkAlanlariBirlesik(id: string | null, temel?: Partial<CariKartForm>): CariKartForm {
  const taban = { ...bosCariKartForm(), ...temel };
  if (!id) return taban;
  return { ...taban, ...cariEkAlanlariGetir(id) };
}

export function sekmeIdGecerliMi(id: string): id is CariKartSekmeId {
  return (
    id === 'kart-bilgileri' ||
    id === 'finansman' ||
    id === 'ek-bilgiler' ||
    id === 'banka-kk' ||
    id === 'e-donusum' ||
    id === 'muhasebe' ||
    id === 'resim' ||
    id === 'analiz' ||
    id === 'alt-kartlar'
  );
}
