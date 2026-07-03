import { Router } from 'express';
import type { Response } from 'express';
import { rolSatirlarindanOzet, yetkiListesiYanit } from '../lib/mappers.js';
import { modulListesi } from '../lib/panelModulleri.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

async function rolleriGetir() {
  const [satirlar, moduller] = await Promise.all([
    prisma.rol.findMany({
      where: { durum: true },
      orderBy: [{ rolAdi: 'asc' }, { modulId: 'asc' }],
    }),
    modulListesi(),
  ]);

  return {
    roller: rolSatirlarindanOzet(satirlar),
    yetkiler: yetkiListesiYanit(),
    moduller: moduller.map((m) => ({
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

  const moduller = await modulListesi();
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
