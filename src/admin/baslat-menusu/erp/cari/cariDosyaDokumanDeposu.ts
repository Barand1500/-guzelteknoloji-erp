import type { CariDosya, CariDosyaDokuman, CariDosyaNot } from './tipler';

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

function dosyaNotNormalize(n: unknown): CariDosyaNot | null {
  if (typeof n === 'string') {
    const metin = n.trim();
    if (!metin) return null;
    return { metin, yazar: '', tarih: '' };
  }
  if (!n || typeof n !== 'object') return null;
  const o = n as Partial<CariDosyaNot>;
  return {
    metin: String(o.metin ?? ''),
    yazar: String(o.yazar ?? ''),
    tarih: String(o.tarih ?? ''),
  };
}

export function cariDosyaDokumanGetir(cariId: string): CariDosyaDokuman {
  if (!cariId) return { notlar: [], dosyalar: [], etiketler: [] };
  const kayit = oku()[cariId];
  if (!kayit) return { notlar: [], dosyalar: [], etiketler: [] };
  return {
    notlar: Array.isArray(kayit.notlar) ? kayit.notlar : [],
    dosyalar: Array.isArray(kayit.dosyalar)
      ? kayit.dosyalar.map((d) => {
          const eski = d as { not?: string; dosyaNotlari?: unknown[] };
          let dosyaNotlari: CariDosyaNot[] = [];
          if (Array.isArray(eski.dosyaNotlari)) {
            dosyaNotlari = eski.dosyaNotlari
              .map(dosyaNotNormalize)
              .filter((n): n is CariDosyaNot => n !== null);
          } else if (typeof eski.not === 'string' && eski.not.trim()) {
            dosyaNotlari = [{ metin: eski.not.trim(), yazar: '', tarih: '' }];
          }
          return { ...d, dosyaNotlari };
        })
      : [],
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
