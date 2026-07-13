import type { AdminCari, CariFormDegeri, CariTipi, IsletmeTuru } from '@/admin/baslat-menusu/erp/cari/tipler';
import { bosCariForm } from '@/admin/baslat-menusu/erp/cari/tipler';

export function caridenForm(c: AdminCari): CariFormDegeri {
  return {
    ustId: c.ustId,
    cariTipi: c.cariTipi,
    isletmeTuru: (c.isletmeTuru as CariFormDegeri['isletmeTuru']) || '',
    cariKodu: c.cariKodu,
    cariAdi: c.cariAdi,
    unvan: c.unvan,
    yetkili: c.yetkili,
    vergiDairesi: c.vergiDairesi,
    vergiNo: c.vergiNo,
    il: c.il,
    ilce: c.ilce,
    adres: c.adres,
    telefon: c.telefon,
    eposta: c.eposta,
    web: c.web,
    efatura: c.efatura,
    efaturaTipi: c.efaturaTipi || 'E-ARSIV',
    alias: c.alias,
    aktif: c.aktif,
  };
}

export function gecerliCariTipi(deger: string, varsayilan: CariTipi): CariTipi {
  const v = deger.trim().toUpperCase();
  return v === 'SATICI' || v === 'ALICI' ? v : varsayilan;
}

export function gecerliIsletmeTuru(deger: string, varsayilan: IsletmeTuru | ''): IsletmeTuru | '' {
  const v = deger.trim().toUpperCase();
  if (v === 'TUZEL' || v === 'GERCEK') return v;
  return varsayilan;
}

export function hizliGirisdenForm(degerler: Record<string, string>): CariFormDegeri {
  const kod = (degerler.cariKodu ?? '').trim();
  const ad = (degerler.cariAdi ?? '').trim();
  return {
    ...bosCariForm,
    cariKodu: kod,
    cariAdi: ad,
    cariTipi: gecerliCariTipi(degerler.cariTipi ?? '', 'ALICI'),
    isletmeTuru: gecerliIsletmeTuru(degerler.isletmeTuru ?? '', ''),
    unvan: degerler.unvan?.trim() ?? '',
    yetkili: degerler.yetkili?.trim() ?? '',
    vergiDairesi: degerler.vergiDairesi?.trim() ?? '',
    vergiNo: degerler.vergiNo?.trim() ?? '',
    il: degerler.il?.trim() ?? '',
    ilce: degerler.ilce?.trim() ?? '',
    adres: degerler.adres?.trim() ?? '',
    telefon: degerler.telefon?.trim() ?? '',
    eposta: degerler.eposta?.trim() ?? '',
    web: degerler.web?.trim() ?? '',
    efatura: degerler.efatura === 'true' || degerler.efatura === '1',
    efaturaTipi: degerler.efaturaTipi?.trim() || 'E-ARSIV',
    alias: degerler.alias?.trim() ?? '',
    aktif: degerler.durum !== 'false',
  };
}

export function cariSatirEtiketi(c: AdminCari): string {
  return `${c.cariAdi} (${c.cariKodu})`;
}
