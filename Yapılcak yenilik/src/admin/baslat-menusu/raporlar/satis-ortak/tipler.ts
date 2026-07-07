export interface SatisRaporSatiri {
  id: string;
  tarihSaat: string;
  masa: string;
  personel: string;
  urun: string;
  urunGrubu: string;
  miktar: number;
  fiyat: number;
  tutar: number;
  sube: string;
  departman: string;
}

export interface SatisRaporFiltre {
  baslangic: string;
  bitis: string;
  urun: string;
  urunGrubu: string;
  sube: string;
  departman: string;
}

export interface SatisToplamSatiri {
  id: string;
  urunGrubu: string;
  urun: string;
  miktar: number;
  tutar: number;
  ortalamaFiyat: number;
}

export function bosSatisFiltre(): SatisRaporFiltre {
  const bugun = new Date();
  const baslangic = new Date(bugun);
  baslangic.setHours(0, 0, 0, 0);
  const bitis = new Date(bugun);
  bitis.setHours(23, 59, 0, 0);
  return {
    baslangic: tarihYerel(baslangic),
    bitis: tarihYerel(bitis),
    urun: '',
    urunGrubu: '',
    sube: '',
    departman: '',
  };
}

function tarihYerel(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  const sa = String(d.getHours()).padStart(2, '0');
  const dk = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${g}T${sa}:${dk}`;
}

export function satisToplamlariHesapla(satirlar: SatisRaporSatiri[]): SatisToplamSatiri[] {
  const harita = new Map<string, { urunGrubu: string; urun: string; miktar: number; tutar: number }>();
  for (const s of satirlar) {
    const anahtar = `${s.urunGrubu}::${s.urun}`;
    const mevcut = harita.get(anahtar) ?? { urunGrubu: s.urunGrubu, urun: s.urun, miktar: 0, tutar: 0 };
    mevcut.miktar += s.miktar;
    mevcut.tutar += s.tutar;
    harita.set(anahtar, mevcut);
  }
  return [...harita.values()]
    .map((v, i) => ({
      id: `st-${i}`,
      urunGrubu: v.urunGrubu,
      urun: v.urun,
      miktar: v.miktar,
      tutar: Math.round(v.tutar * 100) / 100,
      ortalamaFiyat: v.miktar > 0 ? Math.round((v.tutar / v.miktar) * 100) / 100 : 0,
    }))
    .sort((a, b) => {
      const g = a.urunGrubu.localeCompare(b.urunGrubu, 'tr');
      if (g !== 0) return g;
      return a.urun.localeCompare(b.urun, 'tr');
    });
}

export function satisMiktarTutarToplam(satirlar: { miktar: number; tutar: number }[]) {
  return satirlar.reduce(
    (acc, s) => ({ miktar: acc.miktar + s.miktar, tutar: acc.tutar + s.tutar }),
    { miktar: 0, tutar: 0 }
  );
}
