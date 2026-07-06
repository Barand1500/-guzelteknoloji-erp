export interface ArctosDbKayit {
  sunucu: string;
  kullaniciAdi: string;
  kullaniciParola: string;
  veritabani: string;
}

export function bosArctosDbKayit(): ArctosDbKayit {
  return {
    sunucu: '',
    kullaniciAdi: '',
    kullaniciParola: '',
    veritabani: '',
  };
}
