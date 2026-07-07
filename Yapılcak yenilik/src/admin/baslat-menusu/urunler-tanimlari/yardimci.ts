import { varsayilanUrunTanimlariKaydi } from '@/admin/baslat-menusu/urunler-tanimlari/varsayilanVeri';
import { urunTanimiNormalize } from '@/admin/baslat-menusu/urunler-tanimlari/migrate';
import type { UrunTanimlariKayit } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

const STORAGE_KEY = 'restorant-urun-tanimlari';

export function urunTanimlariOku(): UrunTanimlariKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanUrunTanimlariKaydi();
    const parsed = JSON.parse(ham) as Partial<UrunTanimlariKayit>;
    if (!parsed.urunler?.length) return varsayilanUrunTanimlariKaydi();
    return { urunler: parsed.urunler.map((u) => urunTanimiNormalize(u as Parameters<typeof urunTanimiNormalize>[0])) };
  } catch {
    return varsayilanUrunTanimlariKaydi();
  }
}

export function urunTanimlariKaydet(kayit: UrunTanimlariKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function sonrakiStokKodu(urunler: UrunTanimlariKayit['urunler']): string {
  const sayilar = urunler
    .map((u) => u.stokKodu.trim())
    .filter((k) => /^\d+$/.test(k))
    .map((k) => parseInt(k, 10));
  const max = sayilar.length ? Math.max(...sayilar) : -1;
  return String(max + 1).padStart(5, '0');
}
