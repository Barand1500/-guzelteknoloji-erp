import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { sifreHashle } from '../lib/crypto.js';
import { adminKullaniciYanit, rolIdCoz } from '../lib/mappers.js';
import {
  kullaniciInclude,
  masterKullaniciListesiGetir,
  masterKullaniciYanitOlustur,
} from '../lib/masterKullaniciYardimci.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const GECERLI_TIPLER = ['merkez', 'bayi', 'firma', 'sube'] as const;

router.get('/master', async (_req: AuthRequest, res: Response) => {
  const kullanicilar = await masterKullaniciListesiGetir();
  return res.json({ kullanicilar });
});

router.get('/', async (_req: AuthRequest, res: Response) => {
  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { olusturma: 'desc' },
  });
  const liste = await Promise.all(kullanicilar.map(adminKullaniciYanit));
  return res.json({ kullanicilar: liste });
});

router.get('/siteler', (_req: AuthRequest, res: Response) => {
  return res.json({ siteler: [] });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const email = String(body.email ?? '').trim();
  const ad = String(body.ad ?? '').trim();
  const sifre = String(body.sifre ?? '').trim();
  const rol = String(body.rol ?? '');

  if (!email || !ad || !sifre || !rol) {
    return res.status(400).json({ mesaj: 'Zorunlu alanlar eksik' });
  }

  const rolId = await rolIdCoz(rol);
  const kullaniciTipi = GECERLI_TIPLER.includes(body.kullaniciTipi as (typeof GECERLI_TIPLER)[number])
    ? (body.kullaniciTipi as (typeof GECERLI_TIPLER)[number])
    : 'merkez';

  const bayiId = body.bayiId != null && body.bayiId !== '' ? Number(body.bayiId) : null;
  const firmaId = body.firmaId != null && body.firmaId !== '' ? Number(body.firmaId) : null;
  const subeId = body.subeId != null && body.subeId !== '' ? Number(body.subeId) : null;
  const gsm = body.gsm != null && String(body.gsm).trim() ? String(body.gsm).trim().slice(0, 20) : null;

  let iskonto: number | null = null;
  if (body.iskonto != null && body.iskonto !== '') {
    iskonto = Number(body.iskonto);
    if (Number.isNaN(iskonto) || iskonto < 0 || iskonto > 100) {
      return res.status(400).json({ mesaj: 'Iskonto 0-100 arasinda olmali' });
    }
  }

  const kullanici = await prisma.kullanici.create({
    data: {
      email: email.toLowerCase(),
      ad,
      sifreHash: sifreHashle(sifre),
      rolId,
      kullaniciTipi,
      bayiId,
      firmaId,
      subeId,
      gsm,
      iskonto: iskonto != null ? new Prisma.Decimal(iskonto) : null,
      aktif: body.aktif !== false,
    },
    include: kullaniciInclude(),
  });

  await prisma.kullaniciKisayol.create({
    data: { kullaniciId: kullanici.id, harita: {} },
  });

  if (body.kapsam === 'master') {
    return res.status(201).json({ kullanici: await masterKullaniciYanitOlustur(kullanici) });
  }

  return res.status(201).json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as Record<string, unknown>;
  const data: Prisma.KullaniciUncheckedUpdateInput = {};

  if (body.aktif !== undefined) data.aktif = Boolean(body.aktif);
  if (body.ad !== undefined) data.ad = String(body.ad).trim();
  if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase();
  if (body.gsm !== undefined) data.gsm = body.gsm ? String(body.gsm).trim().slice(0, 20) : null;
  if (body.rol !== undefined) data.rolId = await rolIdCoz(String(body.rol));
  if (body.kullaniciTipi !== undefined && GECERLI_TIPLER.includes(body.kullaniciTipi as (typeof GECERLI_TIPLER)[number])) {
    data.kullaniciTipi = body.kullaniciTipi as (typeof GECERLI_TIPLER)[number];
  }
  if (body.bayiId !== undefined) {
    data.bayiId = body.bayiId ? Number(body.bayiId) : null;
  }
  if (body.firmaId !== undefined) {
    data.firmaId = body.firmaId ? Number(body.firmaId) : null;
  }
  if (body.subeId !== undefined) {
    data.subeId = body.subeId ? Number(body.subeId) : null;
  }
  if (body.sifre && String(body.sifre).trim()) {
    data.sifreHash = sifreHashle(String(body.sifre));
  }
  if (body.iskonto !== undefined) {
    if (body.iskonto === null || body.iskonto === '') {
      data.iskonto = null;
    } else {
      const iskonto = Number(body.iskonto);
      if (Number.isNaN(iskonto) || iskonto < 0 || iskonto > 100) {
        return res.status(400).json({ mesaj: 'Iskonto 0-100 arasinda olmali' });
      }
      data.iskonto = new Prisma.Decimal(iskonto);
    }
  }

  if (Object.keys(data).length === 0) return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });

  const kullanici = await prisma.kullanici.update({
    where: { id },
    data,
    include: kullaniciInclude(),
  });

  return res.json({ kullanici: await masterKullaniciYanitOlustur(kullanici) });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { email, ad, sifre, rol, aktif } = req.body as {
    email?: string;
    ad?: string;
    sifre?: string;
    rol?: string;
    aktif?: boolean;
  };

  const veri: Record<string, unknown> = {};
  if (email) veri.email = email.trim().toLowerCase();
  if (ad) veri.ad = ad.trim();
  if (rol) veri.rolId = await rolIdCoz(rol);
  if (aktif !== undefined) veri.aktif = aktif;
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
