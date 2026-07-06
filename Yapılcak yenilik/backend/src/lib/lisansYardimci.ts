import type { Lisans } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';

export type LisansDurumKod = 'aktif' | 'pasif' | 'yakinda';

export type LisansSayim = Lisans & {
  firma: { id: number; unvan: string; tabelaAdi: string | null };
  paket: { id: number; paketAdi: string };
};

export function lisansDurumHesapla(l: Lisans): LisansDurumKod {
  if (!l.durum) return 'pasif';
  if (!l.bitisTarihi) return 'aktif';
  const simdi = Date.now();
  const fark = l.bitisTarihi.getTime() - simdi;
  if (fark <= 0) return 'pasif';
  if (fark < 30 * 24 * 60 * 60 * 1000) return 'yakinda';
  return 'aktif';
}

export function lisansYanitOlustur(l: LisansSayim) {
  return {
    id: l.id,
    firmaId: l.firmaId,
    firmaUnvan: l.firma.unvan,
    firmaTabela: l.firma.tabelaAdi,
    paketId: l.paketId,
    paketAdi: l.paket.paketAdi,
    baslangicTarihi: l.baslangicTarihi.toISOString(),
    bitisTarihi: l.bitisTarihi?.toISOString() ?? null,
    durum: lisansDurumHesapla(l),
    aktif: l.durum,
    kayitTarihi: l.kayitTarihi.toISOString(),
    guncellemeTarihi: l.guncellemeTarihi.toISOString(),
  };
}

export const lisansInclude = {
  firma: { select: { id: true, unvan: true, tabelaAdi: true } },
  paket: { select: { id: true, paketAdi: true } },
} as const;

export async function lisansListesiGetir() {
  const kayitlar = await prismaMaster.lisans.findMany({
    orderBy: [{ id: 'asc' }],
    include: lisansInclude,
  });
  return kayitlar.map(lisansYanitOlustur);
}
