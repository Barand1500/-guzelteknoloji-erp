import { Router } from 'express';
import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const MAX_SATIR = 500;

function firmaIdAl(req: AuthRequest): number {
  return req.kullanici?.firmaId ?? 1;
}

function satirlarGecerliMi(deger: unknown): deger is unknown[] {
  return Array.isArray(deger);
}

router.get('/siparis-icerigi', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const kayit = await prisma.datagridDemoKayit.findUnique({ where: { firmaId } });
  if (!kayit) {
    return res.json({ kdvDahil: true, satirlar: [] });
  }
  return res.json({
    kdvDahil: kayit.kdvDahil,
    satirlar: kayit.satirlar,
  });
});

router.put('/siparis-icerigi', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const body = req.body as { kdvDahil?: boolean; satirlar?: unknown };

  if (!satirlarGecerliMi(body.satirlar)) {
    return res.status(400).json({ mesaj: 'Satirlar dizisi gerekli' });
  }
  if (body.satirlar.length > MAX_SATIR) {
    return res.status(400).json({ mesaj: `En fazla ${MAX_SATIR} satir kaydedilebilir` });
  }

  const firmaVar = await prisma.firma.findUnique({ where: { id: firmaId }, select: { id: true } });
  if (!firmaVar) {
    return res.status(400).json({ mesaj: 'Gecersiz firma baglami' });
  }

  const kayit = await prisma.datagridDemoKayit.upsert({
    where: { firmaId },
    create: {
      firmaId,
      kdvDahil: body.kdvDahil !== false,
      satirlar: body.satirlar,
    },
    update: {
      kdvDahil: body.kdvDahil !== false,
      satirlar: body.satirlar,
    },
  });

  return res.json({
    kdvDahil: kayit.kdvDahil,
    satirlar: kayit.satirlar,
  });
});

export default router;
