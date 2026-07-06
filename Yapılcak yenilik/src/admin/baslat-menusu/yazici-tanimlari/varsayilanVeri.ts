import { YAZICI_TUMU, type YaziciTanimlariKayit } from '@/admin/baslat-menusu/yazici-tanimlari/tipler';

export function varsayilanYaziciTanimlariKaydi(): YaziciTanimlariKayit {
  return {
    mutfak: [
      {
        id: 'my-1',
        bilgisayar: YAZICI_TUMU,
        masaPrefix: YAZICI_TUMU,
        garson: YAZICI_TUMU,
        urunGrubu: YAZICI_TUMU,
        urun: YAZICI_TUMU,
        yazici: 'MUTFAK',
        mutfakEkrani: '',
      },
    ],
    pusula: [
      {
        id: 'by-1',
        bilgisayar: YAZICI_TUMU,
        garson: YAZICI_TUMU,
        yazici: 'PUSULA',
      },
    ],
    resmiAdisyon: [],
  };
}
