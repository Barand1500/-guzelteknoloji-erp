import type { CariDosyaDokuman } from './tipler';

const DEPOLAMA_ANAHTARI = 'cari_dosya_dokuman_v1';

function oku(): Record<string, CariDosyaDokuman> {
  try {
    const ham = localStorage.getItem(DEPOLAMA_ANAHTARI);
    if (!ham) return {};
    const veri = JSON.parse(ham) as Record<string, CariDosyaDokuman>;
    return veri && typeof veri === 'object' ? veri : {};
  } catch {
    return {};
  }
}

function yaz(veri: Record<string, CariDosyaDokuman>) {
  localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(veri));
}

export function cariDosyaDokumanGetir(cariId: string): CariDosyaDokuman {
  if (!cariId) return { notlar: [], dosyalar: [], etiketler: [] };
  const kayit = oku()[cariId];
  if (!kayit) return { notlar: [], dosyalar: [], etiketler: [] };
  return {
    notlar: Array.isArray(kayit.notlar) ? kayit.notlar : [],
    dosyalar: Array.isArray(kayit.dosyalar) ? kayit.dosyalar : [],
    etiketler: Array.isArray(kayit.etiketler) ? kayit.etiketler : [],
  };
}

export function cariDosyaDokumanKaydet(cariId: string, veri: CariDosyaDokuman) {
  if (!cariId) return;
  const depo = oku();
  const bos =
    veri.notlar.length === 0 && veri.dosyalar.length === 0 && veri.etiketler.length === 0;
  if (bos) {
    delete depo[cariId];
  } else {
    depo[cariId] = {
      notlar: veri.notlar,
      dosyalar: veri.dosyalar,
      etiketler: veri.etiketler,
    };
  }
  yaz(depo);
}

export function yeniKayitId(onek: string): string {
  return `${onek}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
