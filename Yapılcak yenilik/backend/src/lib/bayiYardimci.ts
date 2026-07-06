import type { Bayi } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';

export type BayiSayim = Bayi & {
  ustBayi: { id: number; unvan: string } | null;
  _count: { firmalar: number; altBayiler: number };
};

export function bayiYanitOlustur(b: BayiSayim) {
  return {
    id: b.id,
    unvan: b.unvan,
    ustId: b.ustId,
    ustUnvan: b.ustBayi?.unvan ?? null,
    il: b.il,
    ilce: b.ilce,
    adres: b.adres,
    telefon: b.telefon,
    gsm: b.gsm,
    eposta: b.eposta,
    vergiDairesi: b.vergiDairesi,
    vergiNo: b.vergiNo,
    iskonto: b.iskonto != null ? Number(b.iskonto) : null,
    aktif: b.durum,
    firmaSayisi: b._count.firmalar,
    altBayiSayisi: b._count.altBayiler,
    kayitTarihi: b.kayitTarihi.toISOString(),
    guncellemeTarihi: b.guncellemeTarihi.toISOString(),
  };
}

const bayiInclude = {
  ustBayi: { select: { id: true, unvan: true } },
  _count: { select: { firmalar: true, altBayiler: true } },
} as const;

export async function bayiListesiGetir() {
  const kayitlar = (await prismaMaster.bayi.findMany({
    orderBy: [{ id: 'asc' }],
    include: bayiInclude,
  })) as BayiSayim[];
  return kayitlar.map(bayiYanitOlustur);
}

export async function ustBayiGecerliMi(bayiId: number, ustId: number | null | undefined): Promise<boolean> {
  if (ustId == null) return true;
  if (ustId === bayiId) return false;

  let currentId: number | null = ustId;
  const ziyaret = new Set<number>();

  while (currentId != null) {
    if (currentId === bayiId) return false;
    if (ziyaret.has(currentId)) return false;
    ziyaret.add(currentId);

    const ust: { ustId: number | null } | null = await prismaMaster.bayi.findUnique({
      where: { id: currentId },
      select: { ustId: true },
    });
    if (!ust) return false;
    currentId = ust.ustId;
  }

  return true;
}

export async function bayiTekGetir(id: number) {
  const kayit = await prismaMaster.bayi.findUnique({
    where: { id },
    include: bayiInclude,
  });
  return kayit ? bayiYanitOlustur(kayit) : null;
}

export { bayiInclude };
