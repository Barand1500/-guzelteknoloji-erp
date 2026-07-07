import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import type { UrunEslestirOge } from '@/admin/baslat-menusu/urun-eslestir/tipler';
import { urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';

let siraSayac = 0;

function sonrakiSira() {
  siraSayac += 1;
  return siraSayac;
}

/** Ürün Tanımları + katalog — stok arama listesi */
export function urunEslestirListesi(): UrunEslestirOge[] {
  const harita = new Map<string, UrunEslestirOge>();
  siraSayac = 0;

  for (const u of urunTanimlariOku().urunler) {
    if (!u.ad.trim()) continue;
    harita.set(u.id, {
      id: u.id,
      stokKodu: u.stokKodu || String(sonrakiSira()),
      ad: u.ad,
      urunGrubu: u.urunGrubu || 'Diğer',
    });
  }

  for (const u of TANIMLAR_URUN_KATALOGU) {
    if (!harita.has(u.id)) {
      harita.set(u.id, {
        id: u.id,
        stokKodu: String(sonrakiSira()),
        ad: u.ad,
        urunGrubu: u.grup,
      });
    }
  }

  return [...harita.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}
