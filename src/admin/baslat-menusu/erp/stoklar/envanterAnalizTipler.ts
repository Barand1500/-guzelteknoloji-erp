export interface StokEnvanterAnalizSatir {
  id: string;
  fiyatAdi: string;
  birimAdi: string;
  carpan: number;
  alisFiyati: number;
  maliyet: number;
  satisFiyati: number;
  /** satış − alış (matematik) */
  fark: number;
  /** ((satış − alış) / alış) × 100 — alış 0 ise 0 */
  karYuzde: number;
  kdvYuzde: number;
  kdvDahil: boolean;
  /** KDV dahil tutar (alış bazlı) */
  alisKdvDahil: number;
  /** KDV dahil tutar (satış bazlı) */
  satisKdvDahil: number;
}

export interface StokEnvanterAnalizOzet {
  birimSayisi: number;
  toplamAlis: number;
  toplamSatis: number;
  toplamFark: number;
  ortalamaKarYuzde: number;
  ortalamaMaliyet: number;
}

export function envanterSatirHesapla(girdi: {
  id: string;
  fiyatAdi: string;
  birimAdi: string;
  carpan: number;
  alisFiyati: number;
  maliyet: number;
  satisFiyati: number;
  kdvYuzde: number;
  kdvDahil: boolean;
}): StokEnvanterAnalizSatir {
  const alis = Number.isFinite(girdi.alisFiyati) ? girdi.alisFiyati : 0;
  const satis = Number.isFinite(girdi.satisFiyati) ? girdi.satisFiyati : 0;
  const maliyet = Number.isFinite(girdi.maliyet) ? girdi.maliyet : alis;
  const kdv = Number.isFinite(girdi.kdvYuzde) ? girdi.kdvYuzde : 0;
  const fark = satis - alis;
  const karYuzde = alis > 0 ? (fark / alis) * 100 : 0;
  const kdvCarpan = 1 + kdv / 100;
  const alisKdvDahil = girdi.kdvDahil ? alis : alis * kdvCarpan;
  const satisKdvDahil = girdi.kdvDahil ? satis : satis * kdvCarpan;

  return {
    id: girdi.id,
    fiyatAdi: girdi.fiyatAdi,
    birimAdi: girdi.birimAdi,
    carpan: girdi.carpan,
    alisFiyati: alis,
    maliyet,
    satisFiyati: satis,
    fark,
    karYuzde,
    kdvYuzde: kdv,
    kdvDahil: girdi.kdvDahil,
    alisKdvDahil,
    satisKdvDahil,
  };
}

export function envanterOzetHesapla(satirlar: StokEnvanterAnalizSatir[]): StokEnvanterAnalizOzet {
  if (!satirlar.length) {
    return {
      birimSayisi: 0,
      toplamAlis: 0,
      toplamSatis: 0,
      toplamFark: 0,
      ortalamaKarYuzde: 0,
      ortalamaMaliyet: 0,
    };
  }

  const toplamAlis = satirlar.reduce((n, s) => n + s.alisFiyati, 0);
  const toplamSatis = satirlar.reduce((n, s) => n + s.satisFiyati, 0);
  const toplamFark = toplamSatis - toplamAlis;
  const ortalamaMaliyet = satirlar.reduce((n, s) => n + s.maliyet, 0) / satirlar.length;
  const ortalamaKarYuzde =
    toplamAlis > 0 ? (toplamFark / toplamAlis) * 100 : 0;

  return {
    birimSayisi: satirlar.length,
    toplamAlis,
    toplamSatis,
    toplamFark,
    ortalamaKarYuzde,
    ortalamaMaliyet,
  };
}
