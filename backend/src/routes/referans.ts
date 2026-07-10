import { Router } from 'express';
import type { Response } from 'express';
import { vergiDairesiAra, vergiDairesiIlBul } from '../lib/gibVergiDaireleri.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/vergi-daireleri', async (req: AuthRequest, res: Response) => {
  const arama = String(req.query.arama ?? '');
  const plaka = String(req.query.plaka ?? '').trim() || undefined;
  const liste = await vergiDairesiAra(arama, plaka);
  return res.json({ liste });
});

router.get('/vergi-dairesi-il', async (req: AuthRequest, res: Response) => {
  const ad = String(req.query.ad ?? '');
  const plaka = await vergiDairesiIlBul(ad);
  return res.json({ plaka });
});

export default router;
