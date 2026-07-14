import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';
import type {
  IsaretliFiyatAlani,
  StokFiyatDuzenleSatir,
  StokFiyatKdvTipi,
  StokFiyatPb,
} from './fiyatDuzenleTipler';
import { FIYAT_ALAN_CARPANLARI } from './fiyatDuzenleTipler';

const FIYAT_ALANLARI: IsaretliFiyatAlani[] = [
  'satisFiyati1',
  'satisFiyati2',
  'satisFiyati3',
  'satisFiyati4',
  'satisFiyati5',
];

function sayiYaz(deger: unknown, mevcut: number | null): number | null {
  if (deger === '' || deger === null || deger === undefined) return null;
  if (typeof deger === 'number') return Number.isFinite(deger) ? deger : mevcut;
  const hesap = ifadeHesapla(String(deger), 'sayi');
  return hesap ?? mevcut;
}

export function fiyatDuzenleSatirGuncelle(
  satir: StokFiyatDuzenleSatir,
  patch: Partial<StokFiyatDuzenleSatir>
): StokFiyatDuzenleSatir {
  return { ...satir, ...patch };
}

export function fiyatDuzenleKdvTipiYaz(
  satir: StokFiyatDuzenleSatir,
  deger: unknown
): StokFiyatDuzenleSatir {
  const tip = String(deger) === 'haric' ? 'haric' : 'dahil';
  return fiyatDuzenleSatirGuncelle(satir, { kdvTipi: tip });
}

export function fiyatDuzenlePbYaz(
  satir: StokFiyatDuzenleSatir,
  alan: 'pb1' | 'pb2' | 'pb3' | 'pb4' | 'pb5',
  deger: unknown
): StokFiyatDuzenleSatir {
  const pb = String(deger) as StokFiyatPb;
  return fiyatDuzenleSatirGuncelle(satir, { [alan]: pb === 'USD' || pb === 'EUR' ? pb : 'TL' });
}

export function fiyatDuzenleFiyatYaz(
  satir: StokFiyatDuzenleSatir,
  alan: IsaretliFiyatAlani,
  deger: unknown
): StokFiyatDuzenleSatir {
  return fiyatDuzenleSatirGuncelle(satir, { [alan]: sayiYaz(deger, satir[alan]) });
}

export function fiyatDuzenleKdvYaz(
  satir: StokFiyatDuzenleSatir,
  deger: unknown
): StokFiyatDuzenleSatir {
  const kdv = sayiYaz(deger, satir.kdv);
  return fiyatDuzenleSatirGuncelle(satir, { kdv: kdv ?? satir.kdv });
}

export function fiyatDuzenleCarpanYaz(
  satir: StokFiyatDuzenleSatir,
  deger: unknown
): StokFiyatDuzenleSatir {
  const carpan = sayiYaz(deger, satir.carpan);
  return fiyatDuzenleSatirGuncelle(satir, { carpan: carpan ?? satir.carpan });
}

export function digerFiyatlariHesapla(
  satirlar: StokFiyatDuzenleSatir[],
  isaretliAlan: IsaretliFiyatAlani,
  hedefIdler?: string[]
): StokFiyatDuzenleSatir[] {
  const hedefSet = hedefIdler?.length ? new Set(hedefIdler) : null;
  const bazCarpan = FIYAT_ALAN_CARPANLARI[isaretliAlan];

  return satirlar.map((satir) => {
    if (hedefSet && !hedefSet.has(satir.id)) return satir;
    const baz = satir[isaretliAlan];
    if (baz === null || !Number.isFinite(baz)) return satir;

    const guncel = { ...satir };
    for (const alan of FIYAT_ALANLARI) {
      if (alan === isaretliAlan) continue;
      const oran = FIYAT_ALAN_CARPANLARI[alan] / bazCarpan;
      guncel[alan] = Math.round(baz * oran * 100) / 100;
    }
    return guncel;
  });
}

export function kdvTipiEtiketi(tip: StokFiyatKdvTipi): string {
  return tip === 'dahil' ? 'D' : 'H';
}
