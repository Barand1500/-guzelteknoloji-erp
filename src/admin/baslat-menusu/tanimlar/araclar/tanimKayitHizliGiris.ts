import {
  depoOlustur,
  donemOlustur,
  firmaOlustur,
  kasaOlustur,
  subeOlustur,
} from '@/admin/baslat-menusu/tanimlar/api';
import {
  adGecerliMi,
  alanDegeriniFiltrele,
  donemAdGecerliMi,
  kodGecerliMi,
  vergiNoGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  bosDepoForm,
  bosDonemForm,
  bosFirmaForm,
  bosKasaForm,
  bosSubeForm,
  PARA_BIRIMLERI,
  type TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import type { HizliGirisKolonu } from '@/admin/ortak/datagrid/types';

const DURUM_GIRIS: HizliGirisKolonu = {
  kolonId: 'durum',
  tip: 'toggle',
  varsayilan: 'true',
};

export function tanimEkleEtiketi(tip: TanimSekmeId): string {
  switch (tip) {
    case 'firma':
      return 'Firma Ekle';
    case 'sube':
      return 'Şube Ekle';
    case 'donem':
      return 'Dönem Ekle';
    case 'depo':
      return 'Depo Ekle';
    case 'kasa':
      return 'Kasa Ekle';
  }
}

export function tanimHizliGirisKolonlari(tip: TanimSekmeId): HizliGirisKolonu[] {
  switch (tip) {
    case 'firma':
      return [
        {
          kolonId: 'firmaKoduAdi',
          birlesikDikey: true,
          birlesik: [
            { kolonId: 'firmaKodu', placeholder: 'Firma kodu' },
            { kolonId: 'firmaAdi', placeholder: 'Firma adı' },
          ],
        },
        { kolonId: 'vergiDairesi', placeholder: 'Vergi dairesi' },
        { kolonId: 'vergiNo', placeholder: 'Vergi no', ipucu: '10 haneli vergi no' },
        DURUM_GIRIS,
      ];
    case 'sube':
      return [
        { kolonId: 'subeKodu', placeholder: 'Şube kodu' },
        { kolonId: 'subeAdi', placeholder: 'Şube adı' },
        DURUM_GIRIS,
      ];
    case 'donem':
      return [
        { kolonId: 'donemKodu', placeholder: 'Dönem kodu' },
        { kolonId: 'donemAdi', placeholder: 'Dönem adı' },
        DURUM_GIRIS,
      ];
    case 'depo':
      return [
        { kolonId: 'depoKodu', placeholder: 'Depo kodu' },
        { kolonId: 'depoAdi', placeholder: 'Depo adı' },
        DURUM_GIRIS,
      ];
    case 'kasa':
      return [
        { kolonId: 'kasaKodu', placeholder: 'Kasa kodu' },
        { kolonId: 'kasaAdi', placeholder: 'Kasa adı' },
        {
          kolonId: 'paraBirimi',
          tip: 'secim',
          varsayilan: 'TL',
          secenekler: PARA_BIRIMLERI.map((p) => ({ deger: p, etiket: p })),
        },
        DURUM_GIRIS,
      ];
  }
}

function aktifOku(degerler: Record<string, string>): boolean {
  return (degerler.durum ?? 'true') === 'true';
}

function metinOku(degerler: Record<string, string>, anahtar: string): string {
  return (degerler[anahtar] ?? '').trim();
}

function adresDegerleriniOku(
  degerler: Record<string, string>,
  opts?: { ilIlceBirlesik?: boolean }
): Pick<typeof bosSubeForm, 'il' | 'ilce' | 'mahalle' | 'postaKodu' | 'adres'> {
  if (opts?.ilIlceBirlesik) {
    const birlesik = metinOku(degerler, 'ilIlce');
    const [il = '', ilce = ''] = birlesik.split('/').map((s) => s.trim());
    return {
      il: il || metinOku(degerler, 'il'),
      ilce: ilce || metinOku(degerler, 'ilce'),
      mahalle: metinOku(degerler, 'mahalle'),
      postaKodu: metinOku(degerler, 'postaKodu'),
      adres: metinOku(degerler, 'adres'),
    };
  }

  return {
    il: metinOku(degerler, 'il'),
    ilce: metinOku(degerler, 'ilce'),
    mahalle: metinOku(degerler, 'mahalle'),
    postaKodu: metinOku(degerler, 'postaKodu'),
    adres: metinOku(degerler, 'adres'),
  };
}

export interface TanimHizliGirisBaglam {
  firmaId?: string;
  subeId?: string;
}

export async function tanimHizliGirisKaydet(
  tip: TanimSekmeId,
  degerler: Record<string, string>,
  baglam: TanimHizliGirisBaglam
): Promise<{ ok: true; mesaj: string } | { ok: false; mesaj: string }> {
  const aktif = aktifOku(degerler);

  if (tip === 'firma') {
    const kod = alanDegeriniFiltrele('kod', degerler.firmaKodu ?? degerler.kod ?? '');
    const ad = (degerler.firmaAdi ?? degerler.ad ?? '').trim();
    const vergiDairesi = (degerler.vergiDairesi ?? '').trim();
    const vergiNo = alanDegeriniFiltrele('vergiNo', degerler.vergiNo ?? '');
    if (!kodGecerliMi(kod)) return { ok: false, mesaj: 'Firma kodu zorunludur' };
    if (!adGecerliMi(ad, 255)) return { ok: false, mesaj: 'Firma adı zorunludur' };
    if (!vergiNoGecerliMi(vergiNo) || vergiNo.length !== 10) {
      return { ok: false, mesaj: 'Vergi no 10 haneli olmalıdır' };
    }
    const form = { ...bosFirmaForm, firmaKodu: kod, firmaAdi: ad, vergiDairesi, vergiNo, aktif };
    await firmaOlustur(form);
    return { ok: true, mesaj: `${ad} firması eklendi.` };
  }

  if (tip === 'sube') {
    if (!baglam.firmaId) return { ok: false, mesaj: 'Firma seçili değil' };
    const kod = alanDegeriniFiltrele('kod', degerler.subeKodu ?? degerler.kod ?? '');
    const ad = (degerler.subeAdi ?? degerler.ad ?? '').trim();
    if (!kodGecerliMi(kod)) return { ok: false, mesaj: 'Şube kodu zorunludur' };
    if (!adGecerliMi(ad)) return { ok: false, mesaj: 'Şube adı zorunludur' };
    const form = {
      ...bosSubeForm,
      subeKodu: kod,
      subeAdi: ad,
      ...adresDegerleriniOku(degerler, { ilIlceBirlesik: true }),
      efaturaSeri: metinOku(degerler, 'efaturaSeri'),
      earsivSeri: metinOku(degerler, 'earsivSeri'),
      eirsaliyeSeri: metinOku(degerler, 'eirsaliyeSeri'),
      mersis: metinOku(degerler, 'mersis'),
      ticaretSicil: metinOku(degerler, 'ticaretSicil'),
      aktif,
    };
    await subeOlustur(form, baglam.firmaId);
    return { ok: true, mesaj: `${ad} şubesi eklendi.` };
  }

  if (tip === 'donem') {
    if (!baglam.firmaId) return { ok: false, mesaj: 'Firma seçili değil' };
    const kod = alanDegeriniFiltrele('kod', degerler.donemKodu ?? degerler.kod ?? '');
    const ad = (degerler.donemAdi ?? degerler.ad ?? '').trim();
    if (!kodGecerliMi(kod)) return { ok: false, mesaj: 'Dönem kodu zorunludur' };
    if (!donemAdGecerliMi(ad)) return { ok: false, mesaj: 'Dönem adı zorunludur' };
    const form = { ...bosDonemForm, donemKodu: kod, donemAdi: ad, aktif };
    await donemOlustur(form, baglam.firmaId);
    return { ok: true, mesaj: `${ad} dönemi eklendi.` };
  }

  if (tip === 'depo') {
    if (!baglam.subeId) return { ok: false, mesaj: 'Şube seçili değil' };
    const kod = alanDegeriniFiltrele('kod', degerler.depoKodu ?? degerler.kod ?? '');
    const ad = (degerler.depoAdi ?? degerler.ad ?? '').trim();
    if (!kodGecerliMi(kod)) return { ok: false, mesaj: 'Depo kodu zorunludur' };
    if (!adGecerliMi(ad)) return { ok: false, mesaj: 'Depo adı zorunludur' };
    const form = {
      ...bosDepoForm,
      subeId: baglam.subeId,
      depoKodu: kod,
      depoAdi: ad,
      ...adresDegerleriniOku(degerler),
      aktif,
    };
    await depoOlustur(form);
    return { ok: true, mesaj: `${ad} deposu eklendi.` };
  }

  if (tip === 'kasa') {
    if (!baglam.subeId) return { ok: false, mesaj: 'Şube seçili değil' };
    const kod = alanDegeriniFiltrele('kod', degerler.kasaKodu ?? degerler.kod ?? '');
    const ad = (degerler.kasaAdi ?? degerler.ad ?? '').trim();
    if (!kodGecerliMi(kod)) return { ok: false, mesaj: 'Kasa kodu zorunludur' };
    if (!adGecerliMi(ad)) return { ok: false, mesaj: 'Kasa adı zorunludur' };
    const paraBirimi = (degerler.paraBirimi ?? 'TL').trim() || 'TL';
    const form = {
      ...bosKasaForm,
      subeId: baglam.subeId,
      kasaKodu: kod,
      kasaAdi: ad,
      paraBirimi,
      aktif,
    };
    await kasaOlustur(form);
    return { ok: true, mesaj: `${ad} kasası eklendi.` };
  }

  return { ok: false, mesaj: 'Geçersiz kayıt türü' };
}
