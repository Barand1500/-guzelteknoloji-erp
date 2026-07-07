import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { bosGosterim, paraFormatla, tarihFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { birimEtiketi } from './birimVeri';
import type { SiparisSatiri } from './demoVeri';

export function hucrePanoyaMetni(
  satir: SiparisSatiri,
  kolonId: string | null,
  kolonlar: KolonTanimi<SiparisSatiri>[],
  kdvDahil: boolean
): string {
  if (!kolonId || kolonId === 'secim' || kolonId === 'islemler') return '';

  if (kolonId === 'urunKoduAdi') {
    const ad = satir.urun.ad?.trim();
    const kod = satir.urun.sku?.trim();
    if (ad && kod) return `${ad} (${kod})`;
    return ad || kod || '';
  }
  if (kolonId === 'birim') return birimEtiketi(satir.birim);

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
      return `${yuzdeFormatla(i.yuzde)} (${paraFormatla(i.tutar)})`;
    }
    case 'para':
      return paraFormatla(Number(deger), kdvDahil ? '₺' : '₺');
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
