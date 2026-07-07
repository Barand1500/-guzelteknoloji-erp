import type { TahsilatTaramaFiltre, TahsilatTaramaSatiri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';
import { ORNEK_TAHSILATLAR } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/varsayilanVeri';

export function tahsilatlariFiltrele(filtre: TahsilatTaramaFiltre): TahsilatTaramaSatiri[] {
  return ORNEK_TAHSILATLAR.filter((s) => {
    if (filtre.sube && filtre.sube !== 'Tümü' && s.sube !== filtre.sube) return false;
    if (filtre.departman && filtre.departman !== 'Tümü' && s.departman !== filtre.departman) return false;
    return true;
  });
}

export function tahsilatVerisiYenile(): TahsilatTaramaSatiri[] {
  return ORNEK_TAHSILATLAR.map((s) => ({ ...s }));
}
