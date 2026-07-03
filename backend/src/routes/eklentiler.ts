import { Router } from 'express';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', (_req: AuthRequest, res: Response) => {
  return res.json({ eklentiler: [] });
});

router.post('/:kod/kur', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Eklenti sistemi ERP surumunde henuz aktif degil' });
});

router.post('/:kod/aktif', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Eklenti sistemi ERP surumunde henuz aktif degil' });
});

router.post('/:kod/pasif', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Eklenti sistemi ERP surumunde henuz aktif degil' });
});

router.delete('/:kod', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Eklenti sistemi ERP surumunde henuz aktif degil' });
});

router.post('/yukle', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Eklenti sistemi ERP surumunde henuz aktif degil' });
});

export default router;
