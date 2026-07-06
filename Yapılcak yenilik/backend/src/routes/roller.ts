import { Router } from 'express';
import type { Response } from 'express';
import { config } from '../config.js';
import { rolSatirlarindanOzet, yetkiListesiYanit } from '../lib/mappers.js';
import { sanalModulListesi } from '../lib/panelModulleri.js';
import { prismaMaster } from '../lib/prismaMaster.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

async function modulListesiGetir() {
  if (config.dbTuru === 'master') {
    return prismaMaster.modul.findMany({ where: { durum: true }, orderBy: { prefix: 'asc' } });
  }
  return sanalModulListesi();
}

async function rolleriGetir() {
  const [satirlar, moduller] = await Promise.all([
    prisma.rol.findMany({
      where: { durum: true },
      orderBy: [{ rolAdi: 'asc' }, { modulId: 'asc' }],
    }),
    modulListesiGetir(),
  ]);

  return {
    roller: rolSatirlarindanOzet(satirlar),
    yetkiler: yetkiListesiYanit(),
    moduller: moduller.map((m: { id: number; modulAdi: string; prefix: string }) => ({
      id: m.id,
      ad: m.modulAdi,
      prefix: m.prefix,
    })),
    matris: satirlar.map((s) => ({
      rolKodu: s.rolAdi,
      modulId: s.modulId,
      yetkiler: Array.isArray(s.yetki) ? s.yetki : [],
    })),
  };
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  return res.json(await rolleriGetir());
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const { roller } = req.body as {
    roller?: { kod: string; baslik: string; yetkiler: string[] }[];
  };

  if (!Array.isArray(roller)) {
    return res.status(400).json({ mesaj: 'Roller listesi gerekli' });
  }

  const moduller = await modulListesiGetir();
  if (!moduller.length) {
    return res.status(400).json({ mesaj: 'Modul tanimi bulunamadi' });
  }

  const gelenKodlar = new Set(roller.map((r) => r.kod));

  await prisma.rol.deleteMany({
    where: {
      rolAdi: { notIn: [...gelenKodlar] },
    },
  });

  for (const rol of roller) {
    const rolAdi = rol.kod;
    const rolBaslik = rol.baslik || rol.kod;
    for (const modul of moduller) {
      await prisma.rol.upsert({
        where: {
          modulId_rolAdi: {
            rolAdi,
            modulId: modul.id,
          },
        },
        create: {
          rolAdi,
          modulId: modul.id,
          yetki: rol.yetkiler ?? [],
        },
        update: {
          yetki: rol.yetkiler ?? [],
          durum: true,
        },
      });
    }
  }

  return res.json(await rolleriGetir());
});

export default router;
