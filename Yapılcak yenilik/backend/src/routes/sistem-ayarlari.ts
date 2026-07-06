import { Router } from 'express';
import type { Response } from 'express';
import { ayarlariFormdanKaydet } from '../lib/ayarlar.js';
import { config } from '../config.js';
import { sistemAyarlariYanitOlustur } from '../lib/mappers.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  return res.json(await sistemAyarlariYanitOlustur(config.surum));
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const form = req.body as Record<string, unknown>;
  await ayarlariFormdanKaydet(form);
  return res.json(await sistemAyarlariYanitOlustur(config.surum));
});

export default router;
