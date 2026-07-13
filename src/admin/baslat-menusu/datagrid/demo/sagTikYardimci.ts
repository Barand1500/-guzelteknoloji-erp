import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { hucrePanoyaMetni as genelHucrePanoyaMetni } from '@/admin/ortak/datagrid/sagTikYardimci';
import { birimEtiketi } from './birimVeri';
import type { SiparisSatiri } from './demoVeri';

export function hucrePanoyaMetni(
  satir: SiparisSatiri,
  kolonId: string | null,
  kolonlar: KolonTanimi<SiparisSatiri>[]
): string {
  if (!kolonId || kolonId === 'secim' || kolonId === 'islemler') return '';

  if (kolonId === 'urunKoduAdi') {
    const ad = satir.urun.ad?.trim();
    const kod = satir.urun.sku?.trim();
    if (ad && kod) return `${kod} (${ad})`;
    return ad || kod || '';
  }
  if (kolonId === 'birim') return birimEtiketi(satir.birim);

  return genelHucrePanoyaMetni(satir, kolonId, kolonlar);
}
