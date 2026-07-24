import type { DataGridCizgiModu } from './types';

export const DG_SAYFA_BOYUTLARI = [5, 10, 25, 50, 100] as const;

export const DG_CIZGI_MODLARI: {
  mod: DataGridCizgiModu;
  etiket: string;
  ikon: 'cizgi-yok' | 'cizgi-yatay' | 'cizgi-dikey' | 'cizgi-tam';
}[] = [
  { mod: 'yok', etiket: 'Çizgisiz', ikon: 'cizgi-yok' },
  { mod: 'yatay', etiket: 'Yatay çizgiler', ikon: 'cizgi-yatay' },
  { mod: 'dikey', etiket: 'Dikey çizgiler', ikon: 'cizgi-dikey' },
  { mod: 'tam', etiket: 'Tam ızgara', ikon: 'cizgi-tam' },
];
