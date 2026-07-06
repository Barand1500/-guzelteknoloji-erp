import type { Kullanici } from '@prisma/client';
import { config } from '../config.js';
import { prisma } from './prisma.js';
import { rolAdiBul, tarihIso } from './mappers.js';

export type MasterKullaniciKayit = Kullanici & {
  rol?: { rolAdi: string } | null;
  bayi?: { id: number; unvan: string } | null;
  firma?: { id: number; unvan: string; tabelaAdi: string | null } | null;
  sube?: { id: number; subeAdi: string } | null;
};

const masterKullaniciInclude = {
  rol: { select: { rolAdi: true } },
  bayi: { select: { id: true, unvan: true } },
  firma: { select: { id: true, unvan: true, tabelaAdi: true } },
  sube: { select: { id: true, subeAdi: true } },
} as const;

const subeKullaniciInclude = {
  rol: { select: { rolAdi: true } },
} as const;

function kullaniciInclude() {
  return config.dbTuru === 'master' ? masterKullaniciInclude : subeKullaniciInclude;
}

export async function masterKullaniciYanitOlustur(k: MasterKullaniciKayit) {
  return {
    id: k.id,
    ad: k.ad,
    eposta: k.email,
    gsm: k.gsm,
    rol: k.rol?.rolAdi ?? (await rolAdiBul(k)),
    kullaniciTipi: k.kullaniciTipi,
    bayiId: k.bayiId,
    bayiUnvan: k.bayi?.unvan ?? null,
    firmaId: k.firmaId,
    firmaUnvan: k.firma?.unvan ?? null,
    firmaTabela: k.firma?.tabelaAdi ?? null,
    subeId: k.subeId,
    subeAdi: k.sube?.subeAdi ?? null,
    iskonto: k.iskonto != null ? Number(k.iskonto) : null,
    aktif: k.aktif,
    sonGirisTarihi: k.sonGirisTarihi?.toISOString() ?? null,
    kayitTarihi: tarihIso(k.olusturma),
    guncellemeTarihi: tarihIso(k.guncelleme),
  };
}

export async function masterKullaniciListesiGetir() {
  const kayitlar = await prisma.kullanici.findMany({
    orderBy: [{ id: 'asc' }],
    include: kullaniciInclude(),
  });
  return Promise.all(kayitlar.map(masterKullaniciYanitOlustur));
}

export { kullaniciInclude };
