import { stoklariGetir, birimleriGetir } from '@/admin/baslat-menusu/erp/stoklar/api';
import type { BelgeYon } from './tipler';
import type { UrunBarkodDetay, UrunKaydi } from '@/admin/baslat-menusu/datagrid/demo/urunAramaYardimci';
import { stokBakiyeleriGetir } from './mockBelgeDepo';

/** Stok + birim → katalog; envanter belge stok hareketlerinden; barkodlar birim satırından */
export async function stokUrunKataloguGetir(yon: BelgeYon, depoId?: string | null): Promise<UrunKaydi[]> {
  const [urunler, birimler] = await Promise.all([stoklariGetir(), birimleriGetir()]);
  const alisMi = yon === 'ALIS';

  const katalogHam: UrunKaydi[] = [];
  for (const u of urunler) {
    if (!u.aktif) continue;
    const urunKodu = (u.urunKodu ?? '').trim();
    const urunBirimleri = birimler.filter((b) => b.urunId === u.id && b.aktif);
    if (!urunBirimleri.length) {
      katalogHam.push({
        sku: urunKodu,
        ad: u.urunAdi,
        birim: u.varsayilanBirim || u.anaBirim || 'ADET',
        fiyat: 0,
        envanter: 0,
        kdv: 20,
        barkodlar: [],
      });
      continue;
    }
    const tercih =
      urunBirimleri.find((b) => b.birimAdi === (u.varsayilanBirim || u.anaBirim)) ?? urunBirimleri[0]!;

    const barkodlar: string[] = [];
    const barkodDetay: Record<string, UrunBarkodDetay> = {};
    for (const b of urunBirimleri) {
      const kod = (b.barkod ?? '').trim();
      if (!kod) continue;
      if (!barkodlar.includes(kod)) barkodlar.push(kod);
      barkodDetay[kod] = {
        birim: b.birimAdi || 'ADET',
        fiyat: alisMi ? Number(b.alisFiyati) || 0 : Number(b.satisFiyati) || 0,
        kdv: alisMi ? Number(b.alisKdv) || 20 : Number(b.satisKdv) || 20,
      };
    }

    katalogHam.push({
      sku: urunKodu,
      ad: u.urunAdi,
      birim: tercih.birimAdi || 'ADET',
      fiyat: alisMi ? Number(tercih.alisFiyati) || 0 : Number(tercih.satisFiyati) || 0,
      envanter: 0,
      kdv: alisMi ? Number(tercih.alisKdv) || 20 : Number(tercih.satisKdv) || 20,
      barkodlar,
      barkodDetay: Object.keys(barkodDetay).length ? barkodDetay : undefined,
    });
  }

  // Aynı kaynak: belge stok hareketleri (stoklar listesiyle birebir)
  const bakiyeler = stokBakiyeleriGetir(depoId || undefined);
  const bakiyeMap = new Map<string, number>();
  for (const b of bakiyeler) {
    const kod = (b.urunKodu ?? '').trim();
    if (!kod) continue;
    bakiyeMap.set(kod, (bakiyeMap.get(kod) ?? 0) + b.miktar);
  }

  return katalogHam.map((u) => ({
    ...u,
    envanter: bakiyeMap.get(u.sku) ?? 0,
  }));
}
