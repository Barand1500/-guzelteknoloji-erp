export type FiyatListeSekme = 'listeler' | 'kurallar' | 'otomasyon';

export type FiyatListeAltGorunum = 'liste' | 'guncelle';

export type FiyatGuncellemeTipi = 'indirim' | 'arttirim';

export interface FiyatSablonu {
  id: number;
  ad: string;
  aktif: boolean;
}

export interface FiyatListeKurali {
  id: string;
  cariKategorisi: string;
  masaGrubu: string;
  fiyatListesi: string;
}

export interface FiyatOtomasyonKaydi {
  id: string;
  fiyatSablonu: string;
  donemBaslangic: string;
  donemSonu: string;
  baslangicSaati: string;
  bitisSaati: string;
  aktifGunler: string;
}

export interface FiyatGuncellemeTaslak {
  sablonAd: string;
  tip: FiyatGuncellemeTipi;
  oran: string;
  yuvarlama: string;
}

export interface FiyatListeKayit {
  sablonlar: FiyatSablonu[];
  aktifSablonId: number | null;
  kurallar: FiyatListeKurali[];
  otomasyonlar: FiyatOtomasyonKaydi[];
}

export interface YeniSablonTaslak {
  ad: string;
}

export function bosYeniSablonTaslak(): YeniSablonTaslak {
  return { ad: '' };
}

export function bosFiyatGuncellemeTaslak(sablonAd: string): FiyatGuncellemeTaslak {
  return {
    sablonAd,
    tip: 'indirim',
    oran: '10',
    yuvarlama: '0,50',
  };
}

export function bosFiyatListeKurali(id: string): FiyatListeKurali {
  return { id, cariKategorisi: '', masaGrubu: '', fiyatListesi: '' };
}

export function bosFiyatOtomasyonKaydi(id: string): FiyatOtomasyonKaydi {
  return {
    id,
    fiyatSablonu: '',
    donemBaslangic: '',
    donemSonu: '',
    baslangicSaati: '',
    bitisSaati: '',
    aktifGunler: '',
  };
}
