import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { paketListesiGetir, paketLisansSayilariGetir, paketYanitOlustur } from '../lib/paketYardimci.js';
import { paraBirimiDogrula } from '../lib/paraBirimiYardimci.js';
import { prisma } from '../lib/prisma.js';
import { prismaMaster } from '../lib/prismaMaster.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const paketler = await paketListesiGetir();
  const lisansSayilari = await paketLisansSayilariGetir();
  return res.json({
    paketler: paketler.map((p) => ({
      ...p,
      aktifLisansSayisi: lisansSayilari.get(p.id) ?? 0,
    })),
  });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const paketAdi = String(body.paketAdi ?? '').trim();
  if (paketAdi.length < 2) return res.status(400).json({ mesaj: 'Paket adi en az 2 karakter olmali' });

  const subeSayisi = Number(body.subeSayisi ?? 1);
  const personelSayisi = Number(body.personelSayisi ?? 10);
  const masaSayisi = Number(body.masaSayisi ?? 50);
  const fiyat = Number(body.fiyat ?? 0);

  if ([subeSayisi, personelSayisi, masaSayisi].some((n) => !Number.isInteger(n) || n < 1)) {
    return res.status(400).json({ mesaj: 'Sayilar pozitif tam sayi olmali' });
  }
  if (Number.isNaN(fiyat) || fiyat < 0) return res.status(400).json({ mesaj: 'Gecersiz fiyat' });

  const paraBirimi = paraBirimiDogrula(body.paraBirimi);
  if (!paraBirimi) return res.status(400).json({ mesaj: 'Gecersiz para birimi' });

  const kayit = await prismaMaster.paket.create({
    data: {
      paketAdi,
      subeSayisi,
      personelSayisi,
      masaSayisi,
      fiyat: new Prisma.Decimal(fiyat),
      paraBirimi,
      durum: body.aktif === false ? false : true,
    },
  });
  return res.status(201).json({ paket: { ...paketYanitOlustur(kayit), aktifLisansSayisi: 0 } });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mesaj: 'Gecersiz paket id' });

  const mevcut = await prismaMaster.paket.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Paket bulunamadi' });

  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.paketAdi !== undefined) {
    const ad = String(body.paketAdi).trim();
    if (ad.length < 2) return res.status(400).json({ mesaj: 'Paket adi en az 2 karakter olmali' });
    data.paketAdi = ad;
  }
  if (body.subeSayisi !== undefined) {
    const n = Number(body.subeSayisi);
    if (!Number.isInteger(n) || n < 1) return res.status(400).json({ mesaj: 'Gecersiz sube sayisi' });
    data.subeSayisi = n;
  }
  if (body.personelSayisi !== undefined) {
    const n = Number(body.personelSayisi);
    if (!Number.isInteger(n) || n < 1) return res.status(400).json({ mesaj: 'Gecersiz personel sayisi' });
    data.personelSayisi = n;
  }
  if (body.masaSayisi !== undefined) {
    const n = Number(body.masaSayisi);
    if (!Number.isInteger(n) || n < 1) return res.status(400).json({ mesaj: 'Gecersiz masa sayisi' });
    data.masaSayisi = n;
  }
  if (body.fiyat !== undefined) {
    const f = Number(body.fiyat);
    if (Number.isNaN(f) || f < 0) return res.status(400).json({ mesaj: 'Gecersiz fiyat' });
    data.fiyat = new Prisma.Decimal(f);
  }
  if (body.paraBirimi !== undefined) {
    const pb = paraBirimiDogrula(body.paraBirimi, '');
    if (!pb) return res.status(400).json({ mesaj: 'Gecersiz para birimi' });
    data.paraBirimi = pb;
  }
  if (body.aktif !== undefined) data.durum = Boolean(body.aktif);

  if (Object.keys(data).length === 0) return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });

  const guncel = await prismaMaster.paket.update({ where: { id }, data });
  const lisansSayilari = await paketLisansSayilariGetir();
  return res.json({
    paket: { ...paketYanitOlustur(guncel), aktifLisansSayisi: lisansSayilari.get(id) ?? 0 },
  });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mesaj: 'Gecersiz paket id' });

  const mevcut = await prismaMaster.paket.findUnique({
    where: { id },
    include: { _count: { select: { lisanslar: true } } },
  });
  if (!mevcut) return res.status(404).json({ mesaj: 'Paket bulunamadi' });
  if (mevcut._count.lisanslar > 0) {
    return res.status(400).json({ mesaj: 'Lisansi olan paket silinemez' });
  }

  await prismaMaster.paket.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
