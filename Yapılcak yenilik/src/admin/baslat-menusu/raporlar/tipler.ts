export type RaporGorunum = 'tarih' | 'yazdir';

export type KolayTarihSecimi = 'bugun' | 'dun-bugun' | 'buhafta' | 'buay';

export type KolaySaatSecimi = 'tam-gun' | 'mesai' | 'ogle';

export interface RaporKayit {
  kolayTarih: KolayTarihSecimi;
  kolaySaat: KolaySaatSecimi;
  baslangicTarih: string;
  bitisTarih: string;
  baslangicSaat: string;
  bitisSaat: string;
  yazici: string;
  tasarim: string;
}
