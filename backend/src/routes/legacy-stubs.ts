import { Router } from 'express';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

/** Sayfa modulu kaldirildi — eski frontend 404 almasin diye bos liste */
const router = Router();
router.use(authZorunlu);

router.get('/sayfalar', (_req: AuthRequest, res: Response) => {
  return res.json({ sayfalar: [] });
});

router.get('/menu', (_req: AuthRequest, res: Response) => {
  return res.json({ sayfalar: [] });
});

export default router;
