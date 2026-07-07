import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import type {
  PsSatisRaporFiltre,
  PsSatisRaporSatiri,
} from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/tipler';
import { ORNEK_PS_SATISLAR } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/varsayilanVeri';

export function psUrunFiltreSecenekleri(): string[] {
  const katalog = TANIMLAR_URUN_KATALOGU.map((u) => u.ad);
  const rapordan = ORNEK_PS_SATISLAR.map((s) => s.urun);
  return [...new Set([...katalog, ...rapordan])].sort((a, b) => a.localeCompare(b, 'tr'));
}

export function psSatislariFiltrele(
  kaynak: PsSatisRaporSatiri[],
  filtre: PsSatisRaporFiltre
): PsSatisRaporSatiri[] {
  const bas = new Date(filtre.baslangic);
  const bit = new Date(filtre.bitis);

  return kaynak.filter((s) => {
    const t = new Date(s.tarihSaat);
    if (!Number.isNaN(bas.getTime()) && t < bas) return false;
    if (!Number.isNaN(bit.getTime()) && t > bit) return false;
    if (filtre.urun && s.urun !== filtre.urun) return false;
    if (filtre.sube && filtre.sube !== 'Tümü' && s.sube !== filtre.sube) return false;
    if (filtre.departman && filtre.departman !== 'Tümü' && s.departman !== filtre.departman) return false;
    return true;
  });
}

export function psSatisVerisiYenile(): PsSatisRaporSatiri[] {
  return ORNEK_PS_SATISLAR.map((s) => ({ ...s }));
}
