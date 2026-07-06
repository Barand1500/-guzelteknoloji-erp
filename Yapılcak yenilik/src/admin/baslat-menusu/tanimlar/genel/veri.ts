/** Yazıcı listesi — frontend iskelet (backend bağlantısı sonra) */
export const TANIMLAR_YAZICI_SECENEKLERI = [
  { value: 'PRN', label: 'PRN' },
  { value: 'LPT1', label: 'LPT1' },
  { value: 'LPT2', label: 'LPT2' },
  { value: 'LPT3', label: 'LPT3' },
  { value: 'LPT4', label: 'LPT4' },
  {
    value: 'NPI1ECF23',
    label: 'NPI1ECF23 (HP LaserJet MFP M236sdw)',
  },
  { value: 'MS_PDF', label: 'Microsoft Print to PDF' },
  { value: 'HP_M232', label: 'HP LaserJet MFP M232-M237' },
] as const;

export const TANIMLAR_TASARIM_DOSYALARI = [
  { value: 'Default.frx', label: 'Default.frx' },
  { value: 'Fatura.frx', label: 'Fatura.frx' },
  { value: 'Mutfak.frx', label: 'Mutfak.frx' },
] as const;

export const GARSON_GIRIS_SECENEKLERI = [
  { value: 'hayir', label: 'Hayır' },
  { value: 'evet', label: 'Evet' },
] as const;

export const BUTON_BOYUTU_SECENEKLERI = [
  { value: 'kucuk', label: 'Küçük' },
  { value: 'orta', label: 'Orta' },
  { value: 'buyuk', label: 'Büyük' },
] as const;

export const UYARI_FIS_FATURA =
  'Lütfen bir pusula oluşturup onun üzerinden fatura dizaynına geçiniz.';

export const UYARI_MUTFAK_LISTESI =
  'DİKKAT: Ön izleme yapmak için bütün ürünleri varsayılan yazıcıya yönlendiriniz ve marşlamanın kapalı olduğundan emin olunuz.';

export const HESAP_PUSULA_BILGI =
  'Hesap pusulası, mutfak çıktısı ve marka çıktısı yazıcı seçimlerini kullanıcı bazlı olarak config programımızdan yapabilirsiniz.';

export const UYARI_KAYDEDILMEDI = 'Değişiklik yapıldı, kaydedilmedi.';

export const MARKA_BASLIK_ALANLARI = [
  { alan: ']========', satir: 1, sutun: 1, genislik: 40, sagaYasli: false, font: 0 },
  { alan: '-------{', satir: 2, sutun: 1, genislik: 40, sagaYasli: false, font: 0 },
  {
    alan: '=======================================',
    satir: 3,
    sutun: 1,
    genislik: 40,
    sagaYasli: false,
    font: 0,
  },
] as const;

export const MARKA_SATIR_ALANLARI = [
  'Choice1Id',
  'Choice2Id',
  'Comment',
  'Date',
  'ExtOrderNo',
  'HeaderId',
  'Id',
  'Ikram',
  'IsSynced',
  'IsUpdated',
  'isReady',
  'isSee',
  'MenuName',
  'MenuSiraNo',
  'Options',
  'OrderId',
  'OrderState',
  'OriginalPrice',
  'PaymentId',
  'Persons',
  'Price',
  'Printed',
  'ProductId',
  'ProductName',
  'Quantity',
  'QuantityWithProductName',
  'ReadyDate',
  'SubBillNo',
  'TableNumber',
  'UserId',
  'UserName',
  'VatRate',
  'Zayi',
] as const;
