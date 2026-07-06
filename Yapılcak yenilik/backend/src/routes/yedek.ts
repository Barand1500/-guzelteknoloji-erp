import { Router } from 'express';
import multer from 'multer';
import type { Response } from 'express';
import { MERKEZ_SUBE_ID, tumAyarlarOku } from '../lib/ayarlar.js';
import { rolSatirlarindanOzet, tarihIso } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const yukleme = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function varsayilanDosyaAdi(): string {
  const tarih = new Date().toISOString().slice(0, 10);
  return `yedek-admin-${tarih}`;
}

router.get('/varsayilan-dosya-adi', (_req, res: Response) => {
  return res.json({ dosyaAdi: varsayilanDosyaAdi() });
});

router.get('/gecmis', async (_req: AuthRequest, res: Response) => {
  const kayitlar = await prisma.yedekKaydi.findMany({
    orderBy: { olusturma: 'desc' },
    take: 50,
  });

  const sonKayit = kayitlar[0] ?? null;

  return res.json({
    kayitlar: kayitlar.map((k) => ({
      id: k.id,
      kullaniciId: k.kullaniciId,
      kullaniciAd: k.kullaniciAd,
      kullaniciEmail: k.kullaniciEmail,
      dosyaAdi: k.dosyaAdi,
      tip: k.tip,
      olusturma: tarihIso(k.olusturma),
    })),
    sonKayit: sonKayit
      ? {
          id: sonKayit.id,
          kullaniciId: sonKayit.kullaniciId,
          kullaniciAd: sonKayit.kullaniciAd,
          kullaniciEmail: sonKayit.kullaniciEmail,
          dosyaAdi: sonKayit.dosyaAdi,
          tip: sonKayit.tip,
          olusturma: tarihIso(sonKayit.olusturma),
        }
      : null,
  });
});

async function yedekVerisiAl() {
  const ayarlar = await tumAyarlarOku(MERKEZ_SUBE_ID);
  const satirlar = await prisma.rol.findMany({ where: { durum: true } });
  const eklentiler = await prisma.eklentiKurulum.findMany({ where: { subeId: MERKEZ_SUBE_ID } });
  return {
    surum: '3.0',
    olusturma: new Date().toISOString(),
    ayarlar,
    roller: rolSatirlarindanOzet(satirlar),
    eklentiler,
  };
}

router.post('/indir', async (req: AuthRequest, res: Response) => {
  const k = req.kullanici!;
  const { dosyaAdi, format = 'json' } = req.body as { dosyaAdi?: string; format?: string };

  const ad = (dosyaAdi?.trim() || varsayilanDosyaAdi()).replace(/[^\w.\-]+/g, '_');
  const veri = await yedekVerisiAl();
  const icerik = JSON.stringify(veri, null, 2);

  await prisma.yedekKaydi.create({
    data: {
      kullaniciId: k.id,
      kullaniciAd: k.ad,
      kullaniciEmail: k.email,
      dosyaAdi: `${ad}.${format}`,
      tip: 'indir',
      format: format === 'sql' || format === 'zip' || format === 'rar' ? format : 'json',
    },
  });

  const mime =
    format === 'json'
      ? 'application/json'
      : format === 'sql'
        ? 'application/sql'
        : 'application/octet-stream';

  res.setHeader('Content-Disposition', `attachment; filename="${ad}.${format}"`);
  res.setHeader('Content-Type', mime);
  return res.send(icerik);
});

router.post('/geri-yukle', yukleme.single('dosya'), async (req: AuthRequest, res: Response) => {
  const k = req.kullanici!;
  const dosya = req.file;

  if (!dosya) {
    return res.status(400).json({ mesaj: 'Dosya gerekli' });
  }

  try {
    JSON.parse(dosya.buffer.toString('utf-8'));
  } catch {
    return res.status(400).json({ mesaj: 'Gecersiz yedek dosyasi (JSON bekleniyor)' });
  }

  const dosyaAdi =
    (req.body as { dosyaAdi?: string }).dosyaAdi?.trim() || dosya.originalname || 'yedek.json';

  await prisma.yedekKaydi.create({
    data: {
      kullaniciId: k.id,
      kullaniciAd: k.ad,
      kullaniciEmail: k.email,
      dosyaAdi,
      tip: 'geri_yukle',
      format: 'json',
    },
  });

  return res.json({ mesaj: 'Geri yukleme kaydi olusturuldu' });
});

export default router;
