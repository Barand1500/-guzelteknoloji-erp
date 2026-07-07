export interface FirmaDonemKayit {
  firma: string;
  donem: string;
  depo: string;
  sube: string;
  kasa: string;
}

export function bosFirmaDonemKayit(): FirmaDonemKayit {
  return {
    firma: '',
    donem: '',
    depo: '',
    sube: '',
    kasa: '',
  };
}
