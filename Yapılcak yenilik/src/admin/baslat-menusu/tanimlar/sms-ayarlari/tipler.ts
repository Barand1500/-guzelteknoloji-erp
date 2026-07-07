export interface TanimlarSmsAyarlariForm {
  smsGonder: boolean;
  mesajBasligi: string;
  kullaniciAdi: string;
  parola: string;
  smsSablonu: string;
}

export const SMS_SABLON_VARSAYILAN =
  'Sayın {0} {1} tarihine {2} saatleri arasında rezervasyonunuz oluşturulmuştur.';

export const SMS_SABLON_DEGISKENLERI = [
  { kod: '{0}', aciklama: 'rezervasyon kişi adı' },
  { kod: '{1}', aciklama: 'rezervasyon tarihi' },
  { kod: '{2}', aciklama: 'rezervasyon saati' },
  { kod: '{3}', aciklama: 'irtibat kişi adı' },
] as const;

export function varsayilanTanimlarSmsAyarlariForm(): TanimlarSmsAyarlariForm {
  return {
    smsGonder: false,
    mesajBasligi: 'Rezervasyon',
    kullaniciAdi: '',
    parola: '',
    smsSablonu: SMS_SABLON_VARSAYILAN,
  };
}
