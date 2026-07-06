import { Router } from 'express';
import type { Response } from 'express';
import { tarihIso } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const bildirimler = await prisma.bildirim.findMany({
    orderBy: { olusturma: 'desc' },
    take: 100,
  });

  const okunmamisSayi = await prisma.bildirim.count({
    where: { okundu: false },
  });

  return res.json({
    bildirimler: bildirimler.map((b) => ({
      id: b.id,
      tip: b.tip,
      baslik: b.baslik,
      mesaj: b.mesaj,
      okundu: b.okundu,
      olusturma: tarihIso(b.olusturma),
      link: b.link ?? undefined,
    })),
    okunmamisSayi,
  });
});

router.patch('/tumu-okundu', async (_req: AuthRequest, res: Response) => {
  await prisma.bildirim.updateMany({
    where: { okundu: false },
    data: { okundu: true },
  });
  return res.json({ mesaj: 'Tumu okundu' });
});

export default router;
