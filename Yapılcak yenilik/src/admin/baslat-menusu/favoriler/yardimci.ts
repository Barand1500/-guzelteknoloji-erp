import { favoriKayitOlustur, type FavoriKayit } from '@/admin/baslat-menusu/favoriler/tipler';
import { favoriUrunListesi } from '@/admin/baslat-menusu/favoriler/urunKaynagi';
import { urunTanimlariKaydet, urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';

const STORAGE_KEY = 'restorant-favoriler';

export function favoriKaydiOku(): FavoriKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (ham) {
      const parsed = JSON.parse(ham) as Partial<FavoriKayit>;
      if (parsed.atamalar && typeof parsed.atamalar === 'object') {
        return { atamalar: { ...parsed.atamalar } };
      }
    }
  } catch {
    /* yedek */
  }
  return favoriKayitOlustur(favoriUrunListesi());
}

export function favoriKaydiKaydet(kayit: FavoriKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));

  const urunKayit = urunTanimlariOku();
  const guncel = urunKayit.urunler.map((u) =>
    kayit.atamalar[u.id] !== undefined ? { ...u, favori: kayit.atamalar[u.id] } : u
  );
  urunTanimlariKaydet({ urunler: guncel });
}
