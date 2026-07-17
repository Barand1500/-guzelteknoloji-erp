import type { AdminUrun, UrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { bosUrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';

export type AdminStok = AdminUrun;

/** API'ye giden çekirdek ürün alanları + ekrandaki Ek Tanımlar / sekme alanları (UI; DB'de henüz yok) */
export interface StokForm extends UrunForm {
  kdvDepartmani: string;
  kdvDepartmaniToplam: string;
  alisFiyati: string;
  dAlisFiyati: string;
  dAlisPb: string;
  defaultFiyat: string;
  defaultPb: string;
  satFiy1Isk: string;
  satFiy2Isk: string;
  satFiy3Isk: string;
  satFiy4Isk: string;
  satFiy5Isk: string;
  satFiy6Isk: string;
  maxIsk: string;
  alisKdv: string;
  alisIsk: string;
  tarih: string;
  otvYuzde: string;
  otv: string;
  maliyet: string;
  rafOmruGun: string;
  /** Ops. (Gün) */
  opsGun: string;
  teminSuresi: string;
  karYuzde: string;
  primYuzde: string;
  garanti: string;

  /* Birim ve Fiyatlar sekmesi */
  kartBirim: string;
  kartCarpan: string;
  kartKdv: string;
  kartBarkod: string;
  kartFiyatAdi: string;
  kartKdvTip: string;
  kartSatis1: string;
  kartPb1: string;
  kartSatis2: string;
  kartPb2: string;
  kartSatis3: string;
  kartPb3: string;
  kartSatis4: string;
  kartPb4: string;
  kartSatis5: string;
  kartPb5: string;
  kartSatis6: string;
  kartPb6: string;
  kartPasifBirimleriGoster: string;

  /* Özel Kodlar */
  ozelTur: string;
  ozelSinif: string;
  ozelGrup: string;
  ozel4: string;
  ozel5: string;
  ozelSezon: string;
  ozelMarka: string;
  ozelModel: string;
  ozelRenk: string;
  ozelBeden: string;
  ozel11: string;
  ozel12: string;
  ozel13: string;
  ozel14: string;
  ozel15: string;
  ozel16: string;
  ozel17: string;
  ozel18: string;
  ozel19: string;
  ozel20: string;
  ozelPl: string;
  ozelPoz: string;

  /* Muhasebe */
  muhStokGiris: string;
  muhStokCikis: string;
  muhStokCikisYDisi: string;
  muhStokGirisIade: string;
  muhStokCikisIade: string;
  muhAlisKalemIsk: string;
  muhAlisAltIsk: string;
  muhSatisKalemIsk: string;
  muhSatisAltIsk: string;
  muhSatilanMalMaliyeti: string;
  muhMasraf: string;
  muhUretimGirisCikis: string;
  muhUretimBaglantiAlacak: string;
  muhUretimBaglantiBorc: string;

  /* Resim / Analiz / İstihbarat / E-Dönüşüm */
  resimUrl: string;
  analizSonSatis: string;
  analizEski1: string;
  analizEski2: string;
  analizEski3: string;
  analizEski4: string;
  analizEski5: string;
  analizEski6: string;
  analizDegisim1: string;
  analizDegisim2: string;
  analizDegisim3: string;
  analizDegisim4: string;
  analizDegisim5: string;
  analizDegisim6: string;
  istihbaratDurum: string;
  siparisAlinmasin: string;
  siparisVerilmesin: string;
  depoSube: string;
  istihbaratNot: string;
  stokGrubuNot: string;
  eTicaret: string;
  fKasa: string;
  gtip: string;
  uns: string;
  ublTr: string;
  cpaRev: string;
  tevkifatUygulanacak: string;
  tevkifatKodu: string;
  tevkifatAciklama: string;
  tevkifatOran: string;
  eMensei: string;
  istisna: string;
  ozelMatrah: string;
  ihracKayit: string;
}

export const bosStokForm: StokForm = {
  ...bosUrunForm,
  kdvDepartmani: '',
  kdvDepartmaniToplam: '',
  alisFiyati: '',
  dAlisFiyati: '',
  dAlisPb: 'TL',
  defaultFiyat: '',
  defaultPb: 'TL',
  satFiy1Isk: '',
  satFiy2Isk: '',
  satFiy3Isk: '',
  satFiy4Isk: '',
  satFiy5Isk: '',
  satFiy6Isk: '',
  maxIsk: '',
  alisKdv: '',
  alisIsk: '',
  tarih: '',
  otvYuzde: '',
  otv: '',
  maliyet: '',
  rafOmruGun: '0',
  opsGun: '0',
  teminSuresi: '0',
  karYuzde: '0',
  primYuzde: '0',
  garanti: '0',
  kartBirim: 'ADET',
  kartCarpan: '1',
  kartKdv: '10',
  kartBarkod: '',
  kartFiyatAdi: 'FİYAT',
  kartKdvTip: 'D',
  kartSatis1: '',
  kartPb1: 'TL',
  kartSatis2: '',
  kartPb2: 'TL',
  kartSatis3: '',
  kartPb3: 'TL',
  kartSatis4: '',
  kartPb4: 'TL',
  kartSatis5: '',
  kartPb5: 'TL',
  kartSatis6: '',
  kartPb6: 'TL',
  kartPasifBirimleriGoster: '',
  ozelTur: '',
  ozelSinif: '',
  ozelGrup: '',
  ozel4: '',
  ozel5: '',
  ozelSezon: '',
  ozelMarka: '',
  ozelModel: '',
  ozelRenk: '',
  ozelBeden: '',
  ozel11: '',
  ozel12: '',
  ozel13: '',
  ozel14: '',
  ozel15: '',
  ozel16: '',
  ozel17: '',
  ozel18: '',
  ozel19: '',
  ozel20: '',
  ozelPl: '',
  ozelPoz: '',
  muhStokGiris: '',
  muhStokCikis: '',
  muhStokCikisYDisi: '',
  muhStokGirisIade: '',
  muhStokCikisIade: '',
  muhAlisKalemIsk: '',
  muhAlisAltIsk: '',
  muhSatisKalemIsk: '',
  muhSatisAltIsk: '',
  muhSatilanMalMaliyeti: '',
  muhMasraf: '',
  muhUretimGirisCikis: '',
  muhUretimBaglantiAlacak: '',
  muhUretimBaglantiBorc: '',
  resimUrl: '',
  analizSonSatis: '',
  analizEski1: '',
  analizEski2: '',
  analizEski3: '',
  analizEski4: '',
  analizEski5: '',
  analizEski6: '',
  analizDegisim1: '',
  analizDegisim2: '',
  analizDegisim3: '',
  analizDegisim4: '',
  analizDegisim5: '',
  analizDegisim6: '',
  istihbaratDurum: 'Aktif',
  siparisAlinmasin: '',
  siparisVerilmesin: '',
  depoSube: 'MERKEZ',
  istihbaratNot: '',
  stokGrubuNot: '',
  eTicaret: '',
  fKasa: '',
  gtip: '',
  uns: '',
  ublTr: '',
  cpaRev: '',
  tevkifatUygulanacak: '',
  tevkifatKodu: '',
  tevkifatAciklama: '',
  tevkifatOran: '',
  eMensei: '',
  istisna: '',
  ozelMatrah: '',
  ihracKayit: '',
};

/** Kaydet API'sine yalnızca ürün tablosu alanlarını gönder */
export function stokFormdanUrunForm(form: StokForm): UrunForm {
  return {
    ustId: form.ustId,
    urunTipi: form.urunTipi,
    urunNevi: form.urunNevi,
    urunKodu: form.urunKodu,
    marka: form.marka,
    urunAdi: form.urunAdi,
    anaBirim: form.anaBirim,
    varsayilanBirim: form.varsayilanBirim,
    mensei: form.mensei,
  };
}

export interface StokGelismisFiltre {
  urunTipi: string;
  urunKodu: string;
  sinifGrup: string;
  urunAdi: string;
  /** '' = tümü, 'aktif' = yalnız aktif, 'pasif' = yalnız pasif */
  durum: string;
}

export const bosStokGelismisFiltre = (): StokGelismisFiltre => ({
  urunTipi: '',
  urunKodu: '',
  sinifGrup: '',
  urunAdi: '',
  durum: '',
});

export type StokKartModu = 'yeni' | 'duzenle' | 'incele';

export type StokKartSekmeId =
  | 'stok-bilgileri'
  | 'birim-fiyatlar'
  | 'ozel-kodlar'
  | 'muhasebe'
  | 'resim'
  | 'analiz'
  | 'istihbarat'
  | 'e-donusum';

export const STOK_KART_SEKMELERI: { id: StokKartSekmeId; ad: string; aktif: boolean }[] = [
  { id: 'stok-bilgileri', ad: 'Stok Bilgileri', aktif: true },
  { id: 'birim-fiyatlar', ad: 'Birim ve Fiyatlar', aktif: true },
  { id: 'ozel-kodlar', ad: 'Özel Kodlar', aktif: true },
  { id: 'muhasebe', ad: 'Muhasebe', aktif: true },
  { id: 'resim', ad: 'Resim', aktif: true },
  { id: 'analiz', ad: 'Analiz', aktif: true },
  { id: 'istihbarat', ad: 'İstihbarat / Diğer', aktif: true },
  { id: 'e-donusum', ad: 'E-Dönüşüm', aktif: true },
];

export const STOK_PB_SECENEKLERI = [
  { value: 'TL', label: 'TL' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export const STOK_KDV_DEPARTMAN_SECENEKLERI = [
  { value: '', label: 'Seçilmedi' },
  { value: 'KDY0', label: 'K.D.Y. 0 GRUBU — %0' },
  { value: 'KDY1', label: 'K.D.Y. 1 GRUBU — %1' },
  { value: 'KDY10', label: 'K.D.Y. 10 GRUBU — %10' },
  { value: 'KDY20', label: 'K.D.Y. 20 GRUBU — %20' },
];
