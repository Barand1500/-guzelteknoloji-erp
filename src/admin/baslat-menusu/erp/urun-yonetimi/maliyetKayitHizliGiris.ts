import type { HizliGirisKolonu } from '@/admin/ortak/datagrid/types';
import { maliyetOlustur } from './api';
import { bosMaliyetForm, type AdminBirim } from './tipler';

export function maliyetHizliGirisKolonlari(birimler: AdminBirim[]): HizliGirisKolonu[] {
  return [
    {
      kolonId: 'birimId',
      tip: 'secim',
      varsayilan: birimler[0]?.id ?? '',
      secenekler: birimler.map((b) => ({
        deger: b.id,
        etiket: `${b.urunKodu} — ${b.urunAdi} / ${b.birimAdi}`,
      })),
    },
    { kolonId: 'sonAlisMaliyeti', placeholder: 'Son alış maliyeti' },
  ];
}

export async function maliyetHizliGirisKaydet(
  degerler: Record<string, string>,
  kullanilanBirimIdler: Set<string>
): Promise<{ ok: true; mesaj: string } | { ok: false; mesaj: string }> {
  const birimId = (degerler.birimId ?? '').trim();
  const sonAlisMetin = (degerler.sonAlisMaliyeti ?? '0').trim().replace(',', '.');
  const sonAlisMaliyeti = Number(sonAlisMetin);

  if (!birimId) return { ok: false, mesaj: 'Birim seçimi zorunludur' };
  if (kullanilanBirimIdler.has(birimId)) {
    return { ok: false, mesaj: 'Bu birim için zaten maliyet kaydı var' };
  }
  if (!Number.isFinite(sonAlisMaliyeti)) {
    return { ok: false, mesaj: 'Son alış maliyeti geçerli bir sayı olmalıdır' };
  }

  await maliyetOlustur({
    ...bosMaliyetForm,
    birimId,
    sonAlisMaliyeti,
    aktif: true,
  });

  return { ok: true, mesaj: 'Maliyet kaydı eklendi.' };
}
