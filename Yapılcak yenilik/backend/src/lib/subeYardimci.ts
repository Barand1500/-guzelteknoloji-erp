import type { Sube } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';

export type SubeSayim = Sube & {
  firma: { id: number; unvan: string; tabelaAdi: string | null; durum: boolean };
};

const SUBE_TIPLERI = ['restoran', 'kafe', 'fast_food', 'diger'] as const;

export function subeYanitOlustur(s: SubeSayim) {
  return {
    id: s.id,
    firmaId: s.firmaId,
    firmaUnvan: s.firma.unvan,
    firmaTabela: s.firma.tabelaAdi,
    subeAdi: s.subeAdi,
    subeTipi: s.subeTipi,
    il: s.il,
    ilce: s.ilce,
    adres: s.adres,
    telefon: s.telefon,
    gsm: s.gsm,
    eposta: s.eposta,
    vergiDairesi: s.vergiDairesi,
    vergiNo: s.vergiNo,
    iskonto: s.iskonto != null ? Number(s.iskonto) : null,
    aktif: s.durum,
    kayitTarihi: s.kayitTarihi.toISOString(),
    guncellemeTarihi: s.guncellemeTarihi.toISOString(),
  };
}

export const subeInclude = {
  firma: { select: { id: true, unvan: true, tabelaAdi: true, durum: true } },
} as const;

export async function subeListesiGetir() {
  const kayitlar = await prismaMaster.sube.findMany({
    orderBy: [{ id: 'asc' }],
    include: subeInclude,
  });
  return kayitlar.map(subeYanitOlustur);
}

export function subeTipiGecerliMi(tip: unknown): tip is (typeof SUBE_TIPLERI)[number] {
  return typeof tip === 'string' && SUBE_TIPLERI.includes(tip as (typeof SUBE_TIPLERI)[number]);
}

export { SUBE_TIPLERI };
