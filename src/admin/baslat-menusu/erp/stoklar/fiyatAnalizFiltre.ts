import type { FiyatAnalizIslemFiltre, StokFiyatAnalizSatir } from './fiyatAnalizTipler';

function tarihDegeri(tarih: string): number {
  const d = new Date(tarih);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function sonYonSatiriniBul(
  satirlar: StokFiyatAnalizSatir[],
  yon: StokFiyatAnalizSatir['yon']
): StokFiyatAnalizSatir | null {
  const adaylar = satirlar.filter((s) => s.yon === yon);
  if (adaylar.length === 0) return null;
  return [...adaylar].sort((a, b) => tarihDegeri(b.tarih) - tarihDegeri(a.tarih))[0];
}

export function fiyatAnalizSatirlariniFiltrele(
  satirlar: StokFiyatAnalizSatir[],
  filtre: FiyatAnalizIslemFiltre
): StokFiyatAnalizSatir[] {
  switch (filtre) {
    case 'giris':
      return satirlar.filter((s) => s.yon === 'giris');
    case 'cikis':
      return satirlar.filter((s) => s.yon === 'cikis');
    case 'sonGiris': {
      const son = sonYonSatiriniBul(satirlar, 'giris');
      return son ? [son] : [];
    }
    case 'sonCikis': {
      const son = sonYonSatiriniBul(satirlar, 'cikis');
      return son ? [son] : [];
    }
    default:
      return satirlar;
  }
}

export function fiyatAnalizOzetHesapla(satirlar: StokFiyatAnalizSatir[]) {
  if (satirlar.length === 0) {
    return { ortalamaBirimMaliyet: 0, toplamMiktar: 0 };
  }
  const toplamMiktar = satirlar.reduce((t, s) => t + s.miktar, 0);
  const agirlikliToplam = satirlar.reduce((t, s) => t + s.birimMaliyet * s.miktar, 0);
  const ortalamaBirimMaliyet = toplamMiktar > 0 ? agirlikliToplam / toplamMiktar : 0;
  return { ortalamaBirimMaliyet, toplamMiktar };
}
