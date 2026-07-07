import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import { urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';
import type { TartilacakUrunOge } from '@/admin/baslat-menusu/tarilacak-urunler/tipler';

/** Ürün Tanımları + yedek katalogdan birleşik ürün listesi */
export function tartilacakUrunListesi(): TartilacakUrunOge[] {
  const harita = new Map<string, TartilacakUrunOge>();

  for (const u of urunTanimlariOku().urunler) {
    if (!u.ad.trim()) continue;
    harita.set(u.id, {
      id: u.id,
      ad: u.ad,
      grup: u.urunGrubu || 'Diğer',
      stokKodu: u.stokKodu,
    });
  }

  for (const u of TANIMLAR_URUN_KATALOGU) {
    if (!harita.has(u.id)) {
      harita.set(u.id, { id: u.id, ad: u.ad, grup: u.grup, stokKodu: '' });
    }
  }

  return [...harita.values()].sort((a, b) => {
    const g = a.grup.localeCompare(b.grup, 'tr');
    if (g !== 0) return g;
    return a.ad.localeCompare(b.ad, 'tr');
  });
}

export function tartilacakUrunGruplari(urunler: TartilacakUrunOge[]): string[] {
  return [...new Set(urunler.map((u) => u.grup))].sort((a, b) => a.localeCompare(b, 'tr'));
}
