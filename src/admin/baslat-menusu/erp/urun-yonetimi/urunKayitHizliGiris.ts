import type { HizliGirisKolonu } from '@/admin/ortak/datagrid/types';
import { urunOlustur } from './api';
import { URUN_TIPLERI, bosUrunForm } from './tipler';

export function urunHizliGirisKolonlari(): HizliGirisKolonu[] {
  return [
    { kolonId: 'urunKodu', placeholder: 'Ürün kodu' },
    { kolonId: 'urunAdi', placeholder: 'Ürün adı' },
    {
      kolonId: 'urunTipi',
      tip: 'secim',
      varsayilan: 'EMTIA',
      secenekler: URUN_TIPLERI.map((t) => ({ deger: t.value, etiket: t.label })),
    },
  ];
}

export async function urunHizliGirisKaydet(
  degerler: Record<string, string>
): Promise<{ ok: true; mesaj: string } | { ok: false; mesaj: string }> {
  const urunKodu = (degerler.urunKodu ?? '').trim();
  const urunAdi = (degerler.urunAdi ?? '').trim();
  const urunTipi = (degerler.urunTipi ?? 'EMTIA').trim();

  if (!urunKodu) return { ok: false, mesaj: 'Ürün kodu zorunludur' };
  if (!urunAdi) return { ok: false, mesaj: 'Ürün adı zorunludur' };
  if (!urunTipi) return { ok: false, mesaj: 'Ürün tipi zorunludur' };

  await urunOlustur({
    ...bosUrunForm,
    urunKodu,
    urunAdi,
    urunTipi,
    aktif: true,
  });

  return { ok: true, mesaj: `${urunAdi} ürünü eklendi.` };
}
