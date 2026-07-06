export type TahsilatTaramaModu = 'gunluk' | 'haftalik' | 'aylik';

export interface TahsilatTaramaSatiri {
  id: string;
  personel: string;
  toplamTeslimEdilen: number;
  nakitTahsilat: number;
  krediTahsilat: number;
  yCekTahsilat: number;
  toplamTahsilat: number;
  acikHesap: number;
  discount: number;
  kalan: number;
  sube: string;
  departman: string;
}

export interface TahsilatTaramaFiltre {
  mod: TahsilatTaramaModu;
  baslangic: string;
  bitis: string;
  sube: string;
  departman: string;
}

export const TAHSILAT_TARAMA_MOD_ETIKET: Record<TahsilatTaramaModu, string> = {
  gunluk: 'Günlük',
  haftalik: 'Haftalık',
  aylik: 'Aylık',
};

export function bosTahsilatFiltre(mod: TahsilatTaramaModu = 'haftalik'): TahsilatTaramaFiltre {
  const { baslangic, bitis } = modaGoreAralik(mod);
  return { mod, baslangic, bitis, sube: '', departman: '' };
}

export function modaGoreAralik(mod: TahsilatTaramaModu, referans = new Date()) {
  const ref = gunBaslangic(referans);

  if (mod === 'gunluk') {
    const s = tarihStr(ref);
    return { baslangic: s, bitis: s };
  }

  if (mod === 'haftalik') {
    const gun = ref.getDay();
    const pazartesi = new Date(ref);
    pazartesi.setDate(ref.getDate() - (gun === 0 ? 6 : gun - 1));
    const pazar = new Date(pazartesi);
    pazar.setDate(pazartesi.getDate() + 6);
    return { baslangic: tarihStr(pazartesi), bitis: tarihStr(pazar) };
  }

  const ayBas = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const aySon = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { baslangic: tarihStr(ayBas), bitis: tarihStr(aySon) };
}

export function aralikKaydir(mod: TahsilatTaramaModu, baslangic: string, yon: -1 | 1) {
  const bas = new Date(`${baslangic}T12:00:00`);
  if (mod === 'gunluk') {
    bas.setDate(bas.getDate() + yon);
  } else if (mod === 'haftalik') {
    bas.setDate(bas.getDate() + yon * 7);
  } else {
    bas.setMonth(bas.getMonth() + yon);
  }
  return modaGoreAralik(mod, bas);
}

export function tahsilatToplamlariHesapla(satirlar: TahsilatTaramaSatiri[]) {
  return satirlar.reduce(
    (acc, s) => ({
      toplamTeslimEdilen: acc.toplamTeslimEdilen + s.toplamTeslimEdilen,
      nakitTahsilat: acc.nakitTahsilat + s.nakitTahsilat,
      krediTahsilat: acc.krediTahsilat + s.krediTahsilat,
      yCekTahsilat: acc.yCekTahsilat + s.yCekTahsilat,
      toplamTahsilat: acc.toplamTahsilat + s.toplamTahsilat,
      acikHesap: acc.acikHesap + s.acikHesap,
      discount: acc.discount + s.discount,
      kalan: acc.kalan + s.kalan,
    }),
    {
      toplamTeslimEdilen: 0,
      nakitTahsilat: 0,
      krediTahsilat: 0,
      yCekTahsilat: 0,
      toplamTahsilat: 0,
      acikHesap: 0,
      discount: 0,
      kalan: 0,
    }
  );
}

function gunBaslangic(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function tarihStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${g}`;
}
