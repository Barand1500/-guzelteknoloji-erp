import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import type { FavoriUrunOge } from '@/admin/baslat-menusu/favoriler/tipler';
import { urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';

/** Ürün Tanımları + yedek katalogdan birleşik favori ürün listesi */
export function favoriUrunListesi(): FavoriUrunOge[] {
  const harita = new Map<string, FavoriUrunOge>();

  for (const u of urunTanimlariOku().urunler) {
    if (!u.ad.trim()) continue;
    harita.set(u.id, {
      id: u.id,
      ad: u.ad,
      urunGrubu: u.urunGrubu || 'Diğer',
      faturaGrubu: u.faturaGrubu || 'Yiyecek',
      favori: u.favori || 'Yok',
    });
  }

  for (const u of TANIMLAR_URUN_KATALOGU) {
    if (!harita.has(u.id)) {
      harita.set(u.id, {
        id: u.id,
        ad: u.ad,
        urunGrubu: u.grup,
        faturaGrubu: 'Yiyecek',
        favori: 'Yok',
      });
    }
  }

  return [...harita.values()].sort((a, b) => {
    const g = a.urunGrubu.localeCompare(b.urunGrubu, 'tr');
    if (g !== 0) return g;
    return a.ad.localeCompare(b.ad, 'tr');
  });
}
