import type { AdminCari, CariFormDegeri, CariIletisimKisi, CariTipi, IsletmeTuru } from '@/admin/baslat-menusu/erp/cari/tipler';
import { bosCariForm, FATURA_TIPLERI } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariDosyaDokumanGetir } from '@/admin/baslat-menusu/erp/cari/cariDosyaDokumanDeposu';
import { cariEirsaliyeAliasGetir } from '@/admin/baslat-menusu/erp/cari/cariEirsaliyeAliasDeposu';
import { cariIletisimGetir } from '@/admin/baslat-menusu/erp/cari/cariIletisimDeposu';

const FATURA_TIPI_KODLARI = new Set<string>(FATURA_TIPLERI.map((t) => t.value));

function faturaTipiNormalize(tip: string): string {
  const ham = tip.trim().toLocaleUpperCase('tr');
  const v = ham.replace(/\s+/g, '_').replace(/-/g, '_');
  if (v === 'TICARI_FATURA') return 'TICARI';
  /* Eski kayıtlarda fatura tipi olarak E-Arşiv vardı; artık ayrı alan */
  if (v === 'EARSIV' || v === 'E_ARSIV' || v === 'E_ARŞIV') return 'TEMEL';
  if (v === 'IHRACAT' || v === 'İHRACAT') return 'IHRACAT';
  if (v === 'YOLCU_BERABER') return 'YOLCU_BERABER';
  if (FATURA_TIPI_KODLARI.has(v)) return v;
  if (v === 'TICARI') return 'TICARI';
  return 'TEMEL';
}

export function faturaTipiEtiketi(tip: string): string {
  const kod = faturaTipiNormalize(tip);
  return FATURA_TIPLERI.find((t) => t.value === kod)?.label ?? (tip.trim() || 'Temel');
}

function iletisimKisileriniHazirla(c: AdminCari): CariIletisimKisi[] {
  const yetkili = c.yetkili.trim();
  const kayitli = cariIletisimGetir(c.id);

  if (kayitli.length > 0) {
    return kayitli.map((k) => {
      const ad = k.adSoyad.trim();
      const gorevi =
        k.gorevi.trim() ||
        (yetkili && ad && ad.toLocaleUpperCase('tr') === yetkili.toLocaleUpperCase('tr')
          ? 'Yetkili'
          : '');
      return gorevi === k.gorevi ? k : { ...k, gorevi };
    });
  }

  if (!yetkili) return [];

  return [
    {
      id: `ik-yetkili-${c.id}`,
      adresBasligi: '',
      adSoyad: yetkili,
      gorevi: 'Yetkili',
      eposta: c.eposta.trim(),
      telefon: c.telefon.trim(),
      gsm: c.gsm?.trim() ?? '',
      web: c.web?.trim() ?? '',
      il: c.il.trim(),
      ilce: c.ilce.trim(),
      adres: c.adres.trim(),
    },
  ];
}

export function caridenForm(c: AdminCari): CariFormDegeri {
  const eski = (c as AdminCari & { fiyatTanimi?: string }).fiyatTanimi?.trim() ?? '';
  return {
    ustId: c.ustId,
    cariTipi: c.cariTipi,
    isletmeTuru: (c.isletmeTuru as CariFormDegeri['isletmeTuru']) || '',
    cariKodu: c.cariKodu,
    cariAdi: c.cariAdi,
    unvan: c.unvan,
    alisFiyatTanimi: c.alisFiyatTanimi?.trim() || eski,
    alisFiyatSecimi: c.alisFiyatSecimi?.trim() ?? '',
    satisFiyatTanimi: c.satisFiyatTanimi?.trim() || eski,
    satisFiyatSecimi: c.satisFiyatSecimi?.trim() ?? '',
    yetkili: c.yetkili,
    vergiDairesi: c.vergiDairesi,
    vergiNo: c.vergiNo,
    il: c.il,
    ilce: c.ilce,
    adres: c.adres,
    telefon: c.telefon,
    gsm: c.gsm ?? '',
    eposta: c.eposta,
    web: c.web,
    efatura: c.efatura,
    earsiv: c.earsiv ?? false,
    efaturaTipi: c.efatura ? faturaTipiNormalize(c.efaturaTipi) : 'TEMEL',
    alias: c.alias,
    earsivAlias: c.earsivAlias ?? '',
    eirsaliyeAlias: cariEirsaliyeAliasGetir(c.id),
    earsivTeslimSekli: c.earsivTeslimSekli ?? '',
    aktif: c.aktif,
    iletisimKisiler: iletisimKisileriniHazirla(c),
    dosyaDokuman: cariDosyaDokumanGetir(c.id),
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
    alisFiyatTanimi: degerler.alisFiyatTanimi?.trim() ?? '',
    alisFiyatSecimi: degerler.alisFiyatSecimi?.trim() ?? '',
    satisFiyatTanimi: degerler.satisFiyatTanimi?.trim() ?? '',
    satisFiyatSecimi: degerler.satisFiyatSecimi?.trim() ?? '',
    yetkili: degerler.yetkili?.trim() ?? '',
    vergiDairesi: degerler.vergiDairesi?.trim() ?? '',
    vergiNo: degerler.vergiNo?.trim() ?? '',
    il: degerler.il?.trim() ?? '',
    ilce: degerler.ilce?.trim() ?? '',
    adres: degerler.adres?.trim() ?? '',
    telefon: degerler.telefon?.trim() ?? '',
    gsm: degerler.gsm?.trim() ?? '',
    eposta: degerler.eposta?.trim() ?? '',
    web: degerler.web?.trim() ?? '',
    efatura: degerler.efatura === 'true' || degerler.efatura === '1',
    earsiv: degerler.earsiv === 'true' || degerler.earsiv === '1',
    efaturaTipi: degerler.efaturaTipi?.trim() || 'TEMEL',
    alias: degerler.alias?.trim() ?? '',
    earsivAlias: degerler.earsivAlias?.trim() ?? '',
    earsivTeslimSekli: degerler.earsivTeslimSekli?.trim() ?? '',
    aktif: degerler.durum !== 'false',
    iletisimKisiler: [],
  };
}

export function cariSatirEtiketi(c: AdminCari): string {
  return `${c.cariAdi} (${c.cariKodu})`;
}

/** Boş seçim = stok standart fiyat adı (FİYAT) */
export function cariFiyatTanimiCoz(secilen: string): string {
  return secilen.trim() || 'FIYAT';
}
