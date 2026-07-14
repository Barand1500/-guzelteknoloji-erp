/** Geçici mock — En Son Eklenenler paneli için */
export interface StokSonEklenen {
  id: string;
  urunKodu: string;
  urunAdi: string;
  urunTipi: string;
  urunNevi: string;
  marka: string;
  mensei: string;
  anaBirim: string;
  varsayilanBirim: string;
  olusturma: string;
}

export const STOK_SON_EKLENENLER_MOCK: StokSonEklenen[] = [
  {
    id: 'mock-1',
    urunKodu: 'STK-1001',
    urunAdi: 'M530 Yeni Nesil Yazarkasa POS',
    urunTipi: 'EMTIA',
    urunNevi: 'RESMI',
    marka: 'Hugin',
    mensei: 'Türkiye',
    anaBirim: 'ADET',
    varsayilanBirim: 'ADET',
    olusturma: '2026-07-14T09:12:00',
  },
  {
    id: 'mock-2',
    urunKodu: 'STK-1002',
    urunAdi: 'Termal Rulo 80x80',
    urunTipi: 'EMTIA',
    urunNevi: 'RESMI',
    marka: 'PaperPro',
    mensei: 'Çin',
    anaBirim: 'KUTU',
    varsayilanBirim: 'ADET',
    olusturma: '2026-07-13T16:40:00',
  },
  {
    id: 'mock-3',
    urunKodu: 'HIZ-020',
    urunAdi: 'Kurulum ve Eğitim Hizmeti',
    urunTipi: 'HIZMET',
    urunNevi: 'RESMI',
    marka: '',
    mensei: '',
    anaBirim: 'SAAT',
    varsayilanBirim: 'SAAT',
    olusturma: '2026-07-13T11:05:00',
  },
  {
    id: 'mock-4',
    urunKodu: 'STK-0888',
    urunAdi: 'USB Barkod Okuyucu',
    urunTipi: 'EMTIA',
    urunNevi: 'RESMI',
    marka: 'Honeywell',
    mensei: 'ABD',
    anaBirim: 'ADET',
    varsayilanBirim: 'ADET',
    olusturma: '2026-07-12T14:22:00',
  },
  {
    id: 'mock-5',
    urunKodu: 'STK-0450',
    urunAdi: 'Fiyat Farkı',
    urunTipi: 'EMTIA',
    urunNevi: 'RESMI',
    marka: '',
    mensei: 'Türkiye',
    anaBirim: 'ADET',
    varsayilanBirim: 'ADET',
    olusturma: '2026-07-11T08:55:00',
  },
];
