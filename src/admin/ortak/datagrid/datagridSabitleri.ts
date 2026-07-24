import type { DataGridCizgiModu } from './types';

export const DG_SAYFA_BOYUTLARI = [5, 10, 25, 50] as const;

export const DG_CIZGI_MODLARI: {
  mod: DataGridCizgiModu;
  etiket: string;
}[] = [
  { mod: 'yok', etiket: 'Çizgisiz' },
  { mod: 'yatay', etiket: 'Yatay çizgiler' },
  { mod: 'dikey', etiket: 'Dikey çizgiler' },
  { mod: 'tam', etiket: 'Tam ızgara' },
];
