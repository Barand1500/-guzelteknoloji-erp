import type { CariIletisimKisi } from '@/admin/baslat-menusu/erp/cari/tipler';
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
    kartSegment: s.kartSegment === 'TICARI' ? 'TICARI' : 'BIREYSEL',
    kartAdi: s.kartAdi ?? '',
    satisSekli: s.satisSekli ?? '',
    komisyon: s.komisyon ?? '',
    puan: s.puan ?? '',
    blokeGun: s.blokeGun ?? '',
    tahsilatSekli: s.tahsilatSekli ?? '',
  }));
}

function iletisimNormalize(liste?: CariIletisimKisi[]): CariIletisimKisi[] {
  if (!Array.isArray(liste)) return [];
  return liste.map((k) => ({
    id: k.id || `ik-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    adresBasligi: k.adresBasligi ?? '',
    adSoyad: k.adSoyad ?? '',
    gorevi: k.gorevi ?? '',
    eposta: k.eposta ?? '',
    telefon: k.telefon ?? '',
    telefonDahili: String(k.telefonDahili ?? '').replace(/\D/g, '').slice(0, 4),
    gsm: k.gsm ?? '',
    web: k.web ?? '',
    il: k.il ?? '',
    ilce: k.ilce ?? '',
    adres: k.adres ?? '',
  }));
}

export function bankaAnlasmadanForm(k: AdminBankaAnlasma): BankaAnlasmaFormDegeri {
  return {
    hesapTipi: k.hesapTipi,
    hesapKodu: k.hesapKodu ?? '',
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
    iletisimKisiler: iletisimNormalize(k.iletisimKisiler),
    acikKisismlar: k.acikKisismlar?.length
      ? k.acikKisismlar
      : (['adres-iletisim'] satisfies BankaKisimId[]),
    aktif: k.aktif,
  };
}

export function bankaAnlasmaSatirEtiketi(k: AdminBankaAnlasma): string {
  const kod = k.hesapKodu?.trim();
  const ad = k.hesapIsmi.trim();
  if (kod && ad) return `${kod} — ${ad}`;
  return ad || kod || 'Adsız hesap';
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

/** Kart son kullanma: AA/YY — ay 01–12, yıl ≥ bugün (geçmiş tarih yok) */
export function sonKullanmaFiltrele(deger: string): string {
  const simdi = new Date();
  const buAy = simdi.getMonth() + 1;
  const buYil = simdi.getFullYear() % 100;

  let rakam = deger.replace(/\D/g, '').slice(0, 4);
  if (!rakam) return '';

  // İlk hane 2–9 ise ayı 0X yap (örn. 3 → 03)
  if (rakam.length === 1 && Number(rakam) > 1) {
    rakam = `0${rakam}`;
  }

  let ayStr = rakam.slice(0, Math.min(2, rakam.length));
  let yyStr = rakam.slice(2);

  if (ayStr.length === 2) {
    let ay = Number(ayStr);
    if (!Number.isFinite(ay) || ay < 1) ay = 1;
    if (ay > 12) ay = 12;
    ayStr = String(ay).padStart(2, '0');
  }

  if (yyStr.length === 2) {
    let yy = Number(yyStr);
    if (!Number.isFinite(yy) || yy < buYil) yy = buYil;
    if (yy === buYil && ayStr.length === 2 && Number(ayStr) < buAy) {
      ayStr = String(buAy).padStart(2, '0');
    }
    yyStr = String(yy).padStart(2, '0');
  }

  if (!yyStr) return ayStr;
  return `${ayStr}/${yyStr}`;
}

/** Son kullanma geçmişte mi / geçersiz mi? */
export function sonKullanmaGecerliMi(deger: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(deger)) return false;
  const [ayS = '', yyS = ''] = deger.split('/');
  const ay = Number(ayS);
  const yy = Number(yyS);
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) return false;
  const simdi = new Date();
  const buAy = simdi.getMonth() + 1;
  const buYil = simdi.getFullYear() % 100;
  if (yy < buYil) return false;
  if (yy === buYil && ay < buAy) return false;
  return true;
}

/** Amex: 34 / 37 ile başlar, 15 hane */
export function amexKartMi(rakam: string): boolean {
  return rakam.startsWith('34') || rakam.startsWith('37');
}

/** Kart no: Visa/MC 4-4-4-4 (16); Amex 4-6-5 (15) */
export function kartNoFiltrele(deger: string): string {
  const ham = deger.replace(/\D/g, '');
  const amex = amexKartMi(ham);
  const rakam = ham.slice(0, amex ? 15 : 16);
  if (amex) {
    const p1 = rakam.slice(0, 4);
    const p2 = rakam.slice(4, 10);
    const p3 = rakam.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }
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

/** "1" / "1 taksit" → "1 Taksit"; boş veya metin olduğu gibi */
export function satisSekliBicimle(deger: string): string {
  const t = deger.trim();
  if (!t) return '';
  const m = t.match(/^(\d+)\s*(?:taksit)?$/i);
  if (m) return `${Number(m[1])} Taksit`;
  return t.replace(/\s+/g, ' ');
}

export function satisSekliAnahtar(deger: string): string {
  return satisSekliBicimle(deger).toLocaleLowerCase('tr-TR');
}

/** Aynı satış şekli başka satırda var mı? */
export function satisSekliTekrarVarMi(
  satirlar: PosKomisyonSatir[],
  satirId: string,
  deger: string
): boolean {
  const anahtar = satisSekliAnahtar(deger);
  if (!anahtar) return false;
  return satirlar.some((s) => s.id !== satirId && satisSekliAnahtar(s.satisSekli) === anahtar);
}

export function bankaAnlasmaFormDogrula(form: BankaAnlasmaFormDegeri): string | null {
  if (!form.hesapIsmi.trim()) return 'Hesap adı zorunludur';
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
    if (form.sonKullanmaTarihi) {
      if (!/^\d{2}\/\d{2}$/.test(form.sonKullanmaTarihi)) {
        return 'Son kullanma tarihi AA/YY formatında olmalıdır';
      }
      if (!sonKullanmaGecerliMi(form.sonKullanmaTarihi)) {
        return 'Son kullanma tarihi bugünden önce olamaz (ay 01–12)';
      }
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
