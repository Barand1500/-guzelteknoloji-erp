import {
  bosMasaGrubuAyarlar,
  type TanimlarMasaGrubu,
  type TanimlarMasaGrubuKayit,
} from '@/admin/baslat-menusu/tanimlar/masa-gruplari/tipler';

export const TANIMLAR_MASA_GRUBU_VARSAYILAN: TanimlarMasaGrubu[] = [
  { id: 1, grup: 'BAHÇE', prefixIsimler: 'B-', masaSayisi: 24 },
  { id: 2, grup: 'SALON', prefixIsimler: 'S-', masaSayisi: 20 },
  { id: 3, grup: 'PAKET', prefixIsimler: 'PAKET1,PAKET2,PAKET3', masaSayisi: 3 },
  { id: 4, grup: 'VIP', prefixIsimler: '', masaSayisi: 0 },
  { id: 5, grup: 'JOKER', prefixIsimler: 'PATRON,MÜZİSYEN', masaSayisi: 2 },
];

export function varsayilanMasaGrubuKaydi(): TanimlarMasaGrubuKayit {
  const ayarlar: TanimlarMasaGrubuKayit['ayarlar'] = {};
  for (const g of TANIMLAR_MASA_GRUBU_VARSAYILAN) {
    ayarlar[g.id] = bosMasaGrubuAyarlar();
  }
  return {
    gruplar: TANIMLAR_MASA_GRUBU_VARSAYILAN.map((g) => ({ ...g })),
    ayarlar,
  };
}
