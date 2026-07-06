export type UrunIsmiGorunum = 'tamami' | 'sadece-son-kismi';

export interface TanimlarDigerForm {
  urunIsmiGorunum: UrunIsmiGorunum;
  bilgisayarAdi: string;
}

export function varsayilanTanimlarDigerForm(): TanimlarDigerForm {
  return {
    urunIsmiGorunum: 'tamami',
    bilgisayarAdi: '',
  };
}
