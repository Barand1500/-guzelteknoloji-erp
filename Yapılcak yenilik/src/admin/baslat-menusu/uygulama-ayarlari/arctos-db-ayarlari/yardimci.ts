import type { ArctosDbKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/tipler';
import { bosArctosDbKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/tipler';

const STORAGE_KEY = 'restorant-arctos-db-ayarlari';

export function arctosDbKaydiOku(): ArctosDbKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return bosArctosDbKayit();
    const parsed = JSON.parse(ham) as Partial<ArctosDbKayit>;
    return {
      sunucu: String(parsed.sunucu ?? ''),
      kullaniciAdi: String(parsed.kullaniciAdi ?? ''),
      kullaniciParola: String(parsed.kullaniciParola ?? ''),
      veritabani: String(parsed.veritabani ?? ''),
    };
  } catch {
    return bosArctosDbKayit();
  }
}

export function arctosDbKaydiKaydet(kayit: ArctosDbKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function arctosDbKayitEsit(a: ArctosDbKayit, b: ArctosDbKayit) {
  return (
    a.sunucu === b.sunucu &&
    a.kullaniciAdi === b.kullaniciAdi &&
    a.kullaniciParola === b.kullaniciParola &&
    a.veritabani === b.veritabani
  );
}

export function arctosDbBaglantiGecerli(kayit: ArctosDbKayit) {
  return (
    kayit.sunucu.trim().length > 0 &&
    kayit.kullaniciAdi.trim().length > 0 &&
    kayit.veritabani.trim().length > 0
  );
}
