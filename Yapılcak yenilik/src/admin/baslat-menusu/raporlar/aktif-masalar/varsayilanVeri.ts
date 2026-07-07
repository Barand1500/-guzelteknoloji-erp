import type { AcikPusulaSatiri } from '@/admin/baslat-menusu/raporlar/aktif-masalar/tipler';

function dakikaOnce(dk: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - dk);
  return d.toISOString();
}

const ORNEK: Omit<AcikPusulaSatiri, 'id' | 'tutar'>[] = [
  {
    alinmaZamani: dakikaOnce(3),
    siparisAlan: 'Ahmet',
    masaNo: '12',
    urun: 'Mega Tavuk Döner Menü',
    miktar: 2,
    fiyat: 285,
  },
  {
    alinmaZamani: dakikaOnce(5),
    siparisAlan: 'Ahmet',
    masaNo: '12',
    urun: 'Kola (330 Ml.)',
    miktar: 2,
    fiyat: 45,
  },
  {
    alinmaZamani: dakikaOnce(8),
    siparisAlan: 'Elif',
    masaNo: '7',
    urun: 'Zurna Et Döner Menü',
    miktar: 1,
    fiyat: 395,
  },
  {
    alinmaZamani: dakikaOnce(12),
    siparisAlan: 'Elif',
    masaNo: '7',
    urun: 'Ayran (270 Ml.)',
    miktar: 2,
    fiyat: 35,
  },
  {
    alinmaZamani: dakikaOnce(15),
    siparisAlan: 'Murat',
    masaNo: '3',
    urun: 'İskender Et Döner',
    miktar: 1,
    fiyat: 320,
  },
  {
    alinmaZamani: dakikaOnce(18),
    siparisAlan: 'Murat',
    masaNo: '3',
    urun: 'Patates Kızartması',
    miktar: 1,
    fiyat: 75,
  },
  {
    alinmaZamani: dakikaOnce(22),
    siparisAlan: 'Zeynep',
    masaNo: 'Salon-2',
    urun: 'Lavaş Arası Tavuk Döner',
    miktar: 3,
    fiyat: 165,
  },
  {
    alinmaZamani: dakikaOnce(28),
    siparisAlan: 'Zeynep',
    masaNo: 'Salon-2',
    urun: 'Şalgam (250 Ml.)',
    miktar: 2,
    fiyat: 40,
  },
  {
    alinmaZamani: dakikaOnce(35),
    siparisAlan: 'Can',
    masaNo: 'Paket-5',
    urun: 'Combo Zurna Tavuk Dürüm Menü',
    miktar: 1,
    fiyat: 375,
  },
];

export function ornekAcikPusulalar(): AcikPusulaSatiri[] {
  return ORNEK.map((s, i) => ({
    ...s,
    id: `ap-${i + 1}`,
    tutar: Math.round(s.miktar * s.fiyat * 100) / 100,
  }));
}
