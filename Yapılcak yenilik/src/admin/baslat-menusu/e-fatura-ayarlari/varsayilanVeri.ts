import { bosEFaturaKayit, type EFaturaKayit } from '@/admin/baslat-menusu/e-fatura-ayarlari/tipler';

export const varsayilanEFaturaKaydi: EFaturaKayit = {
  ...bosEFaturaKayit(),
  ust: {
    fis: true,
    normalFatura: true,
    eAdisyonKapali: false,
    eFaturaOffline: false,
    eFaturaServisSaglayiciDiger: true,
    eFaturaSeri: 'EF',
    eArsivSeri: 'EA',
    eAdisyonSeri: 'EAD',
    gecisTarihi: '2024-01-01',
  },
  firma: {
    eArsivCariSecimi: 'Nihai Tüketici',
    firmaAdi: 'Örnek Restoran Ltd. Şti.',
    yetkiliAdi: 'Ahmet',
    yetkiliSoyadi: 'Yılmaz',
    vergiDairesi: 'Kadıköy',
    vergiNumarasi: '1234567890',
    ticaretSicilNo: '',
    mersisNo: '',
    donemYili: '2026',
    musteriKodu: '',
    portalKullaniciAdi: '',
    portalKullaniciParola: '',
    gondericiBirimEposta: 'efatura@ornek.com',
    sehir: 'İstanbul',
    mahalle: 'Caferağa',
    cadde: 'Moda Cad.',
    apartmanNo: '12',
    daire: '3',
    okcSeriNolari: [],
  },
};

export const E_ARSIV_CARI_SECENEKLERI = [
  { value: 'Nihai Tüketici', label: 'Nihai Tüketici' },
  { value: 'Bireysel', label: 'Bireysel' },
  { value: 'Kurumsal', label: 'Kurumsal' },
];
