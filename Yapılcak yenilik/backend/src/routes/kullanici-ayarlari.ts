import { Router } from 'express';
import type { Response } from 'express';
import {
  kisayolHaritasiGetir,
  kisayolHaritasiKaydet,
  sekmeAyarlariGetir,
  sekmeAyarlariKaydet,
} from '../lib/kullaniciAyarlari.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/sekme', async (req: AuthRequest, res: Response) => {
  const ayarlar = await sekmeAyarlariGetir(req.kullanici!.id);
  return res.json({ ayarlar });
});

router.put('/sekme', async (req: AuthRequest, res: Response) => {
  const { ayarlar } = req.body as { ayarlar?: Record<string, unknown> };
  if (!ayarlar || typeof ayarlar !== 'object' || Array.isArray(ayarlar)) {
    return res.status(400).json({ mesaj: 'Gecerli ayarlar gerekli' });
  }
  const kayit = await sekmeAyarlariKaydet(req.kullanici!.id, ayarlar);
  return res.json({ ayarlar: kayit });
});

router.get('/kisayol', async (req: AuthRequest, res: Response) => {
  const harita = await kisayolHaritasiGetir(req.kullanici!.id);
  return res.json({ harita });
});

router.put('/kisayol', async (req: AuthRequest, res: Response) => {
  const { harita } = req.body as { harita?: Record<string, unknown> };
  if (!harita || typeof harita !== 'object' || Array.isArray(harita)) {
    return res.status(400).json({ mesaj: 'Gecerli harita gerekli' });
  }
  const kayit = await kisayolHaritasiKaydet(req.kullanici!.id, harita);
  return res.json({ harita: kayit });
});

export default router;
