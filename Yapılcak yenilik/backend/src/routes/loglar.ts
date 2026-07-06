import { Router } from 'express';
import type { Response } from 'express';
import { AYAR_ANAHTARLARI, MERKEZ_SUBE_ID } from '../lib/ayarlar.js';
import { tarihIso } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

function istemciIp(req: AuthRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  const loglar = await prisma.log.findMany({
    orderBy: { kayitTarihi: 'desc' },
    take: 500,
    include: { kullanici: { select: { ad: true, email: true } } },
  });

  return res.json({
    loglar: loglar.map((l) => ({
      id: l.id,
      kullaniciId: l.kullaniciId,
      mesaj: l.mesaj,
      ipAdresi: l.ipAdresi,
      kayitTarihi: tarihIso(l.kayitTarihi),
      kullaniciAd: l.kullanici?.ad ?? null,
      kullaniciEmail: l.kullanici?.email ?? null,
    })),
  });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const k = req.kullanici!;
  const { mesaj, islem, modulId, aksiyonId } = req.body as {
    mesaj?: string;
    islem?: string;
    modulId?: string;
    aksiyonId?: string;
  };

  const metin =
    mesaj?.trim() ||
    [islem?.trim(), modulId && `modul:${modulId}`, aksiyonId && `aksiyon:${aksiyonId}`]
      .filter(Boolean)
      .join(' | ');

  if (!metin) {
    return res.status(400).json({ mesaj: 'Mesaj gerekli' });
  }

  await prisma.log.create({
    data: {
      kullaniciId: k.id,
      logTipi: modulId ? String(modulId) : 'panel',
      mesaj: metin,
      ipAdresi: istemciIp(req),
    },
  });

  return res.json({ mesaj: 'Kaydedildi' });
});

router.delete('/temizle', async (_req: AuthRequest, res: Response) => {
  const kayit = await prisma.ayar.findUnique({
    where: { subeId_anahtar: { subeId: MERKEZ_SUBE_ID, anahtar: AYAR_ANAHTARLARI.logSaklamaGun } },
  });
  const gun = Number(kayit?.deger ?? 90);
  const esik = new Date();
  esik.setDate(esik.getDate() - gun);

  await prisma.log.deleteMany({
    where: { kayitTarihi: { lt: esik } },
  });

  return res.json({ mesaj: 'Eski loglar temizlendi' });
});

export default router;
