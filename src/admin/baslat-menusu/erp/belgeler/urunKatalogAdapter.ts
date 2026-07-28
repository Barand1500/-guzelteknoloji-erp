import { stoklariGetir, birimleriGetir } from '@/admin/baslat-menusu/erp/stoklar/api';
import type { BelgeYon } from './tipler';
import type { UrunKaydi } from '@/admin/baslat-menusu/datagrid/demo/urunAramaYardimci';
import { stokBakiyeleriGetir, mockStokSeedKur } from './mockBelgeDepo';

/** Stok + birim → katalog; envanter mock bakiyeden */
export async function stokUrunKataloguGetir(yon: BelgeYon, depoId?: string | null): Promise<UrunKaydi[]> {
  const [urunler, birimler] = await Promise.all([stoklariGetir(), birimleriGetir()]);
  const alisMi = yon === 'ALIS';

  const katalogHam: UrunKaydi[] = [];
  for (const u of urunler) {
    if (!u.aktif) continue;
    const urunBirimleri = birimler.filter((b) => b.urunId === u.id && b.aktif);
    if (!urunBirimleri.length) {
      katalogHam.push({
        sku: u.urunKodu,
        ad: u.urunAdi,
        birim: u.varsayilanBirim || u.anaBirim || 'ADET',
        fiyat: 0,
        envanter: 0,
        kdv: 20,
      });
      continue;
    }
    const tercih =
      urunBirimleri.find((b) => b.birimAdi === (u.varsayilanBirim || u.anaBirim)) ?? urunBirimleri[0]!;
    katalogHam.push({
      sku: u.urunKodu,
      ad: u.urunAdi,
      birim: tercih.birimAdi || 'ADET',
      fiyat: alisMi ? Number(tercih.alisFiyati) || 0 : Number(tercih.satisFiyati) || 0,
      envanter: 0,
      kdv: alisMi ? Number(tercih.alisKdv) || 20 : Number(tercih.satisKdv) || 20,
    });
  }

  // İlk açılışta mock stok seed (negatif kontrol denenebilsin)
  if (depoId && katalogHam.length) {
    mockStokSeedKur(
      katalogHam.slice(0, 12).map((u) => ({
        urunKodu: u.sku,
        urunAdi: u.ad,
        depoId,
        depoKodu: '',
        miktar: 50,
        birim: u.birim,
      }))
    );
  }

  const bakiyeler = stokBakiyeleriGetir(depoId || undefined);
  const bakiyeMap = new Map(bakiyeler.map((b) => [b.urunKodu, b.miktar]));

  return katalogHam.map((u) => ({
    ...u,
    envanter: bakiyeMap.get(u.sku) ?? 0,
  }));
}
