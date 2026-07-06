import type { Modul } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';
import { prisma } from './prisma.js';
import { VARSAYILAN_SISTEM_ROLLERI } from './modulSabitleri.js';

type ModulSayim = Modul & { _count: { roller: number } };

export function modulYanitOlustur(m: ModulSayim) {
  return {
    id: m.id,
    ad: m.modulAdi,
    prefix: m.prefix,
    aktif: m.durum,
    rolSayisi: m._count.roller,
    kayitTarihi: m.kayitTarihi.toISOString(),
    guncellemeTarihi: m.guncellemeTarihi.toISOString(),
  };
}

export async function modulListesiGetir() {
  const kayitlar = (await prismaMaster.modul.findMany({
    orderBy: [{ id: 'asc' }],
    include: { _count: { select: { roller: true } } },
  })) as ModulSayim[];
  return kayitlar.map(modulYanitOlustur);
}

export async function modulIcinVarsayilanRolleriOlustur(modulId: number) {
  for (const rol of VARSAYILAN_SISTEM_ROLLERI) {
    await prisma.rol.upsert({
      where: { modulId_rolAdi: { modulId, rolAdi: rol.rolAdi } },
      create: { rolAdi: rol.rolAdi, modulId, yetki: [...rol.yetkiler] },
      update: { yetki: [...rol.yetkiler], durum: true },
    });
  }
}
