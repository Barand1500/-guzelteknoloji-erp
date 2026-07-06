import type { UrunSecenekKategori, UrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';
import { bosUrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';
import { bosFiyatListesi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';

function yeniKategoriId() {
  return `kat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function kategoriNormalize(
  ham: unknown,
  secenekKategorileri: string[]
): UrunSecenekKategori[] {
  if (Array.isArray(ham) && ham.length > 0) {
    if (typeof ham[0] === 'string') {
      return (ham as string[]).map((ad, i) => ({
        id: yeniKategoriId(),
        sira: i + 1,
        kategori: ad,
        enAzSecim: 0,
        enFazlaSecim: 1,
      }));
    }
    return (ham as Partial<UrunSecenekKategori>[]).map((k, i) => ({
      id: k.id ?? yeniKategoriId(),
      sira: k.sira ?? i + 1,
      kategori: k.kategori ?? '',
      enAzSecim: k.enAzSecim ?? 0,
      enFazlaSecim: k.enFazlaSecim ?? 1,
    }));
  }

  const adlar = [...new Set(secenekKategorileri.filter(Boolean))];
  return adlar.map((ad, i) => ({
    id: yeniKategoriId(),
    sira: i + 1,
    kategori: ad,
    enAzSecim: 0,
    enFazlaSecim: 1,
  }));
}

/** Eski localStorage kayıtlarını yeni alanlarla uyumlu hale getirir */
export function urunTanimiNormalize(ham: Partial<UrunTanimi> & { id: string }): UrunTanimi {
  const temel = bosUrunTanimi(ham.id, ham.sira ?? 1);
  const secenekler = (ham.secenekler ?? []).map((s) => ({
    ...s,
    fiyatListeleri: s.fiyatListeleri ?? bosFiyatListesi(),
  }));
  const secenekKategorileri = kategoriNormalize(
    ham.secenekKategorileri,
    secenekler.map((s) => s.kategori)
  );

  return {
    ...temel,
    ...ham,
    fiyatListeleri: ham.fiyatListeleri ?? bosFiyatListesi(),
    secenekKategorileri,
    seviye1: (ham.seviye1 ?? []).map((s) => ({
      ...s,
      fiyatListeleri: s.fiyatListeleri ?? bosFiyatListesi(),
    })),
    seviye2: (ham.seviye2 ?? []).map((s) => ({
      ...s,
      fiyatListeleri: s.fiyatListeleri ?? bosFiyatListesi(),
    })),
    secenekler,
  };
}
