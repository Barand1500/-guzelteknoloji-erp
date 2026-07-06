export interface WebApiKayit {
  sunucuIp: string;
  veritabaniAdi: string;
  kullaniciAdi: string;
  kullaniciParola: string;
  tokenUrl: string;
  servisUrl: string;
  vePosDbAdi: string;
  dailyBillNumberWithDatePrefix: boolean;
  telsamCalls: boolean;
  transferUseMatching: boolean;
  transferOptions: boolean;
}

export function varsayilanWebApiKayit(): WebApiKayit {
  return {
    sunucuIp: '(local)',
    veritabaniAdi: 'sefim',
    kullaniciAdi: 'sa',
    kullaniciParola: '',
    tokenUrl: 'https://localhost:7065',
    servisUrl: 'http://*:6754',
    vePosDbAdi: 'Server=127.0.0.1;Database=',
    dailyBillNumberWithDatePrefix: false,
    telsamCalls: false,
    transferUseMatching: true,
    transferOptions: true,
  };
}
