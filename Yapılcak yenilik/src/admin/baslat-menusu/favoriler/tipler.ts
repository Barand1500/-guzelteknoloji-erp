import { FAVORI_SECENEKLERI } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

export const FAVORI_MENULERI = FAVORI_SECENEKLERI;

export interface FavoriUrunOge {
  id: string;
  ad: string;
  urunGrubu: string;
  faturaGrubu: string;
  favori: string;
}

export interface FavoriKayit {
  atamalar: Record<string, string>;
}

export interface FavoriTabloFiltre {
  ad: string;
  urunGrubu: string;
  faturaGrubu: string;
  favori: string;
}

export function bosFavoriTabloFiltre(): FavoriTabloFiltre {
  return { ad: '', urunGrubu: '', faturaGrubu: '', favori: '' };
}

export function favoriKayitKopyala(k: FavoriKayit): FavoriKayit {
  return { atamalar: { ...k.atamalar } };
}

export function favoriKayitlariEsit(a: FavoriKayit, b: FavoriKayit): boolean {
  const aKeys = Object.keys(a.atamalar);
  const bKeys = Object.keys(b.atamalar);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((id) => a.atamalar[id] === b.atamalar[id]);
}

export function favoriKayitOlustur(urunler: FavoriUrunOge[]): FavoriKayit {
  const atamalar: Record<string, string> = {};
  for (const u of urunler) atamalar[u.id] = u.favori;
  return { atamalar };
}
