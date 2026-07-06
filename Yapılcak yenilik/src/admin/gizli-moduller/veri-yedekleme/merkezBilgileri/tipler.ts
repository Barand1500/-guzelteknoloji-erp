export interface SefimMerkezKayit {
  sunucuIp: string;
  kullaniciAdi: string;
  kullaniciParola: string;
  veritabaniAdi: string;
  tamVeriAktarimi: boolean;
}

export function varsayilanSefimMerkezKayit(): SefimMerkezKayit {
  return {
    sunucuIp: '',
    kullaniciAdi: '',
    kullaniciParola: '',
    veritabaniAdi: 'sefim',
    tamVeriAktarimi: false,
  };
}
