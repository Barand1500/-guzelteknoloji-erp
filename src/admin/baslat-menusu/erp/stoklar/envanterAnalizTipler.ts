export interface StokEnvanterAnalizSatir {
  id: string;
  depoInd: number;
  depoKodu: string;
  envanter: number;
  sipMk: number;
  kullanilabilir: number;
  altSeviye: number;
  ustSeviye: number;
  optimumSeviye: number;
}

export interface StokEnvanterFiyatOzeti {
  alisFiyati: number | null;
  dAlisFiyati: number | null;
  maliyet: number | null;
  satisFiyati1: number | null;
  satisFiyati2: number | null;
  satisFiyati3: number | null;
  kdvYuzde: number;
}

export function envanterToplam(satirlar: StokEnvanterAnalizSatir[]): number {
  return satirlar.reduce((n, s) => n + s.envanter, 0);
}
