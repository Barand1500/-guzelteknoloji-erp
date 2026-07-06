import { varsayilanCariKaydi } from '@/admin/baslat-menusu/cari-tanimlari/varsayilanVeri';
import type { CariKayit, CariTanim } from '@/admin/baslat-menusu/cari-tanimlari/tipler';
import { cariTanimKopyala } from '@/admin/baslat-menusu/cari-tanimlari/tipler';

const STORAGE_KEY = 'restorant-cari-tanimlari';

export function cariKaydiOku(): CariKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return cariKayitKopyala(varsayilanCariKaydi);
    const parsed = JSON.parse(ham) as CariKayit;
    if (!parsed?.cariler?.length) return cariKayitKopyala(varsayilanCariKaydi);
    return parsed;
  } catch {
    return cariKayitKopyala(varsayilanCariKaydi);
  }
}

export function cariKaydiKaydet(kayit: CariKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

function cariKayitKopyala(kayit: CariKayit): CariKayit {
  return { cariler: kayit.cariler.map(cariTanimKopyala) };
}

export function sonrakiCariId(cariler: CariTanim[]): number {
  return cariler.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

export function cariFiltreEslesir(cari: CariTanim, filtre: string): boolean {
  const q = filtre.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return (
    cari.ad.toLocaleLowerCase('tr').includes(q) ||
    cari.telefon.includes(q) ||
    cari.kod.includes(q) ||
    cari.kartNo.includes(q) ||
    cari.unvan.toLocaleLowerCase('tr').includes(q)
  );
}
