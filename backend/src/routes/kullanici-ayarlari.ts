import { Router } from 'express';
import type { Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

function kullaniciIdAl(req: AuthRequest): number {
  return req.kullanici!.id;
}

router.get('/kisayol', async (req: AuthRequest, res: Response) => {
  const kullaniciId = kullaniciIdAl(req);
  const kayit = await prisma.kullaniciKisayol.findUnique({ where: { kullaniciId } });
  const harita = (kayit?.harita ?? {}) as Record<string, string>;
  return res.json({ harita });
});

router.put('/kisayol', async (req: AuthRequest, res: Response) => {
  const kullaniciId = kullaniciIdAl(req);
  const body = req.body as { harita?: unknown };

  if (!body.harita || typeof body.harita !== 'object' || Array.isArray(body.harita)) {
    return res.status(400).json({ mesaj: 'harita nesnesi gerekli' });
  }

  const haritaJson = body.harita as Prisma.InputJsonValue;

  const kayit = await prisma.kullaniciKisayol.upsert({
    where: { kullaniciId },
    create: { kullaniciId, harita: haritaJson },
    update: { harita: haritaJson },
  });

  return res.json({ harita: kayit.harita });
});

router.get('/sekme', async (req: AuthRequest, res: Response) => {
  const kullaniciId = kullaniciIdAl(req);
  const kayit = await prisma.kullaniciSekmeAyar.findUnique({ where: { kullaniciId } });
  const ayarlar = (kayit?.ayarlar ?? {}) as Record<string, unknown>;
  return res.json({ ayarlar });
});

router.put('/sekme', async (req: AuthRequest, res: Response) => {
  const kullaniciId = kullaniciIdAl(req);
  const body = req.body as { ayarlar?: unknown };

  if (!body.ayarlar || typeof body.ayarlar !== 'object' || Array.isArray(body.ayarlar)) {
    return res.status(400).json({ mesaj: 'ayarlar nesnesi gerekli' });
  }

  const ayarlarJson = body.ayarlar as Prisma.InputJsonValue;

  const kayit = await prisma.kullaniciSekmeAyar.upsert({
    where: { kullaniciId },
    create: { kullaniciId, ayarlar: ayarlarJson },
    update: { ayarlar: ayarlarJson },
  });

  return res.json({ ayarlar: kayit.ayarlar });
});

export default router;
