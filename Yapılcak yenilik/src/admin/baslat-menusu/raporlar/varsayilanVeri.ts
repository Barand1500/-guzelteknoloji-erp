import type { KolaySaatSecimi, KolayTarihSecimi, RaporKayit } from '@/admin/baslat-menusu/raporlar/tipler';

export const KOLAY_TARIH_SECENEKLERI: { id: KolayTarihSecimi; etiket: string }[] = [
  { id: 'bugun', etiket: 'BUGÜN' },
  { id: 'dun-bugun', etiket: 'DÜN - BUGÜN' },
  { id: 'buhafta', etiket: 'BUHAFTA' },
  { id: 'buay', etiket: 'BUAY' },
];

export const KOLAY_SAAT_SECENEKLERI: { id: KolaySaatSecimi; etiket: string }[] = [
  { id: 'tam-gun', etiket: '00:00-23:59' },
  { id: 'mesai', etiket: '08:00-18:00' },
  { id: 'ogle', etiket: '11:00-15:00' },
];

function bugunIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function varsayilanRaporKayit(): RaporKayit {
  const bugun = bugunIso();
  return {
    kolayTarih: 'bugun',
    kolaySaat: 'tam-gun',
    baslangicTarih: bugun,
    bitisTarih: bugun,
    baslangicSaat: '00:00',
    bitisSaat: '23:59',
    yazici: 'HP_M232',
    tasarim: 'Default.frx',
  };
}
