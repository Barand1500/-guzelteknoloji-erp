import type { AktifMasalarGorunum } from '@/admin/baslat-menusu/raporlar/aktif-masalar/tipler';

const STORAGE_KEY = 'restorant-aktif-masalar-gorunum';

const VARSAYILAN: AktifMasalarGorunum = {
  otomatikGuncelleme: true,
  gruplama: 'yok',
};

export function aktifMasalarGorunumOku(): AktifMasalarGorunum {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return { ...VARSAYILAN };
    const parsed = JSON.parse(ham) as Partial<AktifMasalarGorunum>;
    return {
      otomatikGuncelleme: parsed.otomatikGuncelleme ?? VARSAYILAN.otomatikGuncelleme,
      gruplama: parsed.gruplama ?? VARSAYILAN.gruplama,
    };
  } catch {
    return { ...VARSAYILAN };
  }
}

export function aktifMasalarGorunumKaydet(gorunum: AktifMasalarGorunum) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gorunum));
}
