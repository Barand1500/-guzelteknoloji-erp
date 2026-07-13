import type { HizliGirisKolonu } from '@/admin/ortak/datagrid/types';
import { birimOlustur } from './api';
import { bosBirimForm, type AdminUrun } from './tipler';

export function birimHizliGirisKolonlari(urunler: AdminUrun[]): HizliGirisKolonu[] {
  return [
    {
      kolonId: 'urunId',
      tip: 'secim',
      varsayilan: urunler[0]?.id ?? '',
      secenekler: urunler.map((u) => ({
        deger: u.id,
        etiket: `${u.urunKodu} — ${u.urunAdi}`,
      })),
    },
    { kolonId: 'fiyatAdi', placeholder: 'Fiyat adı', varsayilan: 'PERAKENDE' },
    { kolonId: 'birimAdi', placeholder: 'Birim adı', varsayilan: 'ADET' },
  ];
}

export async function birimHizliGirisKaydet(
  degerler: Record<string, string>
): Promise<{ ok: true; mesaj: string } | { ok: false; mesaj: string }> {
  const urunId = (degerler.urunId ?? '').trim();
  const fiyatAdi = (degerler.fiyatAdi ?? 'PERAKENDE').trim();
  const birimAdi = (degerler.birimAdi ?? 'ADET').trim();

  if (!urunId) return { ok: false, mesaj: 'Ürün seçimi zorunludur' };
  if (!fiyatAdi) return { ok: false, mesaj: 'Fiyat adı zorunludur' };
  if (!birimAdi) return { ok: false, mesaj: 'Birim adı zorunludur' };

  await birimOlustur({
    ...bosBirimForm,
    urunId,
    fiyatAdi,
    birimAdi,
    aktif: true,
  });

  return { ok: true, mesaj: `${birimAdi} birimi eklendi.` };
}
