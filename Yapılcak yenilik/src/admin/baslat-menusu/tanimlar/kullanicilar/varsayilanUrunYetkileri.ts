import {
  bosUrunYetkiKaydi,
  type TanimlarUrunYetkiKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';

export const TANIMLAR_VARSAYILAN_URUN_YETKILERI: Record<number, TanimlarUrunYetkiKaydi> = {
  1: {
    yetkiliUrunIdleri: [
      'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10',
      'u11', 'u12', 'u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20',
      'u21', 'u22', 'u23', 'u24',
    ],
  },
  2: {
    yetkiliUrunIdleri: ['u1', 'u3', 'u6', 'u11', 'u12', 'u13', 'u15', 'u21'],
  },
  3: {
    yetkiliUrunIdleri: ['u2', 'u8', 'u16', 'u6', 'u12', 'u19', 'u22'],
  },
};

export function urunYetkiKaydiBul(id: number): TanimlarUrunYetkiKaydi {
  const kayit = TANIMLAR_VARSAYILAN_URUN_YETKILERI[id];
  if (!kayit) return bosUrunYetkiKaydi();
  return { yetkiliUrunIdleri: [...kayit.yetkiliUrunIdleri] };
}
