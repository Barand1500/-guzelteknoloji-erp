import {
  MARKA_BASLIK_ALANLARI,
  MARKA_SATIR_ALANLARI,
} from '@/admin/baslat-menusu/tanimlar/genel/veri';

export type TanimlarGenelPanel = 'kapali' | 'pusula-print' | 'marka-dizayn' | 'e-adisyon';

export interface DizaynSatir {
  alan: string;
  altSatir: boolean;
  sutun: number;
  genislik: number;
  sagaYasli: boolean;
  font: number;
}

export interface DizaynBaslikSatir {
  alan: string;
  satir: number;
  sutun: number;
  genislik: number;
  sagaYasli: boolean;
  font: number;
}

export interface TanimlarGenelForm {
  garsonGirisi: string;
  butonBoyutu: string;
  faturaYazicisi: string;
  pusulaYazicisi: string;
  pusulaTasarim: string;
  eAdisyonYazicisi: string;
  eAdisyonTasarim: string;
  baslikSatirlari: DizaynBaslikSatir[];
  satirAlanlari: DizaynSatir[];
  ozetSatirlari: DizaynBaslikSatir[];
}

export function bosDizaynSatir(alan: string): DizaynSatir {
  return {
    alan,
    altSatir: false,
    sutun: 1,
    genislik: -1,
    sagaYasli: false,
    font: 0,
  };
}

export function varsayilanTanimlarGenelForm(): TanimlarGenelForm {
  return {
    garsonGirisi: 'hayir',
    butonBoyutu: 'orta',
    faturaYazicisi: 'PRN',
    pusulaYazicisi: 'HP_M232',
    pusulaTasarim: 'Default.frx',
    eAdisyonYazicisi: 'PRN',
    eAdisyonTasarim: 'Default.frx',
    baslikSatirlari: MARKA_BASLIK_ALANLARI.map((s) => ({ ...s })),
    satirAlanlari: MARKA_SATIR_ALANLARI.map((a) => bosDizaynSatir(a)),
    ozetSatirlari: [
      {
        alan: '',
        satir: 1,
        sutun: 1,
        genislik: -1,
        sagaYasli: true,
        font: 0,
      },
    ],
  };
}
