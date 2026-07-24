export type TanimSekmeId = 'firma' | 'sube' | 'depo' | 'kasa' | 'donem';

export type TanimGorunumModu = 'liste' | 'ekle' | 'duzenle';

export interface GomuluDuzenleSecenek {
  id: string;
  /** Vazgeç/Esc: yenilemeden kapat. Kaydet/Sil sonrası: { yenile: true } */
  onKapat: (secenek?: { yenile?: boolean }) => void;
  panel?: boolean;
  /** Varsayılan: duzenle. ekle = alttan / gömülü yeni kayıt */
  mod?: 'duzenle' | 'ekle';
  /** Eklemede üst bağlam (firma/şube) */
  baglam?: { firmaId?: string; subeId?: string };
  /**
   * Grid satırından gelen anlık kayıt.
   * API yeniden yüklenene kadar formu doldurur; sonsuz yükleme spinner'ını önler.
   */
  onizleme?: unknown;
}

export const TANIM_SEKMELER: { id: TanimSekmeId; ad: string; ikon: string }[] = [
  { id: 'firma', ad: 'Firma', ikon: '🏢' },
  { id: 'sube', ad: 'Şube', ikon: '🏪' },
  { id: 'depo', ad: 'Depo', ikon: '📦' },
  { id: 'kasa', ad: 'Kasa', ikon: '💰' },
  { id: 'donem', ad: 'Dönem', ikon: '📅' },
];

export const SEKME_BASLIK: Record<TanimSekmeId, string> = {
  firma: 'Firma Tanımları',
  sube: 'Şube Tanımları',
  depo: 'Depo Tanımları',
  kasa: 'Kasa Tanımları',
  donem: 'Dönem Tanımları',
};

export const SEKME_ALT: Record<TanimSekmeId, string> = {
  firma: 'Firma kodu, unvan ve vergi bilgileri',
  sube: 'Şube adresi ve e-belge serileri',
  depo: 'Depo kodu, adı ve adres bilgileri',
  kasa: 'Kasa kodu, adı ve para birimi',
  donem: 'Muhasebe dönem tanımları',
};

export interface AdresFormDegeri {
  il: string;
  ilce: string;
  mahalle: string;
  postaKodu: string;
  adres: string;
}

export const bosAdres: AdresFormDegeri = {
  il: '',
  ilce: '',
  mahalle: '',
  postaKodu: '',
  adres: '',
};

export interface AdminFirma {
  id: string;
  firmaKodu: string;
  firmaAdi: string;
  vergiDairesi: string;
  vergiNo: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface FirmaFormDegeri {
  firmaKodu: string;
  firmaAdi: string;
  vergiDairesi: string;
  vergiNo: string;
  aktif: boolean;
}

export const bosFirmaForm: FirmaFormDegeri = {
  firmaKodu: '',
  firmaAdi: '',
  vergiDairesi: '',
  vergiNo: '',
  aktif: true,
};

export interface AdminDonem {
  id: string;
  firmaId: string;
  donemKodu: string;
  donemAdi: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface DonemFormDegeri {
  donemKodu: string;
  donemAdi: string;
  aktif: boolean;
}

export const bosDonemForm: DonemFormDegeri = {
  donemKodu: '',
  donemAdi: '',
  aktif: true,
};

export interface AdminSube {
  id: string;
  firmaId: string;
  subeKodu: string;
  subeAdi: string;
  il: string;
  ilce: string;
  mahalle: string;
  postaKodu: string;
  adres: string;
  efaturaSeri: string;
  earsivSeri: string;
  eirsaliyeSeri: string;
  mersis: string;
  ticaretSicil: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface SubeFormDegeri extends AdresFormDegeri {
  subeKodu: string;
  subeAdi: string;
  efaturaSeri: string;
  earsivSeri: string;
  eirsaliyeSeri: string;
  mersis: string;
  ticaretSicil: string;
  aktif: boolean;
}

export const bosSubeForm: SubeFormDegeri = {
  subeKodu: '',
  subeAdi: '',
  ...bosAdres,
  efaturaSeri: '',
  earsivSeri: '',
  eirsaliyeSeri: '',
  mersis: '',
  ticaretSicil: '',
  aktif: true,
};

export interface AdminDepo {
  id: string;
  subeId: string;
  subeKodu?: string;
  subeAdi?: string;
  depoKodu: string;
  depoAdi: string;
  il: string;
  ilce: string;
  mahalle: string;
  postaKodu: string;
  adres: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface DepoFormDegeri extends AdresFormDegeri {
  subeId: string;
  depoKodu: string;
  depoAdi: string;
  aktif: boolean;
}

export const bosDepoForm: DepoFormDegeri = {
  subeId: '',
  depoKodu: '',
  depoAdi: '',
  ...bosAdres,
  aktif: true,
};

export interface AdminKasa {
  id: string;
  subeId: string;
  subeKodu?: string;
  subeAdi?: string;
  kasaKodu: string;
  kasaAdi: string;
  paraBirimi: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface KasaFormDegeri {
  subeId: string;
  kasaKodu: string;
  kasaAdi: string;
  paraBirimi: string;
  aktif: boolean;
}

export const bosKasaForm: KasaFormDegeri = {
  subeId: '',
  kasaKodu: '',
  kasaAdi: '',
  paraBirimi: 'TRY',
  aktif: true,
};

/** @deprecated Özel Tanımlar kaynağını kullanın — paraBirimiKodlari() */
export const PARA_BIRIMLERI = ['TRY', 'USD', 'EUR', 'GBP'] as const;
