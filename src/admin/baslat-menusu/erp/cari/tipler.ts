export type CariTipi = 'SATICI' | 'ALICI';
export type IsletmeTuru = 'TUZEL' | 'GERCEK';
export type CariKartModu = 'yeni' | 'duzenle' | 'incele';
export type CariKartSekmeId =
  | 'kart-bilgileri'
  | 'finansman'
  | 'ek-bilgiler'
  | 'banka-kk'
  | 'e-donusum'
  | 'muhasebe'
  | 'resim'
  | 'analiz'
  | 'alt-kartlar';

export const CARI_TIPLERI: { value: CariTipi; label: string }[] = [
  { value: 'SATICI', label: 'Satıcı' },
  { value: 'ALICI', label: 'Alıcı' },
];

export const ISLETME_TURLERI: { value: IsletmeTuru; label: string }[] = [
  { value: 'TUZEL', label: 'Tüzel' },
  { value: 'GERCEK', label: 'Gerçek' },
];

export const EFATURA_TIPLERI = [
  { value: 'TICARI FATURA', label: 'Ticari Fatura' },
  { value: 'E-ARSIV', label: 'E-Arşiv' },
] as const;

export const CARI_KART_SEKMELERI: { id: CariKartSekmeId; ad: string }[] = [
  { id: 'kart-bilgileri', ad: 'Kart Bilgileri' },
  { id: 'finansman', ad: 'Finansman' },
  { id: 'ek-bilgiler', ad: 'Ek Bilgiler' },
  { id: 'banka-kk', ad: 'Banka & K.K.' },
  { id: 'e-donusum', ad: 'E-Dönüşüm' },
  { id: 'muhasebe', ad: 'Muhasebe' },
  { id: 'resim', ad: 'Resim' },
  { id: 'analiz', ad: 'Analiz' },
  { id: 'alt-kartlar', ad: 'Alt Kartlar' },
];

export interface CariAdresDegeri {
  il: string;
  ilce: string;
  adres: string;
}

export const bosCariAdres: CariAdresDegeri = {
  il: '',
  ilce: '',
  adres: '',
};

/** f001cariler tablosu — API yaniti */
export interface AdminCari {
  id: string;
  firmaId: string;
  ustId: string;
  cariTipi: CariTipi;
  isletmeTuru: string;
  cariKodu: string;
  cariAdi: string;
  unvan: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  il: string;
  ilce: string;
  adres: string;
  telefon: string;
  eposta: string;
  web: string;
  efatura: boolean;
  efaturaTipi: string;
  alias: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

/** API'ye giden çekirdek form */
export interface CariFormDegeri extends CariAdresDegeri {
  ustId: string;
  cariTipi: CariTipi;
  isletmeTuru: string;
  cariKodu: string;
  cariAdi: string;
  unvan: string;
  yetkili: string;
  vergiDairesi: string;
  vergiNo: string;
  telefon: string;
  eposta: string;
  web: string;
  efatura: boolean;
  efaturaTipi: string;
  alias: string;
  aktif: boolean;
}

export const bosCariForm: CariFormDegeri = {
  ustId: '',
  cariTipi: 'ALICI',
  isletmeTuru: '',
  cariKodu: '',
  cariAdi: '',
  unvan: '',
  yetkili: '',
  vergiDairesi: '',
  vergiNo: '',
  il: '',
  ilce: '',
  adres: '',
  telefon: '',
  eposta: '',
  web: '',
  efatura: false,
  efaturaTipi: 'E-ARSIV',
  alias: '',
  aktif: true,
};

export interface CariBankaSatir {
  id: string;
  bankaAdi: string;
  bankaSubesi: string;
  hesapNo: string;
  iban: string;
}

export interface CariKrediKartSatir {
  id: string;
  bankaAdi: string;
  kartTipi: string;
  kartNo: string;
  ccv: string;
  sonKullanma: string;
}

export interface CariGiderCesitSatir {
  id: string;
  cesitKodu: string;
  aciklama: string;
}

export interface CariAltKart {
  id: string;
  firmaKodu: string;
  firmaAdi: string;
  adi: string;
  soyadi: string;
  gorevi: string;
  telefon1: string;
  telefon1Aciklama: string;
  telefon2: string;
  telefon2Aciklama: string;
  telefon3: string;
  telefon3Aciklama: string;
  faks: string;
  faksAciklama: string;
  gsm: string;
  gsmAciklama: string;
  eposta1: string;
  eposta2: string;
  vergiNo: string;
  tcKimlikNo: string;
  musteriTemsilcisi: string;
  glnKodu: string;
  adres1: string;
  ilce1: string;
  sehir1: string;
  adres2: string;
  ilce2: string;
  sehir2: string;
  notlar: string;
}

/** Tam cari kart formu (UI + localStorage ek alanlar) */
export interface CariKartForm {
  // Genel Bilgiler
  firmaKodu: string;
  takipKodu: string;
  grupKodu: string;
  kartTipi: string;
  isletmeTuru: string;
  firmaAdi: string;
  unvan: string;
  yetkiliAdi: string;
  yetkiliSoyadi: string;
  aktif: boolean;
  ustId: string;

  // Kart Bilgileri
  vergiDairesi: string;
  vergiNo: string;
  tcKimlikNo: string;
  pasaportNo: string;
  sicilNo: string;
  postaAdresi: string;
  ilce: string;
  sehir: string;
  tel1: string;
  gsm: string;
  tel2: string;
  eposta: string;
  faks: string;
  url: string;
  glnKodu: string;

  // Finansman
  bakiyeLimiti: string;
  uyar: boolean;
  izinVerme: boolean;
  cekSenetTaksitLim: string;
  hedefCiro: string;
  opsiyon: string;
  iskonto: string;
  paraBirimi: string;
  kur: string;
  sermaye: string;
  gecikmeFaizi: string;
  aylikVade: string;
  prim: string;
  durum: string;
  pozisyon: string;
  satisYapilmasin: boolean;
  alisYapilmasin: boolean;
  iadeFaturasiKesilmesin: boolean;
  siparisYapilmasin: boolean;
  tahsilatYapilmasin: boolean;
  odemeYapilmasin: boolean;
  kdvMuafiyeti: boolean;
  sektor: string;
  marka: string;
  satisFiyati: string;
  depo: string;
  subeAdi: string;

  // Ek Bilgiler
  ozelTur: string;
  ozelSinif: string;
  ozelGrup: string;
  ozelKod4: string;
  ozelKod5: string;
  ozelKod6: string;
  ozelKod7: string;
  istihbarat: string;
  musteriTemsilcisi: string;
  dogumYeri: string;
  dogumTarihi: string;
  anaAdi: string;
  babaAdi: string;
  sosyalGuvenlikNo: string;
  mustahsilBagkurOraniCalismasin: boolean;
  bagkurIstisnaBaslangic: string;
  bagkurIstisnaBitis: string;
  naceKodu: string;

  // Banka & K.K.
  bankalar: CariBankaSatir[];
  krediKartlari: CariKrediKartSatir[];

  // E-Dönüşüm
  efaturaKullanicisi: boolean;
  efaturaSenaryo: string;
  faturaTeslimTipi: string;
  eTicaret: boolean;
  efaturaAlias: string;

  // Muhasebe
  borcKv: string;
  borcUv: string;
  alacakKv: string;
  alacakUv: string;
  giderCesitleri: CariGiderCesitSatir[];

  // Resim
  resimVerisi: string;
  resimAdi: string;

  // Alt Kartlar
  altKartKaynak: 'is' | 'kisisel';
  altKartlar: CariAltKart[];
}

function bosBankaSatirlari(adet = 3): CariBankaSatir[] {
  return Array.from({ length: adet }, (_, i) => ({
    id: `b-${i + 1}`,
    bankaAdi: '',
    bankaSubesi: '',
    hesapNo: '',
    iban: '',
  }));
}

function bosKartSatirlari(adet = 3): CariKrediKartSatir[] {
  return Array.from({ length: adet }, (_, i) => ({
    id: `k-${i + 1}`,
    bankaAdi: '',
    kartTipi: '',
    kartNo: '',
    ccv: '',
    sonKullanma: '',
  }));
}

export const bosCariAltKart = (): CariAltKart => ({
  id: '',
  firmaKodu: '',
  firmaAdi: '',
  adi: '',
  soyadi: '',
  gorevi: '',
  telefon1: '',
  telefon1Aciklama: '',
  telefon2: '',
  telefon2Aciklama: '',
  telefon3: '',
  telefon3Aciklama: '',
  faks: '',
  faksAciklama: '',
  gsm: '',
  gsmAciklama: '',
  eposta1: '',
  eposta2: '',
  vergiNo: '',
  tcKimlikNo: '',
  musteriTemsilcisi: '',
  glnKodu: '',
  adres1: '',
  ilce1: '',
  sehir1: '',
  adres2: '',
  ilce2: '',
  sehir2: '',
  notlar: '',
});

export const bosCariKartForm = (): CariKartForm => ({
  firmaKodu: '',
  takipKodu: '',
  grupKodu: '',
  kartTipi: 'ALICI',
  isletmeTuru: 'GERCEK',
  firmaAdi: '',
  unvan: '',
  yetkiliAdi: '',
  yetkiliSoyadi: '',
  aktif: true,
  ustId: '',

  vergiDairesi: '',
  vergiNo: '',
  tcKimlikNo: '',
  pasaportNo: '',
  sicilNo: '',
  postaAdresi: '',
  ilce: '',
  sehir: '',
  tel1: '',
  gsm: '',
  tel2: '',
  eposta: '',
  faks: '',
  url: '',
  glnKodu: '',

  bakiyeLimiti: '',
  uyar: false,
  izinVerme: false,
  cekSenetTaksitLim: '',
  hedefCiro: '',
  opsiyon: '0',
  iskonto: '0',
  paraBirimi: 'TL',
  kur: 'SATIS',
  sermaye: '',
  gecikmeFaizi: '0',
  aylikVade: '0',
  prim: '0',
  durum: 'AKTIF',
  pozisyon: '',
  satisYapilmasin: false,
  alisYapilmasin: false,
  iadeFaturasiKesilmesin: false,
  siparisYapilmasin: false,
  tahsilatYapilmasin: false,
  odemeYapilmasin: false,
  kdvMuafiyeti: false,
  sektor: '',
  marka: '',
  satisFiyati: '',
  depo: 'MERKEZ',
  subeAdi: 'MERKEZ',

  ozelTur: '',
  ozelSinif: '',
  ozelGrup: '',
  ozelKod4: '',
  ozelKod5: '',
  ozelKod6: '',
  ozelKod7: '',
  istihbarat: '',
  musteriTemsilcisi: '',
  dogumYeri: '',
  dogumTarihi: '',
  anaAdi: '',
  babaAdi: '',
  sosyalGuvenlikNo: '',
  mustahsilBagkurOraniCalismasin: false,
  bagkurIstisnaBaslangic: '',
  bagkurIstisnaBitis: '',
  naceKodu: '',

  bankalar: bosBankaSatirlari(),
  krediKartlari: bosKartSatirlari(),

  efaturaKullanicisi: false,
  efaturaSenaryo: '',
  faturaTeslimTipi: '',
  eTicaret: false,
  efaturaAlias: '',

  borcKv: '',
  borcUv: '',
  alacakKv: '',
  alacakUv: '',
  giderCesitleri: [],

  resimVerisi: '',
  resimAdi: '',

  altKartKaynak: 'is',
  altKartlar: [],
});

export function cariTipiEtiketi(tip: CariTipi): string {
  return CARI_TIPLERI.find((t) => t.value === tip)?.label ?? tip;
}

export function isletmeTuruEtiketi(tur: string): string {
  const etiket = ISLETME_TURLERI.find((t) => t.value === tur)?.label ?? tur;
  return etiket || '—';
}

export function kartTipindenApiCariTipi(kartTipi: string): CariTipi {
  const v = kartTipi.trim().toUpperCase();
  if (v === 'SATICI') return 'SATICI';
  return 'ALICI';
}
