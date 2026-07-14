import type { AdminStok } from './tipler';
import type {
  StokEnvanterAnalizSatir,
  StokEnvanterFiyatBilgisi,
} from './envanterAnalizTipler';

/** Faz 1: gerçek depo envanteri yok — stok koduna göre örnek dağılım */
export function stokEnvanterAnalizOrnekVeri(stok: AdminStok): StokEnvanterAnalizSatir[] {
  const kod = stok.urunKodu || 'STOK';
  const seed = kod.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const envanterMerkez = 18 + (seed % 20);
  const envanterIst = 6 + (seed % 9);
  const envanterAnk = 3 + (seed % 7);
  const envanterIzmir = seed % 5;
  const envanterDepo2 = 4 + (seed % 6);
  const envanterServis = 1 + (seed % 3);

  return [
    {
      id: `${stok.id}-depo-1`,
      depoInd: 1,
      depoKodu: 'MERKEZ',
      envanter: envanterMerkez,
      siparisMiktari: 2 + (seed % 5),
      kullanilabilir: Math.max(0, envanterMerkez - (seed % 4)),
      altSeviye: 5,
      ustSeviye: 80,
      optimumSeviye: 25,
    },
    {
      id: `${stok.id}-depo-2`,
      depoInd: 2,
      depoKodu: 'DEPO-2',
      envanter: envanterDepo2,
      siparisMiktari: seed % 3,
      kullanilabilir: Math.max(0, envanterDepo2 - (seed % 2)),
      altSeviye: 2,
      ustSeviye: 30,
      optimumSeviye: 10,
    },
    {
      id: `${stok.id}-depo-3`,
      depoInd: 3,
      depoKodu: 'ŞUBE-İST',
      envanter: envanterIst,
      siparisMiktari: 1,
      kullanilabilir: Math.max(0, envanterIst - 1),
      altSeviye: 3,
      ustSeviye: 40,
      optimumSeviye: 12,
    },
    {
      id: `${stok.id}-depo-4`,
      depoInd: 4,
      depoKodu: 'ŞUBE-ANK',
      envanter: envanterAnk,
      siparisMiktari: 0,
      kullanilabilir: envanterAnk,
      altSeviye: 2,
      ustSeviye: 25,
      optimumSeviye: 8,
    },
    {
      id: `${stok.id}-depo-5`,
      depoInd: 5,
      depoKodu: 'ŞUBE-İZMİR',
      envanter: envanterIzmir,
      siparisMiktari: envanterIzmir === 0 ? 4 : 0,
      kullanilabilir: envanterIzmir,
      altSeviye: 1,
      ustSeviye: 20,
      optimumSeviye: 6,
    },
    {
      id: `${stok.id}-depo-6`,
      depoInd: 6,
      depoKodu: 'SERVİS',
      envanter: envanterServis,
      siparisMiktari: 0,
      kullanilabilir: envanterServis,
      altSeviye: 0,
      ustSeviye: 10,
      optimumSeviye: 2,
    },
  ];
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
