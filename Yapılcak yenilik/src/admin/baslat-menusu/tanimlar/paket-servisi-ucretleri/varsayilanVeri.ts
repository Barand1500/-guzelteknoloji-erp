import type { PaketServisUcretKurali } from '@/admin/baslat-menusu/tanimlar/paket-servisi-ucretleri/tipler';

export const PAKET_SERVIS_VARSAYILAN_KURALLAR: PaketServisUcretKurali[] = [
  {
    id: 1,
    tutaraKadar: '100',
    servisUrunu: '',
    ucretTipi: 'tutar',
    ucretDegeri: '25',
  },
  {
    id: 2,
    tutaraKadar: '250',
    servisUrunu: '',
    ucretTipi: 'oran',
    ucretDegeri: '5',
  },
  {
    id: 3,
    tutaraKadar: '500',
    servisUrunu: '',
    ucretTipi: 'tutar',
    ucretDegeri: '15',
  },
];
