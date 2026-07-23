import { Router } from 'express';
import type { Response } from 'express';
import { sifreHashle } from '../lib/crypto.js';
import { adminKullaniciYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';
import { kullaniciYonetimiErisimi, kullaniciYonetimiYazma } from '../middleware/yetki.js';

const router = Router();
router.use(authZorunlu);
router.use(kullaniciYonetimiErisimi);

function sayiAl(deger: unknown): number | null {
  if (deger === null || deger === undefined || deger === '') return null;
  const n = Number(deger);
  return Number.isFinite(n) ? n : null;
}

interface OturumYetkisi {
  firmaId: number;
  donemId: number;
}

interface OturumYetkiPaketi {
  yetkiler: OturumYetkisi[];
  subeIds: number[];
  depoIds: number[];
  kasaIds: number[];
}

function idListesiAl(deger: unknown): number[] {
  if (!Array.isArray(deger)) return [];
  const ids: number[] = [];
  for (const ham of deger) {
    const n = sayiAl(ham);
    if (n) ids.push(n);
  }
  return [...new Set(ids)];
}

function oturumYetkileriAl(deger: unknown): OturumYetkisi[] {
  if (!Array.isArray(deger)) return [];
  const benzersiz = new Map<string, OturumYetkisi>();
  for (const ham of deger) {
    if (!ham || typeof ham !== 'object') continue;
    const kayit = ham as Record<string, unknown>;
    const firmaId = sayiAl(kayit.firmaId);
    const donemId = sayiAl(kayit.donemId);
    if (!firmaId || !donemId) continue;
    benzersiz.set(`${firmaId}:${donemId}`, { firmaId, donemId });
  }
  return [...benzersiz.values()];
}

function oturumPaketiAl(deger: unknown, body?: Record<string, unknown>): OturumYetkiPaketi {
  if (deger && typeof deger === 'object' && !Array.isArray(deger)) {
    const o = deger as Record<string, unknown>;
    return {
      yetkiler: oturumYetkileriAl(o.yetkiler),
      subeIds: idListesiAl(o.subeIds),
      depoIds: idListesiAl(o.depoIds),
      kasaIds: idListesiAl(o.kasaIds),
    };
  }
  return {
    yetkiler: oturumYetkileriAl(deger),
    subeIds: idListesiAl(body?.subeIds),
    depoIds: idListesiAl(body?.depoIds),
    kasaIds: idListesiAl(body?.kasaIds),
  };
}

async function oturumYetkileriniDogrula(yetkiler: OturumYetkisi[]) {
  if (yetkiler.length === 0) {
    throw new Error('En az bir firma ve donem yetkisi secilmelidir');
  }
  const donemler = await prisma.donem.findMany({
    where: { id: { in: yetkiler.map((y) => y.donemId) }, durum: true },
    select: { id: true, firmaId: true },
  });
  const gecerli = new Set(donemler.map((d) => `${d.firmaId}:${d.id}`));
  if (yetkiler.some((y) => !gecerli.has(`${y.firmaId}:${y.donemId}`))) {
    throw new Error('Secilen firma/donem yetkilerinden biri gecersiz');
  }
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { kayitTarihi: 'desc' },
  });
  const liste = await Promise.all(kullanicilar.map(adminKullaniciYanit));
  return res.json({ kullanicilar: liste });
});

router.get('/siteler', (_req: AuthRequest, res: Response) => {
  return res.json({ siteler: [] });
});

router.post('/', kullaniciYonetimiYazma, async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const kullaniciKodu = String(body.kullaniciKodu ?? body.email ?? '').trim().toUpperCase();
  const ad = String(body.ad ?? body.adSoyad ?? '').trim();
  const sifre = String(body.sifre ?? '').trim();
  const rol = String(body.rol ?? 'EDITOR');
  const firmaId = sayiAl(body.firmaId) ?? req.kullanici?.firmaId ?? 1;
  const donemId = sayiAl(body.donemId);
  const subeId = sayiAl(body.subeId);
  const depoId = sayiAl(body.depoId);
  const kasaId = sayiAl(body.kasaId);
  const paket = oturumPaketiAl(body.oturumYetkileri, body);
  const oturumYetkileri = paket.yetkiler;
  const pin = body.pin != null && String(body.pin).trim() ? String(body.pin).trim() : null;

  if (!kullaniciKodu || !ad || !sifre) {
    return res.status(400).json({ mesaj: 'Zorunlu alanlar eksik' });
  }
  try {
    await oturumYetkileriniDogrula(oturumYetkileri);
  } catch (err) {
    return res.status(400).json({ mesaj: err instanceof Error ? err.message : 'Oturum yetkileri gecersiz' });
  }
  if (!oturumYetkileri.some((y) => y.firmaId === firmaId && y.donemId === donemId)) {
    return res.status(400).json({ mesaj: 'Varsayilan firma/donem, kullaniciya atanan yetkilerden biri olmalidir' });
  }

  const kullanici = await prisma.kullanici.create({
    data: {
      firmaId,
      donemId,
      subeId: subeId ?? paket.subeIds[0] ?? null,
      depoId: depoId ?? paket.depoIds[0] ?? null,
      kasaId: kasaId ?? paket.kasaIds[0] ?? null,
      oturumYetkileri: {
        yetkiler: oturumYetkileri.map(({ firmaId, donemId }) => ({ firmaId, donemId })),
        subeIds: paket.subeIds.length ? paket.subeIds : subeId ? [subeId] : [],
        depoIds: paket.depoIds.length ? paket.depoIds : depoId ? [depoId] : [],
        kasaIds: paket.kasaIds.length ? paket.kasaIds : kasaId ? [kasaId] : [],
      },
      kullaniciKodu,
      adSoyad: ad,
      sifreHash: sifreHashle(sifre),
      pin,
      rol,
      durum: body.aktif !== false,
    },
  });

  await prisma.kullaniciKisayol.create({
    data: { kullaniciId: kullanici.id, harita: {} },
  });
  await prisma.kullaniciSekmeAyar.create({
    data: { kullaniciId: kullanici.id, ayarlar: {} },
  });

  return res.status(201).json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.put('/:id', kullaniciYonetimiYazma, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as Record<string, unknown>;

  const veri: Record<string, unknown> = {};
  if (body.kullaniciKodu) veri.kullaniciKodu = String(body.kullaniciKodu).trim().toUpperCase();
  if (body.ad || body.adSoyad) veri.adSoyad = String(body.ad ?? body.adSoyad).trim();
  if (body.rol) veri.rol = String(body.rol);
  if (body.aktif !== undefined) veri.durum = body.aktif;
  if (body.sifre && String(body.sifre).trim()) veri.sifreHash = sifreHashle(String(body.sifre).trim());
  if ('firmaId' in body) {
    const firmaId = sayiAl(body.firmaId);
    if (firmaId) veri.firmaId = firmaId;
  }
  if ('donemId' in body) veri.donemId = sayiAl(body.donemId);
  if ('subeId' in body) veri.subeId = sayiAl(body.subeId);
  if ('depoId' in body) veri.depoId = sayiAl(body.depoId);
  if ('kasaId' in body) veri.kasaId = sayiAl(body.kasaId);
  if ('oturumYetkileri' in body) {
    const paket = oturumPaketiAl(body.oturumYetkileri, body);
    const oturumYetkileri = paket.yetkiler;
    try {
      await oturumYetkileriniDogrula(oturumYetkileri);
    } catch (err) {
      return res.status(400).json({ mesaj: err instanceof Error ? err.message : 'Oturum yetkileri gecersiz' });
    }
    const varsayilanFirmaId = sayiAl(body.firmaId);
    const varsayilanDonemId = sayiAl(body.donemId);
    if (
      !varsayilanFirmaId ||
      !varsayilanDonemId ||
      !oturumYetkileri.some(
        (y) => y.firmaId === varsayilanFirmaId && y.donemId === varsayilanDonemId
      )
    ) {
      return res.status(400).json({ mesaj: 'Varsayilan firma/donem, kullaniciya atanan yetkilerden biri olmalidir' });
    }
    veri.oturumYetkileri = {
      yetkiler: oturumYetkileri,
      subeIds: paket.subeIds,
      depoIds: paket.depoIds,
      kasaIds: paket.kasaIds,
    };
    if (!('subeId' in body) && paket.subeIds[0]) veri.subeId = paket.subeIds[0];
    if (!('depoId' in body) && paket.depoIds[0]) veri.depoId = paket.depoIds[0];
    if (!('kasaId' in body) && paket.kasaIds[0]) veri.kasaId = paket.kasaIds[0];
  }
  if ('pin' in body) {
    veri.pin = body.pin != null && String(body.pin).trim() ? String(body.pin).trim() : null;
  }

  const kullanici = await prisma.kullanici.update({
    where: { id },
    data: veri,
  });

  return res.json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.delete('/:id', kullaniciYonetimiYazma, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (id === req.kullanici?.id) {
    return res.status(400).json({ mesaj: 'Kendi hesabinizi silemezsiniz' });
  }
  await prisma.kullanici.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
