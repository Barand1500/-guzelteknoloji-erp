export interface RestoranDurumuAyar {
  sabah: string;
  ogle: string;
  aksam: string;
  rezervasyonUyariDakika: string;
}

export const RESTORAN_DURUMU_VARSAYILAN: RestoranDurumuAyar = {
  sabah: '08:00',
  ogle: '12:00',
  aksam: '18:00',
  rezervasyonUyariDakika: '30',
};

export type RestoranDurumuAlan = keyof RestoranDurumuAyar;
