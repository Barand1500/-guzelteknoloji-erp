import type {
  AdminBankaAnlasma,
  BankaAnlasmaFormDegeri,
  BankaKisimId,
  PosKomisyonSatir,
} from './tipler';
import { bosBankaAnlasmaForm, bosPosKomisyonSatir } from './tipler';
import { hesapTipiEtiketi } from './hesapTipleri';

export { hesapTipiEtiketi };

function posSatirlariNormalize(liste?: PosKomisyonSatir[]): PosKomisyonSatir[] {
  if (!Array.isArray(liste)) return [];
  return liste.map((s) => ({
    id: s.id || bosPosKomisyonSatir().id,
    kartAdi: s.kartAdi ?? '',
    satisSekli: s.satisSekli ?? '',
    komisyon: s.komisyon ?? '',
    puan: s.puan ?? '',
    blokeGun: s.blokeGun ?? '',
    tahsilatSekli: s.tahsilatSekli ?? '',
  }));
}

export function bankaAnlasmadanForm(k: AdminBankaAnlasma): BankaAnlasmaFormDegeri {
  return {
    hesapTipi: k.hesapTipi,
    hesapIsmi: k.hesapIsmi,
    bankaKodu: k.bankaKodu,
    bankaSubesi: k.bankaSubesi ?? '',
    bankaSubeKodu: k.bankaSubeKodu ?? '',
    hesapNumarasi: k.hesapNumarasi ?? '',
    ibanModu: k.ibanModu ?? 'TR',
    iban: k.iban ?? '',
    dovizCinsi: k.dovizCinsi,
    kartNo: k.kartNo ?? '',
    sonKullanmaTarihi: k.sonKullanmaTarihi ?? '',
    hesapKesimGunu: k.hesapKesimGunu ?? '',
    odemeGunu: k.odemeGunu ?? '',
    kartLimiti: k.kartLimiti ?? '',
    kartTuru: k.kartTuru ?? '',
    anlasmaNo: k.anlasmaNo ?? '',
    baslangicTarihi: k.baslangicTarihi ?? '',
    bitisTarihi: k.bitisTarihi ?? '',
    komisyonUygulamaTipi: k.komisyonUygulamaTipi ?? 'ILK_TAKSITTEN',
    puanUygulamaTipi: k.puanUygulamaTipi ?? 'KOMISYON_ILE_AYNI',
    valor: Boolean(k.valor),
    posKomisyonSatirlari: posSatirlariNormalize(k.posKomisyonSatirlari),
    iletisimKisiler: k.iletisimKisiler ?? [],
    acikKisismlar: k.acikKisismlar?.length
      ? k.acikKisismlar
      : (['adres-iletisim'] satisfies BankaKisimId[]),
    aktif: k.aktif,
  };
}

export function bankaAnlasmaSatirEtiketi(k: AdminBankaAnlasma): string {
  return k.hesapIsmi.trim() || 'Adsız hesap';
}

/** Ödeme / kesim / bloke günü */
export function gunSayisiFiltrele(deger: string, max = 31): string {
  const sadeceRakam = deger.replace(/\D/g, '').slice(0, String(max).length);
  if (!sadeceRakam) return '';
  const n = Number(sadeceRakam);
  if (n < 1) return sadeceRakam;
  if (n > max) return String(max);
  return String(n);
}

/** Kart son kullanma: AA/YY */
export function sonKullanmaFiltrele(deger: string): string {
  const rakam = deger.replace(/\D/g, '').slice(0, 4);
  if (rakam.length <= 2) return rakam;
  return `${rakam.slice(0, 2)}/${rakam.slice(2)}`;
}

/** Kart no: boşluklu 4’lü grup */
export function kartNoFiltrele(deger: string): string {
  const rakam = deger.replace(/\D/g, '').slice(0, 16);
  return rakam.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Kart limiti / komisyon: binlik ayırıcılı */
export function kartLimitiFiltrele(deger: string): string {
  const ham = deger.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const [tam = '', kesir] = ham.split('.');
  const temizTam = tam.replace(/\D/g, '');
  if (!temizTam && kesir === undefined) return '';
  const binlik = temizTam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (kesir !== undefined) {
    return `${binlik || '0'},${kesir.replace(/\D/g, '').slice(0, 2)}`;
  }
  return binlik;
}

export function bankaAnlasmaFormDogrula(form: BankaAnlasmaFormDegeri): string | null {
  if (!form.hesapIsmi.trim()) return 'Hesap ismi zorunludur';
  if (form.hesapTipi === 'BANKA') {
    if (!form.bankaKodu.trim()) return 'Banka seçimi zorunludur';
    if (form.ibanModu === 'TR') {
      const govde = form.iban.replace(/^TR/i, '').replace(/\s+/g, '');
      if (govde && govde.length < 24) return 'TR IBAN 24 hane olmalıdır';
    }
  }
  if (form.hesapTipi === 'KREDI') {
    if (!form.bankaKodu.trim()) return 'Banka seçimi zorunludur';
    if (!form.kartTuru) return 'Kart türü (Ticari / Bireysel) seçiniz';
    const kartRakam = form.kartNo.replace(/\D/g, '');
    if (kartRakam && kartRakam.length < 15) return 'Kart numarası en az 15 hane olmalıdır';
    if (form.sonKullanmaTarihi && !/^\d{2}\/\d{2}$/.test(form.sonKullanmaTarihi)) {
      return 'Son kullanma tarihi AA/YY formatında olmalıdır';
    }
  }
  if (form.hesapTipi === 'POS') {
    if (!form.bankaKodu.trim()) return 'Banka seçimi zorunludur';
    if (
      form.baslangicTarihi &&
      form.bitisTarihi &&
      form.bitisTarihi < form.baslangicTarihi
    ) {
      return 'Bitiş tarihi başlangıçtan önce olamaz';
    }
  }
  return null;
}

export function tipDegisinceFormTemizle(
  form: BankaAnlasmaFormDegeri,
  hesapTipi: string
): BankaAnlasmaFormDegeri {
  const temel = {
    ...form,
    hesapTipi,
    bankaSubesi: '',
    bankaSubeKodu: '',
    hesapNumarasi: '',
    iban: '',
    ibanModu: 'TR' as const,
    kartNo: '',
    sonKullanmaTarihi: '',
    hesapKesimGunu: '',
    odemeGunu: '',
    kartLimiti: '',
    kartTuru: '' as const,
    anlasmaNo: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    komisyonUygulamaTipi: 'ILK_TAKSITTEN' as const,
    puanUygulamaTipi: 'KOMISYON_ILE_AYNI' as const,
    valor: false,
    posKomisyonSatirlari: [] as PosKomisyonSatir[],
  };

  if (hesapTipi === 'BANKA') {
    return {
      ...temel,
      dovizCinsi: form.dovizCinsi || 'TRY',
    };
  }
  if (hesapTipi === 'KREDI') {
    return {
      ...temel,
      dovizCinsi: form.dovizCinsi || 'TRY',
    };
  }
  if (hesapTipi === 'POS') {
    return {
      ...temel,
      dovizCinsi: '',
      komisyonUygulamaTipi: 'ILK_TAKSITTEN',
      puanUygulamaTipi: 'KOMISYON_ILE_AYNI',
      posKomisyonSatirlari: [],
    };
  }
  return temel;
}

export function bosFormKopyala(): BankaAnlasmaFormDegeri {
  return {
    ...bosBankaAnlasmaForm,
    iletisimKisiler: [],
    posKomisyonSatirlari: [],
    acikKisismlar: ['adres-iletisim'],
  };
}
