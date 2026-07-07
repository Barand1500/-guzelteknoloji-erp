import type { Firma, Lisans } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';

export type FirmaLisansOzet = Pick<Lisans, 'durum' | 'bitisTarihi'>;

export type FirmaSayim = Firma & {
  bayi: { id: number; unvan: string; durum: boolean };
  _count: { subeler: number };
  lisanslar: FirmaLisansOzet[];
};

export type FirmaLisansDurum = 'aktif' | 'pasif' | 'yakinda' | 'yok';

export function lisansDurumuHesapla(lisanslar: FirmaLisansOzet[]): FirmaLisansDurum {
  const aktifLisanslar = lisanslar.filter((l) => l.durum);
  if (aktifLisanslar.length === 0) return lisanslar.length > 0 ? 'pasif' : 'yok';

  const simdi = Date.now();
  const otuzGun = 30 * 24 * 60 * 60 * 1000;
  const yakinda = aktifLisanslar.some((l) => {
    if (!l.bitisTarihi) return false;
    const fark = l.bitisTarihi.getTime() - simdi;
    return fark > 0 && fark < otuzGun;
  });
  if (yakinda) return 'yakinda';
  return 'aktif';
}

export function firmaYanitOlustur(f: FirmaSayim) {
  return {
    id: f.id,
    bayiId: f.bayiId,
    bayiUnvan: f.bayi.unvan,
    tabelaAdi: f.tabelaAdi,
    unvan: f.unvan,
    il: f.il,
    ilce: f.ilce,
    telefon: f.telefon,
    gsm: f.gsm,
    eposta: f.eposta,
    vergiDairesi: f.vergiDairesi,
    vergiNo: f.vergiNo,
    iskonto: f.iskonto != null ? Number(f.iskonto) : null,
    aktif: f.durum,
    subeSayisi: f._count.subeler,
    lisansDurum: lisansDurumuHesapla(f.lisanslar),
    kayitTarihi: f.kayitTarihi.toISOString(),
    guncellemeTarihi: f.guncellemeTarihi.toISOString(),
  };
}

export const firmaInclude = {
  bayi: { select: { id: true, unvan: true, durum: true } },
  _count: { select: { subeler: true } },
  lisanslar: { select: { durum: true, bitisTarihi: true } },
} as const;

export async function firmaListesiGetir() {
  const kayitlar = await prismaMaster.firma.findMany({
    orderBy: [{ durum: 'desc' }, { unvan: 'asc' }],
    include: firmaInclude,
  });
  return kayitlar.map(firmaYanitOlustur);
}
