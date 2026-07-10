import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { bosGosterim, paraFormatla, tarihFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';

export function hucrePanoyaMetni<TRow>(
  satir: TRow,
  kolonId: string | null,
  kolonlar: KolonTanimi<TRow>[]
): string {
  if (!kolonId || kolonId === 'secim' || kolonId === 'islemler') return '';

  const kolon = kolonlar.find((k) => k.id === kolonId);
  if (!kolon) return '';

  const deger = kolon.degerAl(satir);

  switch (kolon.tip) {
    case 'birlesik':
      return String((deger as { ust?: string }).ust ?? '');
    case 'zengin':
      return String((deger as { baslik?: string }).baslik ?? '');
    case 'iskonto': {
      const i = deger as { yuzde: number; tutar: number };
      const pb = kolon.paraSembolu === false ? null : '₺';
      return `${yuzdeFormatla(i.yuzde)} (${paraFormatla(i.tutar, pb)})`;
    }
    case 'para':
      return paraFormatla(Number(deger), kolon.paraSembolu === false ? null : '₺');
    case 'tarih':
      return tarihFormatla(deger);
    case 'toggle':
      return deger ? 'Aktif' : 'Pasif';
    case 'etiket': {
      const etiketler = (deger as { metin: string }[]) ?? [];
      return etiketler.map((e) => e.metin).join(', ');
    }
    default:
      return bosGosterim(deger);
  }
}

export function secimMetnindenKopya(hedef: EventTarget | null): string {
  const secim = window.getSelection()?.toString().trim();
  if (secim) return secim;
  const hucre = (hedef as HTMLElement | null)?.closest('td[data-kolon-id]');
  return hucre?.textContent?.trim() ?? '';
}
