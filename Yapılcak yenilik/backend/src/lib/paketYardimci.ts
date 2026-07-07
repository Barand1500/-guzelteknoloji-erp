import type { Paket } from './masterTipler.js';
import { prismaMaster } from './prismaMaster.js';

export function paketYanitOlustur(p: Paket) {
  return {
    id: p.id,
    paketAdi: p.paketAdi,
    subeSayisi: p.subeSayisi,
    personelSayisi: p.personelSayisi,
    masaSayisi: p.masaSayisi,
    fiyat: Number(p.fiyat),
    paraBirimi: p.paraBirimi,
    aktif: p.durum,
    kayitTarihi: p.kayitTarihi.toISOString(),
    guncellemeTarihi: p.guncellemeTarihi.toISOString(),
  };
}

export async function paketListesiGetir() {
  const kayitlar = (await prismaMaster.paket.findMany({
    orderBy: [{ id: 'asc' }],
  })) as Paket[];
  return kayitlar.map(paketYanitOlustur);
}

export async function paketLisansSayilariGetir() {
  const sayimlar = await prismaMaster.lisans.groupBy({
    by: ['paketId'],
    where: { durum: true },
    _count: { id: true },
  });
  return new Map(sayimlar.map((s: { paketId: number; _count: { id: number } }) => [s.paketId, s._count.id]));
}
