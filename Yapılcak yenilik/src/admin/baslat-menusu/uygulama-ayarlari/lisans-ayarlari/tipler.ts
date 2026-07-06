export interface LisansKaydi {
  id: string;
  urun: string;
  seriNo: string;
  kullaniciAdi: string;
  parola: string;
  isletmeKodu: string;
  lisansAnahtari: string;
}

export function bosLisansKaydi(): LisansKaydi {
  return {
    id: '',
    urun: '',
    seriNo: '',
    kullaniciAdi: '',
    parola: '',
    isletmeKodu: '',
    lisansAnahtari: '',
  };
}
