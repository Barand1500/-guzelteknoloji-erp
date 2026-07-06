import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import { URUN_GRUPLARI } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';
import type { SatisRaporFiltre, SatisRaporSatiri } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';
import { ORNEK_SATISLAR } from '@/admin/baslat-menusu/raporlar/satis-ortak/varsayilanVeri';

export function urunFiltreSecenekleri(): string[] {
  return ['', ...TANIMLAR_URUN_KATALOGU.map((u) => u.ad).sort((a, b) => a.localeCompare(b, 'tr'))];
}

export function urunGrubuFiltreSecenekleri(): string[] {
  return ['', ...URUN_GRUPLARI];
}

export function satislariFiltrele(kaynak: SatisRaporSatiri[], filtre: SatisRaporFiltre): SatisRaporSatiri[] {
  const bas = new Date(filtre.baslangic);
  const bit = new Date(filtre.bitis);

  return kaynak.filter((s) => {
    const t = new Date(s.tarihSaat);
    if (!Number.isNaN(bas.getTime()) && t < bas) return false;
    if (!Number.isNaN(bit.getTime()) && t > bit) return false;
    if (filtre.urun && s.urun !== filtre.urun) return false;
    if (filtre.urunGrubu && s.urunGrubu !== filtre.urunGrubu) return false;
    if (filtre.sube && filtre.sube !== 'Tümü' && s.sube !== filtre.sube) return false;
    if (filtre.departman && filtre.departman !== 'Tümü' && s.departman !== filtre.departman) return false;
    return true;
  });
}

export function satisVerisiYenile(): SatisRaporSatiri[] {
  return ORNEK_SATISLAR.map((s) => ({ ...s }));
}

export function csvIndir(dosyaAdi: string, baslik: string[], satirlar: string[][]) {
  const csv = [baslik, ...satirlar]
    .map((row) => row.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi;
  a.click();
  URL.revokeObjectURL(url);
}
