import { Router } from 'express';
import type { Response } from 'express';
import { sifreHashle } from '../lib/crypto.js';
import { adminKullaniciYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { kayitTarihi: 'desc' },
  });
  const liste = await Promise.all(kullanicilar.map(adminKullaniciYanit));
  return res.json({ kullanicilar: liste });
});

router.get('/siteler', (_req: AuthRequest, res: Response) => {
  return res.json({ siteler: [] });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const kullaniciKodu = String(body.kullaniciKodu ?? '').trim().toUpperCase();
  const ad = String(body.ad ?? body.adSoyad ?? '').trim();
  const sifre = String(body.sifre ?? '').trim();
  const rol = String(body.rol ?? 'EDITOR');
  const firmaId = Number(body.firmaId ?? req.kullanici?.firmaId ?? 1);

  if (!kullaniciKodu || !ad || !sifre) {
    return res.status(400).json({ mesaj: 'Zorunlu alanlar eksik' });
  }

  const kullanici = await prisma.kullanici.create({
    data: {
      firmaId,
      kullaniciKodu,
      adSoyad: ad,
      sifreHash: sifreHashle(sifre),
      rol,
      durum: body.aktif !== false,
    },
  });

  await prisma.kullaniciKisayol.create({
    data: { kullaniciId: kullanici.id, harita: {} },
  });

  return res.status(201).json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { kullaniciKodu, ad, adSoyad, sifre, rol, aktif } = req.body as {
    kullaniciKodu?: string;
    ad?: string;
    adSoyad?: string;
    sifre?: string;
    rol?: string;
    aktif?: boolean;
  };

  const veri: Record<string, unknown> = {};
  if (kullaniciKodu) veri.kullaniciKodu = kullaniciKodu.trim().toUpperCase();
  if (ad || adSoyad) veri.adSoyad = (ad ?? adSoyad)!.trim();
  if (rol) veri.rol = rol;
  if (aktif !== undefined) veri.durum = aktif;
  if (sifre?.trim()) veri.sifreHash = sifreHashle(sifre);

  const kullanici = await prisma.kullanici.update({
    where: { id },
    data: veri,
  });

  return res.json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (id === req.kullanici?.id) {
    return res.status(400).json({ mesaj: 'Kendi hesabinizi silemezsiniz' });
  }
  await prisma.kullanici.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
