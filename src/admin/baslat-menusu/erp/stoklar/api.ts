export {
  urunleriGetir as stoklariGetir,
  urunOlustur as stokOlustur,
  urunGuncelle as stokGuncelle,
  urunSil as stokSil,
  birimleriGetir,
  birimOlustur,
  birimGuncelle,
  birimSil,
  maliyetleriGetir,
} from '@/admin/baslat-menusu/erp/urun-yonetimi/api';

import type { AdminBirim, AdminMaliyet } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { birimleriGetir, maliyetleriGetir } from '@/admin/baslat-menusu/erp/urun-yonetimi/api';

export async function stokBirimleriGetir(urunId: string): Promise<AdminBirim[]> {
  return birimleriGetir(urunId);
}

export async function stokMaliyetleriGetir(birimIdler: string[]): Promise<AdminMaliyet[]> {
  if (!birimIdler.length) return [];
  const set = new Set(birimIdler);
  const hepsi = await maliyetleriGetir();
  return hepsi.filter((m) => set.has(m.birimId));
}
