import type { RaporSablonTipi, RaporYazdirAyar } from '@/admin/baslat-menusu/raporlar/ortak/tipler';
import { varsayilanRaporYazdirAyar } from '@/admin/baslat-menusu/raporlar/ortak/tipler';

function storageKey(tip: RaporSablonTipi) {
  return `restorant-rapor-yazdir-${tip}`;
}

export function raporYazdirAyarOku(tip: RaporSablonTipi): RaporYazdirAyar {
  try {
    const ham = localStorage.getItem(storageKey(tip));
    if (!ham) return varsayilanRaporYazdirAyar(tip);
    const parsed = JSON.parse(ham) as Partial<RaporYazdirAyar>;
    return {
      yazici: String(parsed.yazici ?? varsayilanRaporYazdirAyar(tip).yazici),
      sablon: String(parsed.sablon ?? varsayilanRaporYazdirAyar(tip).sablon),
    };
  } catch {
    return varsayilanRaporYazdirAyar(tip);
  }
}

export function raporYazdirAyarKaydet(tip: RaporSablonTipi, ayar: RaporYazdirAyar) {
  localStorage.setItem(storageKey(tip), JSON.stringify(ayar));
}

export function ozelSablonlarOku(tip: RaporSablonTipi): string[] {
  try {
    const ham = localStorage.getItem(`${storageKey(tip)}-ozel`);
    if (!ham) return [];
    const parsed = JSON.parse(ham);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function ozelSablonEkle(tip: RaporSablonTipi, dosya: string) {
  const liste = ozelSablonlarOku(tip);
  if (liste.includes(dosya)) return liste;
  const yeni = [...liste, dosya];
  localStorage.setItem(`${storageKey(tip)}-ozel`, JSON.stringify(yeni));
  return yeni;
}
