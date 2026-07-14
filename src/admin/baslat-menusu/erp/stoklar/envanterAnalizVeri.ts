import type { AdminStok } from './tipler';
import type {
  StokEnvanterAnalizSatir,
  StokEnvanterFiyatBilgisi,
} from './envanterAnalizTipler';

/** Faz 1: gerçek depo envanteri yok — stok koduna göre örnek dağılım */
export function stokEnvanterAnalizOrnekVeri(stok: AdminStok): StokEnvanterAnalizSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const envanterMerkez = 8 + (seed % 12);

  return [
    {
      id: `${stok.id}-depo-1`,
      depoInd: 1,
      depoKodu: 'MERKEZ',
      envanter: envanterMerkez,
      siparisMiktari: seed % 5,
      kullanilabilir: Math.max(0, envanterMerkez - (seed % 3)),
      altSeviye: 2,
      ustSeviye: 50,
      optimumSeviye: 15,
    },
    {
      id: `${stok.id}-depo-2`,
      depoInd: 2,
      depoKodu: 'DEPO-2',
      envanter: seed % 4,
      siparisMiktari: 0,
      kullanilabilir: seed % 4,
      altSeviye: 0,
      ustSeviye: 20,
      optimumSeviye: 5,
    },
  ].filter((s) => s.envanter > 0 || s.depoInd === 1);
}

export function stokEnvanterFiyatBilgisiOrnek(stok: AdminStok): StokEnvanterFiyatBilgisi {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const taban = 4000 + (seed % 1800);
  const maliyet = taban + 310;

  return {
    alisFiyati: maliyet,
    dovizAlisFiyati: maliyet,
    maliyet,
    satisFiyati1: maliyet + 420,
    satisFiyati2: maliyet + 680,
    satisFiyati3: maliyet + 920,
    satisFiyati3Yuzde: 10,
  };
}
