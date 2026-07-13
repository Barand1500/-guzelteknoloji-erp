import { Router } from 'express';
import type { Response } from 'express';
import { rolSatirlarindanOzet, yetkiListesiYanit } from '../lib/mappers.js';
import { modulListesi } from '../lib/panelModulleri.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';
import { kullaniciYonetimiErisimi, kullaniciYonetimiYazma } from '../middleware/yetki.js';

const router = Router();
router.use(authZorunlu);
router.use(kullaniciYonetimiErisimi);

async function rolleriGetir() {
  const moduller = await modulListesi();
  const [satirlar] = await Promise.all([
    prisma.rol.findMany({
      where: { durum: true },
      orderBy: [{ rolAdi: 'asc' }, { modulId: 'asc' }],
    }),
  ]);

  const prefixById = new Map(moduller.map((m) => [m.id, m.prefix]));

  return {
    roller: rolSatirlarindanOzet(satirlar, moduller),
    yetkiler: yetkiListesiYanit(),
    moduller: moduller.map((m) => ({
      id: m.prefix.replace(/_/g, '-'),
      ad: m.modulAdi,
      prefix: m.prefix,
    })),
    matris: satirlar.map((s) => ({
      rolKodu: s.rolAdi,
      modulPrefix: prefixById.get(s.modulId) ?? String(s.modulId),
      yetkiler: Array.isArray(s.yetki) ? s.yetki : [],
    })),
  };
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  return res.json(await rolleriGetir());
});

router.put('/', kullaniciYonetimiYazma, async (req: AuthRequest, res: Response) => {
  const { roller } = req.body as {
    roller?: {
      kod: string;
      baslik: string;
      aciklama?: string;
      modulYetkileri?: Record<string, string[]>;
      yetkiler?: string[];
    }[];
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
    const modulYetkileri = rol.modulYetkileri ?? {};
    const eskiDuz = rol.yetkiler ?? [];

    for (const modul of moduller) {
      const yetki =
        modulYetkileri[modul.prefix] ??
        (Object.keys(modulYetkileri).length === 0 ? eskiDuz : []);

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
          yetki,
        },
        update: {
          yetki,
          durum: true,
        },
      });
    }
  }

  return res.json(await rolleriGetir());
});

export default router;
