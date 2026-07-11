import { Router } from 'express';
import type { Response } from 'express';
import { sifreHashle } from '../lib/crypto.js';
import { adminKullaniciYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

function sayiAl(deger: unknown): number | null {
  if (deger === null || deger === undefined || deger === '') return null;
  const n = Number(deger);
  return Number.isFinite(n) ? n : null;
}

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
  const kullaniciKodu = String(body.kullaniciKodu ?? body.email ?? '').trim().toUpperCase();
  const ad = String(body.ad ?? body.adSoyad ?? '').trim();
  const sifre = String(body.sifre ?? '').trim();
  const rol = String(body.rol ?? 'EDITOR');
  const firmaId = sayiAl(body.firmaId) ?? req.kullanici?.firmaId ?? 1;
  const donemId = sayiAl(body.donemId);
  const subeId = sayiAl(body.subeId);
  const depoId = sayiAl(body.depoId);
  const kasaId = sayiAl(body.kasaId);
  const pin = body.pin != null && String(body.pin).trim() ? String(body.pin).trim() : null;

  if (!kullaniciKodu || !ad || !sifre) {
    return res.status(400).json({ mesaj: 'Zorunlu alanlar eksik' });
  }

  const kullanici = await prisma.kullanici.create({
    data: {
      firmaId,
      donemId,
      subeId,
      depoId,
      kasaId,
      kullaniciKodu,
      adSoyad: ad,
      sifreHash: sifreHashle(sifre),
      pin,
      rol,
      durum: body.aktif !== false,
    },
  });

  await prisma.kullaniciKisayol.create({
    data: { kullaniciId: kullanici.id, harita: {} },
  });
  await prisma.kullaniciSekmeAyar.create({
    data: { kullaniciId: kullanici.id, ayarlar: {} },
  });

  return res.status(201).json({ kullanici: await adminKullaniciYanit(kullanici) });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as Record<string, unknown>;

  const veri: Record<string, unknown> = {};
  if (body.kullaniciKodu) veri.kullaniciKodu = String(body.kullaniciKodu).trim().toUpperCase();
  if (body.ad || body.adSoyad) veri.adSoyad = String(body.ad ?? body.adSoyad).trim();
  if (body.rol) veri.rol = String(body.rol);
  if (body.aktif !== undefined) veri.durum = body.aktif;
  if (body.sifre && String(body.sifre).trim()) veri.sifreHash = sifreHashle(String(body.sifre).trim());
  if ('firmaId' in body) {
    const firmaId = sayiAl(body.firmaId);
    if (firmaId) veri.firmaId = firmaId;
  }
  if ('donemId' in body) veri.donemId = sayiAl(body.donemId);
  if ('subeId' in body) veri.subeId = sayiAl(body.subeId);
  if ('depoId' in body) veri.depoId = sayiAl(body.depoId);
  if ('kasaId' in body) veri.kasaId = sayiAl(body.kasaId);
  if ('pin' in body) {
    veri.pin = body.pin != null && String(body.pin).trim() ? String(body.pin).trim() : null;
  }

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
