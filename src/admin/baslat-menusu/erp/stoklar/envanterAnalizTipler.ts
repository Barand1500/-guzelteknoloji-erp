export interface StokEnvanterAnalizSatir {
  id: string;
  depoInd: number;
  depoKodu: string;
  envanter: number;
  siparisMiktari: number;
  kullanilabilir: number;
  altSeviye: number;
  ustSeviye: number;
  optimumSeviye: number;
}

export interface StokEnvanterFiyatBilgisi {
  alisFiyati: number;
  dovizAlisFiyati: number;
  maliyet: number;
  satisFiyati1: number;
  satisFiyati2: number;
  satisFiyati3: number;
  satisFiyati3Yuzde: number;
}

export interface StokEnvanterAnalizOzet {
  envanter: number;
  siparisMiktari: number;
  kullanilabilir: number;
}
