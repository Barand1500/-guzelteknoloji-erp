import {
  bosSubeDepartmanKaydi,
  type TanimlarSubeDepartmanKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/subeDepartmanTipler';

export const TANIMLAR_VARSAYILAN_SUBE_DEPARTMAN: Record<number, TanimlarSubeDepartmanKaydi> = {
  1: { subeNo: '1', departmanNo: '0', atanmis: true },
  2: { subeNo: '1', departmanNo: '2', atanmis: true },
  3: { subeNo: '', departmanNo: '', atanmis: false },
};

export function subeDepartmanKaydiBul(id: number): TanimlarSubeDepartmanKaydi {
  return { ...(TANIMLAR_VARSAYILAN_SUBE_DEPARTMAN[id] ?? bosSubeDepartmanKaydi()) };
}
