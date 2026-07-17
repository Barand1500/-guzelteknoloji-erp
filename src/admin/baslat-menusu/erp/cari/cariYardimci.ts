import type {
  AdminCari,
  CariFormDegeri,
  CariKartForm,
  CariTipi,
  IsletmeTuru,
} from '@/admin/baslat-menusu/erp/cari/tipler';
import {
  bosCariForm,
  bosCariKartForm,
  kartTipindenApiCariTipi,
} from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariEkAlanlariGetir } from '@/admin/baslat-menusu/erp/cari/cariEkAlanlar';

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

function yetkiliParcala(yetkili: string): { adi: string; soyadi: string } {
  const parcalar = yetkili.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length === 0) return { adi: '', soyadi: '' };
  if (parcalar.length === 1) return { adi: parcalar[0], soyadi: '' };
  return { adi: parcalar[0], soyadi: parcalar.slice(1).join(' ') };
}

export function caridenKartForm(c: AdminCari): CariKartForm {
  const ek = cariEkAlanlariGetir(c.id);
  const yetkili = yetkiliParcala(c.yetkili);
  const taban = bosCariKartForm();
  return {
    ...taban,
    ...ek,
    firmaKodu: c.cariKodu,
    firmaAdi: c.cariAdi,
    unvan: c.unvan,
    yetkiliAdi: ek.yetkiliAdi ?? yetkili.adi,
    yetkiliSoyadi: ek.yetkiliSoyadi ?? yetkili.soyadi,
    kartTipi: ek.kartTipi ?? c.cariTipi,
    isletmeTuru: ((ek.isletmeTuru || c.isletmeTuru) as string) || '',
    aktif: c.aktif,
    ustId: c.ustId,
    vergiDairesi: ek.vergiDairesi ?? c.vergiDairesi,
    vergiNo: ek.vergiNo ?? c.vergiNo,
    postaAdresi: ek.postaAdresi ?? c.adres,
    ilce: ek.ilce ?? c.ilce,
    sehir: ek.sehir ?? c.il,
    tel1: ek.tel1 ?? c.telefon,
    eposta: ek.eposta ?? c.eposta,
    url: ek.url ?? c.web,
    efaturaKullanicisi: ek.efaturaKullanicisi ?? c.efatura,
    efaturaSenaryo: ek.efaturaSenaryo ?? c.efaturaTipi,
    efaturaAlias: ek.efaturaAlias ?? c.alias,
  };
}

export function kartFormdanApiForm(form: CariKartForm): CariFormDegeri {
  const yetkili = [form.yetkiliAdi, form.yetkiliSoyadi].map((s) => s.trim()).filter(Boolean).join(' ');
  const kimlik =
    form.isletmeTuru === 'GERCEK'
      ? form.tcKimlikNo
      : form.isletmeTuru === 'YABANCI'
        ? form.pasaportNo
        : form.vergiNo;
  return {
    ustId: form.ustId,
    cariTipi: kartTipindenApiCariTipi(form.kartTipi),
    isletmeTuru: form.isletmeTuru,
    cariKodu: form.firmaKodu,
    cariAdi: form.firmaAdi,
    unvan: form.unvan,
    yetkili,
    vergiDairesi: form.isletmeTuru === 'TUZEL' || !form.isletmeTuru ? form.vergiDairesi : '',
    vergiNo: kimlik,
    il: form.sehir,
    ilce: form.ilce,
    adres: form.postaAdresi,
    telefon: form.tel1 || form.gsm,
    eposta: form.eposta,
    web: form.url,
    efatura: form.efaturaKullanicisi,
    efaturaTipi: form.efaturaSenaryo || 'E-ARSIV',
    alias: form.efaturaAlias,
    aktif: form.aktif,
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
