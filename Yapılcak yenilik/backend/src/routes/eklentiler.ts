import { Router } from 'express';
import multer from 'multer';
import type { Response } from 'express';
import { MERKEZ_SUBE_ID } from '../lib/ayarlar.js';
import { tarihIso } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const yukleme = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', async (_req: AuthRequest, res: Response) => {
  const katalog = await prisma.eklentiKatalog.findMany({ orderBy: { ad: 'asc' } });
  const kurulumlar = await prisma.eklentiKurulum.findMany({
    where: { subeId: MERKEZ_SUBE_ID },
  });
  const kurulumMap = new Map(kurulumlar.map((k) => [k.eklentiKodu, k]));

  const eklentiler = katalog.map((e) => {
    const kurulum = kurulumMap.get(e.kod);
    return {
      kod: e.kod,
      ad: e.ad,
      aciklama: e.aciklama,
      gelistirici: e.gelistirici,
      ikon: e.ikon,
      kategori: e.kategori,
      surum: e.surum,
      puan: e.puan,
      etkinKurulum: e.etkinKurulum,
      sonGuncelleme: tarihIso(e.sonGuncelleme),
      publicHook: e.publicHook ?? undefined,
      kurulu: Boolean(kurulum),
      durum: kurulum?.durum,
      kaynak: kurulum?.kaynak,
      ayarlarJson: (kurulum?.ayarlarJson as Record<string, unknown>) ?? undefined,
    };
  });

  return res.json({ eklentiler });
});

router.post('/:kod/kur', async (req: AuthRequest, res: Response) => {
  const kod = decodeURIComponent(String(req.params.kod));

  const eklenti = await prisma.eklentiKatalog.findUnique({ where: { kod } });
  if (!eklenti) return res.status(404).json({ mesaj: 'Eklenti bulunamadi' });

  await prisma.eklentiKurulum.upsert({
    where: { subeId_eklentiKodu: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod } },
    create: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod, durum: 'kurulu', kaynak: 'katalog' },
    update: { durum: 'kurulu' },
  });

  return res.json({ mesaj: 'Kuruldu' });
});

router.patch('/:kod/aktif', async (req: AuthRequest, res: Response) => {
  const kod = decodeURIComponent(String(req.params.kod));

  await prisma.eklentiKurulum.updateMany({
    where: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod },
    data: { durum: 'aktif' },
  });

  return res.json({ mesaj: 'Aktif edildi' });
});

router.patch('/:kod/pasif', async (req: AuthRequest, res: Response) => {
  const kod = decodeURIComponent(String(req.params.kod));

  await prisma.eklentiKurulum.updateMany({
    where: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod },
    data: { durum: 'pasif' },
  });

  return res.json({ mesaj: 'Pasif edildi' });
});

router.delete('/:kod', async (req: AuthRequest, res: Response) => {
  const kod = decodeURIComponent(String(req.params.kod));

  await prisma.eklentiKurulum.deleteMany({
    where: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod },
  });
  return res.json({ mesaj: 'Kaldirildi' });
});

router.post('/yukle', yukleme.single('dosya'), async (req: AuthRequest, res: Response) => {
  const dosya = req.file;

  if (!dosya) {
    return res.status(400).json({ mesaj: 'ZIP dosyasi gerekli' });
  }

  const kod = `yukleme_${Date.now()}`;
  const ad = dosya.originalname.replace(/\.zip$/i, '') || 'Yuklenen Eklenti';

  await prisma.eklentiKatalog.upsert({
    where: { kod },
    create: {
      kod,
      ad,
      aciklama: 'Kullanici tarafindan yuklendi',
      gelistirici: 'Ozel',
      ikon: '🧩',
      kategori: 'onerilen',
      surum: '1.0.0',
      puan: 0,
      etkinKurulum: 1,
    },
    update: { ad },
  });

  await prisma.eklentiKurulum.upsert({
    where: { subeId_eklentiKodu: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod } },
    create: { subeId: MERKEZ_SUBE_ID, eklentiKodu: kod, durum: 'kurulu', kaynak: 'yukleme' },
    update: { durum: 'kurulu', kaynak: 'yukleme' },
  });

  return res.json({ mesaj: 'Eklenti yuklendi' });
});

export default router;
