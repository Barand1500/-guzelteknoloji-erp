export interface PsSatisRaporSatiri {
  id: string;
  tarihSaat: string;
  musteriAdi: string;
  siparisiAlan: string;
  urun: string;
  urunGrubu: string;
  miktar: number;
  fiyat: number;
  toplam: number;
  telefon: string;
  teslimEden: string;
  sube: string;
  departman: string;
}

export interface PsSatisToplamSatiri {
  id: string;
  urunGrubu: string;
  urun: string;
  miktar: number;
  tutar: number;
  ortalamaFiyat: number;
}

export interface PsSatisRaporFiltre {
  baslangic: string;
  bitis: string;
  urun: string;
  sube: string;
  departman: string;
}

export function bosPsSatisFiltre(): PsSatisRaporFiltre {
  const bugun = new Date();
  const baslangic = new Date(bugun);
  baslangic.setHours(0, 0, 0, 0);
  const bitis = new Date(bugun);
  bitis.setHours(23, 59, 0, 0);
  return {
    baslangic: tarihYerel(baslangic),
    bitis: tarihYerel(bitis),
    urun: '',
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

export function psSatisMiktarToplamToplam(satirlar: PsSatisRaporSatiri[]) {
  return satirlar.reduce(
    (acc, s) => ({ miktar: acc.miktar + s.miktar, toplam: acc.toplam + s.toplam }),
    { miktar: 0, toplam: 0 }
  );
}

export function psSatisToplamlariHesapla(satirlar: PsSatisRaporSatiri[]): PsSatisToplamSatiri[] {
  const harita = new Map<string, { urun: string; miktar: number; tutar: number }>();
  for (const s of satirlar) {
    const mevcut = harita.get(s.urun) ?? { urun: s.urun, miktar: 0, tutar: 0 };
    mevcut.miktar += s.miktar;
    mevcut.tutar += s.toplam;
    harita.set(s.urun, mevcut);
  }
  return [...harita.values()]
    .map((v, i) => ({
      id: `pst-${i}`,
      urunGrubu: '',
      urun: v.urun,
      miktar: v.miktar,
      tutar: Math.round(v.tutar * 100) / 100,
      ortalamaFiyat: 0,
    }))
    .sort((a, b) => a.urun.localeCompare(b.urun, 'tr'));
}
