import { cariOlustur } from '@/admin/baslat-menusu/erp/cari/api';
import { cariFormDogrula } from '@/admin/baslat-menusu/erp/cari/alanKurallari';
import { hizliGirisdenForm } from '@/admin/baslat-menusu/erp/cari/cariYardimci';
import type { HizliGirisKolonu } from '@/admin/ortak/datagrid/types';
import { CARI_TIPLERI, EFATURA_TIPLERI, ISLETME_TURLERI } from '@/admin/baslat-menusu/erp/cari/tipler';

const DURUM_GIRIS: HizliGirisKolonu = {
  kolonId: 'durum',
  tip: 'toggle',
  varsayilan: 'true',
};

export function cariEkleEtiketi(): string {
  return 'Cari Ekle';
}

export function cariHizliGirisKolonlari(): HizliGirisKolonu[] {
  return [
    { kolonId: 'cariKodu', placeholder: 'Cari kodu' },
    { kolonId: 'cariAdi', placeholder: 'Cari adı' },
    {
      kolonId: 'cariTipi',
      tip: 'secim',
      varsayilan: 'ALICI',
      secenekler: CARI_TIPLERI.map((t) => ({ deger: t.value, etiket: t.label })),
    },
    {
      kolonId: 'isletmeTuru',
      tip: 'secim',
      varsayilan: '',
      secenekler: [
        { deger: '', etiket: 'Seçilmedi' },
        ...ISLETME_TURLERI.map((t) => ({ deger: t.value, etiket: t.label })),
      ],
    },
    { kolonId: 'unvan', placeholder: 'Ünvan' },
    { kolonId: 'yetkili', placeholder: 'Yetkili' },
    { kolonId: 'vergiDairesi', placeholder: 'Vergi dairesi' },
    { kolonId: 'vergiNo', placeholder: 'Vergi no' },
    { kolonId: 'il', placeholder: 'İl' },
    { kolonId: 'ilce', placeholder: 'İlçe' },
    { kolonId: 'adres', placeholder: 'Adres' },
    { kolonId: 'telefon', placeholder: 'Telefon' },
    { kolonId: 'eposta', placeholder: 'E-posta' },
    { kolonId: 'web', placeholder: 'Web' },
    {
      kolonId: 'efaturaTipi',
      tip: 'secim',
      varsayilan: 'E-ARSIV',
      secenekler: EFATURA_TIPLERI.map((t) => ({ deger: t.value, etiket: t.label })),
    },
    { kolonId: 'alias', placeholder: 'E-Fatura alias' },
    { kolonId: 'efatura', tip: 'toggle', varsayilan: 'false' },
    DURUM_GIRIS,
  ];
}

export async function cariHizliGirisKaydet(
  degerler: Record<string, string>
): Promise<{ ok: true; mesaj: string } | { ok: false; mesaj: string }> {
  const form = hizliGirisdenForm(degerler);
  const hata = cariFormDogrula(form);
  if (hata) return { ok: false, mesaj: hata };
  await cariOlustur(form);
  return { ok: true, mesaj: `«${form.cariAdi}» cari kartı eklendi.` };
}
