import { varsayilanMenuKaydi } from '@/admin/baslat-menusu/menu-tanimlari/varsayilanVeri';
import type { MenuKayit, MenuTanim } from '@/admin/baslat-menusu/menu-tanimlari/tipler';
import { menuTanimKopyala } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

const STORAGE_KEY = 'restorant-menu-tanimlari';

export function menuKaydiOku(): MenuKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanMenuKaydi();
    const parsed = JSON.parse(ham) as Partial<MenuKayit>;
    if (!parsed.menuler?.length) return varsayilanMenuKaydi();
    return { menuler: parsed.menuler };
  } catch {
    return varsayilanMenuKaydi();
  }
}

export function menuKaydiKaydet(kayit: MenuKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function menuKayitlariEsit(a: MenuKayit, b: MenuKayit): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function sonrakiMenuId(menuler: MenuTanim[]): number {
  return menuler.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

export function menuTanimEsit(a: MenuTanim, b: MenuTanim): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function taslakTemizle(taslak: MenuTanim): MenuTanim {
  return menuTanimKopyala(taslak);
}
