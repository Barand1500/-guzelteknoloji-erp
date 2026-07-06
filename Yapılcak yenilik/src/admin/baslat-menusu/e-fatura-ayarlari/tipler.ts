export type EFaturaSekme = 'firma' | 'servis';

export interface EFaturaUstAyarlar {
  fis: boolean;
  normalFatura: boolean;
  eAdisyonKapali: boolean;
  eFaturaOffline: boolean;
  eFaturaServisSaglayiciDiger: boolean;
  eFaturaSeri: string;
  eArsivSeri: string;
  eAdisyonSeri: string;
  gecisTarihi: string;
}

export interface EFaturaFirmaBilgileri {
  eArsivCariSecimi: string;
  firmaAdi: string;
  yetkiliAdi: string;
  yetkiliSoyadi: string;
  vergiDairesi: string;
  vergiNumarasi: string;
  ticaretSicilNo: string;
  mersisNo: string;
  donemYili: string;
  musteriKodu: string;
  portalKullaniciAdi: string;
  portalKullaniciParola: string;
  gondericiBirimEposta: string;
  sehir: string;
  mahalle: string;
  cadde: string;
  apartmanNo: string;
  daire: string;
  okcSeriNolari: string[];
}

export interface EFaturaSunucuBilgileri {
  sqlServerAdi: string;
  katalogAdi: string;
  kullaniciAdi: string;
  parola: string;
  eFaturaServisAdresi: string;
}

export interface EFaturaOtomatikServis {
  aktif: boolean;
  saat: string;
  dakika: string;
}

export interface EFaturaServisAyarlari {
  sunucu: EFaturaSunucuBilgileri;
  eFaturaServisi: EFaturaOtomatikServis;
  eAdisyonServisi: EFaturaOtomatikServis;
}

export interface EFaturaKayit {
  ust: EFaturaUstAyarlar;
  firma: EFaturaFirmaBilgileri;
  servis: EFaturaServisAyarlari;
}

export function bosEFaturaKayit(): EFaturaKayit {
  return {
    ust: {
      fis: true,
      normalFatura: true,
      eAdisyonKapali: false,
      eFaturaOffline: false,
      eFaturaServisSaglayiciDiger: false,
      eFaturaSeri: '',
      eArsivSeri: '',
      eAdisyonSeri: '',
      gecisTarihi: '',
    },
    firma: {
      eArsivCariSecimi: 'Nihai Tüketici',
      firmaAdi: '',
      yetkiliAdi: '',
      yetkiliSoyadi: '',
      vergiDairesi: '',
      vergiNumarasi: '',
      ticaretSicilNo: '',
      mersisNo: '',
      donemYili: String(new Date().getFullYear()),
      musteriKodu: '',
      portalKullaniciAdi: '',
      portalKullaniciParola: '',
      gondericiBirimEposta: '',
      sehir: '',
      mahalle: '',
      cadde: '',
      apartmanNo: '',
      daire: '',
      okcSeriNolari: [],
    },
    servis: {
      sunucu: {
        sqlServerAdi: '',
        katalogAdi: 'vePosFatura',
        kullaniciAdi: '',
        parola: '',
        eFaturaServisAdresi: 'http://127.0.0.1:8787',
      },
      eFaturaServisi: { aktif: false, saat: '0', dakika: '0' },
      eAdisyonServisi: { aktif: false, saat: '0', dakika: '0' },
    },
  };
}
