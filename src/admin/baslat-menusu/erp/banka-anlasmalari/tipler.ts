import type { CariIletisimKisi } from '@/admin/baslat-menusu/erp/cari/tipler';
import { paraBirimiFormSecenekleri } from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

export type BankaHesapTipi = string;
export type BankaIbanModu = 'TR' | 'YABANCI';
export type BankaKartModu = 'yeni' | 'duzenle' | 'incele';
export type BankaKisimId = 'adres-iletisim';
export type KrediKartTuru = 'TICARI' | 'BIREYSEL';

export type KomisyonUygulamaTipi = 'ILK_TAKSITTEN' | 'ESIT_ORANLARDA';
export type PuanUygulamaTipi = 'KOMISYON_ILE_AYNI' | 'ILK_TAKSITTEN' | 'ESIT_ORANLARDA';

export const BANKA_HESAP_TIPLERI: { value: string; label: string }[] = [
  { value: 'BANKA', label: 'Banka' },
  { value: 'KREDI', label: 'Kredi' },
  { value: 'POS', label: 'POS' },
];

export const KREDI_KART_TURLERI: { value: KrediKartTuru; label: string }[] = [
  { value: 'TICARI', label: 'Ticari' },
  { value: 'BIREYSEL', label: 'Bireysel' },
];

export const KOMISYON_UYGULAMA_TIPLERI: { value: KomisyonUygulamaTipi; label: string }[] = [
  { value: 'ILK_TAKSITTEN', label: 'İlk Taksitten' },
  { value: 'ESIT_ORANLARDA', label: 'Eşit Oranlarda' },
];

export const PUAN_UYGULAMA_TIPLERI: { value: PuanUygulamaTipi; label: string }[] = [
  { value: 'KOMISYON_ILE_AYNI', label: 'Komisyon Uygulama Tipi İle Aynı' },
  { value: 'ILK_TAKSITTEN', label: 'İlk Taksitten' },
  { value: 'ESIT_ORANLARDA', label: 'Eşit Oranlarda' },
];

export const BANKA_DOVIZ_SECENEKLERI = [
  { value: 'TRY', label: '₺ - Türk Lirası' },
  { value: 'USD', label: '$ - ABD Doları' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - İngiliz Sterlini' },
] as const;

/** Dinamik döviz seçenekleri — Özel Tanımlar */
export function bankaDovizSecenekleri(): { value: string; label: string }[] {
  return paraBirimiFormSecenekleri();
}

export interface PosKomisyonSatir {
  id: string;
  kartAdi: string;
  satisSekli: string;
  komisyon: string;
  puan: string;
  blokeGun: string;
  tahsilatSekli: string;
}

export interface AdminBankaAnlasma {
  id: string;
  hesapTipi: string;
  hesapKodu: string;
  hesapIsmi: string;
  bankaKodu: string;
  bankaAdi: string;
  bankaSubesi: string;
  bankaSubeKodu: string;
  hesapNumarasi: string;
  ibanModu: BankaIbanModu;
  iban: string;
  dovizCinsi: string;
  /** Kredi */
  kartNo: string;
  sonKullanmaTarihi: string;
  hesapKesimGunu: string;
  odemeGunu: string;
  kartLimiti: string;
  kartTuru: KrediKartTuru | '';
  /** POS */
  anlasmaNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  komisyonUygulamaTipi: KomisyonUygulamaTipi | '';
  puanUygulamaTipi: PuanUygulamaTipi | '';
  valor: boolean;
  posKomisyonSatirlari: PosKomisyonSatir[];
  iletisimKisiler: CariIletisimKisi[];
  acikKisismlar: BankaKisimId[];
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
}

export interface BankaAnlasmaFormDegeri {
  hesapTipi: string;
  hesapKodu: string;
  hesapIsmi: string;
  bankaKodu: string;
  bankaSubesi: string;
  bankaSubeKodu: string;
  hesapNumarasi: string;
  ibanModu: BankaIbanModu;
  iban: string;
  dovizCinsi: string;
  kartNo: string;
  sonKullanmaTarihi: string;
  hesapKesimGunu: string;
  odemeGunu: string;
  kartLimiti: string;
  kartTuru: KrediKartTuru | '';
  anlasmaNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  komisyonUygulamaTipi: KomisyonUygulamaTipi | '';
  puanUygulamaTipi: PuanUygulamaTipi | '';
  valor: boolean;
  posKomisyonSatirlari: PosKomisyonSatir[];
  iletisimKisiler: CariIletisimKisi[];
  acikKisismlar: BankaKisimId[];
  aktif: boolean;
}

export function bosPosKomisyonSatir(): PosKomisyonSatir {
  return {
    id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kartAdi: '',
    satisSekli: '',
    komisyon: '',
    puan: '',
    blokeGun: '',
    tahsilatSekli: '',
  };
}

export const bosBankaAnlasmaForm: BankaAnlasmaFormDegeri = {
  hesapTipi: 'BANKA',
  hesapKodu: '',
  hesapIsmi: '',
  bankaKodu: '',
  bankaSubesi: '',
  bankaSubeKodu: '',
  hesapNumarasi: '',
  ibanModu: 'TR',
  iban: '',
  dovizCinsi: 'TRY',
  kartNo: '',
  sonKullanmaTarihi: '',
  hesapKesimGunu: '',
  odemeGunu: '',
  kartLimiti: '',
  kartTuru: '',
  anlasmaNo: '',
  baslangicTarihi: '',
  bitisTarihi: '',
  komisyonUygulamaTipi: 'ILK_TAKSITTEN',
  puanUygulamaTipi: 'KOMISYON_ILE_AYNI',
  valor: false,
  posKomisyonSatirlari: [],
  iletisimKisiler: [],
  acikKisismlar: ['adres-iletisim'],
  aktif: true,
};
