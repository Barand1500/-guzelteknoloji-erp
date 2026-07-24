import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';
import { gecerliParaBirimi } from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';
import type {
  IsaretliFiyatAlani,
  StokFiyatDuzenleSatir,
  StokFiyatKdvTipi,
  StokFiyatPbAlani,
} from './fiyatDuzenleTipler';

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
  alan: StokFiyatPbAlani,
  deger: unknown
): StokFiyatDuzenleSatir {
  return fiyatDuzenleSatirGuncelle(satir, {
    [alan]: gecerliParaBirimi(String(deger)),
  });
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

export function kdvTipiEtiketi(tip: StokFiyatKdvTipi): string {
  return tip === 'haric' ? 'H' : 'D';
}

/** İşaretli alanı baz alıp diğer alana kopyala (%0 — aynı tutar) */
export function digerFiyatlariHesapla(
  satirlar: StokFiyatDuzenleSatir[],
  isaretliAlan: IsaretliFiyatAlani,
  hedefIdler?: string[]
): StokFiyatDuzenleSatir[] {
  const hedefSet = hedefIdler?.length ? new Set(hedefIdler) : null;
  const hedefAlan: IsaretliFiyatAlani =
    isaretliAlan === 'alisFiyati' ? 'satisFiyati1' : 'alisFiyati';

  return satirlar.map((satir) => {
    if (hedefSet && !hedefSet.has(satir.id)) return satir;
    const baz = satir[isaretliAlan];
    if (baz === null || !Number.isFinite(baz)) return satir;
    return { ...satir, [hedefAlan]: baz };
  });
}
