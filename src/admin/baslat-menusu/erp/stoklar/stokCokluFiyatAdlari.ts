import { stokFiyatAdlariGetir } from './stokFiyatAdlari';
import type { StokCokluFiyatTur } from './stokCokluFiyatYardimci';

const ANAHTAR = 'erp-stok-coklu-fiyat-adlari-v1';

export interface StokCokluFiyatAdiKayit {
  /** Bağlı fiyat tanımı kodu (FIYAT, PERAKENDE…) */
  fiyatAdi: string;
  tur: StokCokluFiyatTur;
  value: string;
  label: string;
}

export interface StokCokluFiyatAdiSecenek {
  value: string;
  label: string;
}

function kodNormalize(ad: string): string {
  return ad
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
}

/** Satırdaki fiyatAdi etiketini stok fiyat tanımı koduna çevirir */
export function stokFiyatAdiKodu(fiyatAdi: string): string {
  const ham = fiyatAdi.trim();
  if (!ham) return 'FIYAT';
  const normal = kodNormalize(ham);
  const bulunan = stokFiyatAdlariGetir().find(
    (t) =>
      t.value === normal ||
      t.label.toLocaleUpperCase('tr') === ham.toLocaleUpperCase('tr') ||
      t.label.toLocaleUpperCase('tr') === normal.replace(/_/g, ' ')
  );
  return bulunan?.value ?? (normal || 'FIYAT');
}

function oku(): StokCokluFiyatAdiKayit[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as StokCokluFiyatAdiKayit[];
      if (Array.isArray(liste)) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [];
}

function yaz(liste: StokCokluFiyatAdiKayit[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

/** Çoklu fiyat açıklamasını ilgili fiyat tanımı + alış/satış altına kaydeder */
export function stokCokluFiyatAdiKaydet(
  fiyatAdi: string,
  tur: StokCokluFiyatTur,
  aciklama: string
): StokCokluFiyatAdiKayit | null {
  const label = aciklama.trim();
  if (!label) return null;
  const fiyatKodu = stokFiyatAdiKodu(fiyatAdi);
  const value = kodNormalize(label) || `FIYAT_${Date.now()}`;
  const mevcut = oku();
  if (
    mevcut.some(
      (t) =>
        t.fiyatAdi === fiyatKodu &&
        t.tur === tur &&
        (t.value === value || t.label.toLocaleLowerCase('tr') === label.toLocaleLowerCase('tr'))
    )
  ) {
    return null;
  }
  const yeni: StokCokluFiyatAdiKayit = { fiyatAdi: fiyatKodu, tur, value, label };
  yaz([...mevcut, yeni]);
  return yeni;
}

/** Cari combobox — Ana Fiyat + o fiyat tanımındaki çoklu alış/satış açıklamaları */
export function stokCokluFiyatAdlariGetir(
  fiyatAdi: string,
  tur: StokCokluFiyatTur
): StokCokluFiyatAdiSecenek[] {
  const fiyatKodu = stokFiyatAdiKodu(fiyatAdi || 'FIYAT');
  const ekler = oku()
    .filter((t) => t.fiyatAdi === fiyatKodu && t.tur === tur)
    .map((t) => ({ value: t.value, label: t.label }));
  return [{ value: '', label: 'Ana Fiyat' }, ...ekler];
}
