import type { FirmaDonemKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/tipler';
import { bosFirmaDonemKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/tipler';

const STORAGE_KEY = 'restorant-firma-donem-secimi';

export function firmaDonemKaydiOku(): FirmaDonemKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return bosFirmaDonemKayit();
    const parsed = JSON.parse(ham) as Partial<FirmaDonemKayit>;
    return {
      firma: String(parsed.firma ?? ''),
      donem: String(parsed.donem ?? ''),
      depo: String(parsed.depo ?? ''),
      sube: String(parsed.sube ?? ''),
      kasa: String(parsed.kasa ?? ''),
    };
  } catch {
    return bosFirmaDonemKayit();
  }
}

export function firmaDonemKaydiKaydet(kayit: FirmaDonemKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function firmaDonemKayitEsit(a: FirmaDonemKayit, b: FirmaDonemKayit) {
  return (
    a.firma === b.firma &&
    a.donem === b.donem &&
    a.depo === b.depo &&
    a.sube === b.sube &&
    a.kasa === b.kasa
  );
}

export function firmaDonemSecimGecerli(kayit: FirmaDonemKayit) {
  return (
    kayit.firma.trim().length > 0 &&
    kayit.donem.trim().length > 0 &&
    kayit.depo.trim().length > 0 &&
    kayit.sube.trim().length > 0 &&
    kayit.kasa.trim().length > 0
  );
}
