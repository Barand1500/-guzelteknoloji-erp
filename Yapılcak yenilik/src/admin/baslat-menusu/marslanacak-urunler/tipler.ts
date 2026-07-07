export interface MarslanacakUrun {
  id: string;
  ad: string;
  grup: string;
  marslanmayacak: boolean;
}

export interface MarslanacakUrunKayit {
  urunler: MarslanacakUrun[];
}
