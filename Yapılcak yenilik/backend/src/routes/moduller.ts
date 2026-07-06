import { Router } from 'express';
import type { Response } from 'express';
import { modulIcinVarsayilanRolleriOlustur, modulListesiGetir, modulYanitOlustur } from '../lib/modulYardimci.js';
import { prefixGecerliMi, prefixNormalize, prefixUret } from '../lib/modulSabitleri.js';
import { prisma } from '../lib/prisma.js';
import { prismaMaster } from '../lib/prismaMaster.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const moduller = await modulListesiGetir();
  return res.json({
    moduller,
    ozet: {
      toplam: moduller.length,
      aktif: moduller.filter((m) => m.aktif).length,
      pasif: moduller.filter((m) => !m.aktif).length,
    },
  });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { modulAdi, prefix: hamPrefix, aktif } = req.body as {
    modulAdi?: string;
    prefix?: string;
    aktif?: boolean;
  };

  const ad = modulAdi?.trim();
  if (!ad || ad.length < 2) {
    return res.status(400).json({ mesaj: 'Modul adi en az 2 karakter olmali' });
  }
  if (ad.length > 100) {
    return res.status(400).json({ mesaj: 'Modul adi en fazla 100 karakter olabilir' });
  }

  const mevcutPrefixler = ((await prismaMaster.modul.findMany({ select: { prefix: true } })) as { prefix: string }[]).map((m) => m.prefix);
  const prefix = hamPrefix?.trim() ? prefixNormalize(hamPrefix) : prefixUret(ad, mevcutPrefixler);

  if (!prefixGecerliMi(prefix)) {
    return res.status(400).json({
      mesaj: 'Gecersiz prefix. Kucuk harf, rakam ve alt cizgi; harf ile baslamali (or. restoran_panel)',
    });
  }

  const varMi = await prismaMaster.modul.findUnique({ where: { prefix } });
  if (varMi) {
    return res.status(409).json({ mesaj: 'Bu prefix zaten kullaniliyor' });
  }

  const kayit = await prismaMaster.modul.create({
    data: { modulAdi: ad, prefix, durum: aktif !== false },
    include: { _count: { select: { roller: true } } },
  });

  await modulIcinVarsayilanRolleriOlustur(kayit.id);

  const guncel = await prismaMaster.modul.findUniqueOrThrow({
    where: { id: kayit.id },
    include: { _count: { select: { roller: true } } },
  });

  return res.status(201).json({ modul: modulYanitOlustur(guncel) });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz modul id' });
  }

  const mevcut = await prismaMaster.modul.findUnique({ where: { id } });
  if (!mevcut) {
    return res.status(404).json({ mesaj: 'Modul bulunamadi' });
  }

  const { modulAdi, prefix: hamPrefix, aktif } = req.body as {
    modulAdi?: string;
    prefix?: string;
    aktif?: boolean;
  };

  const data: { modulAdi?: string; prefix?: string; durum?: boolean } = {};

  if (modulAdi !== undefined) {
    const ad = modulAdi.trim();
    if (ad.length < 2) return res.status(400).json({ mesaj: 'Modul adi en az 2 karakter olmali' });
    if (ad.length > 100) return res.status(400).json({ mesaj: 'Modul adi en fazla 100 karakter olabilir' });
    data.modulAdi = ad;
  }

  if (hamPrefix !== undefined) {
    const prefix = prefixNormalize(hamPrefix);
    if (!prefixGecerliMi(prefix)) {
      return res.status(400).json({ mesaj: 'Gecersiz prefix formati' });
    }
    if (prefix !== mevcut.prefix) {
      const baska = await prismaMaster.modul.findUnique({ where: { prefix } });
      if (baska) return res.status(409).json({ mesaj: 'Bu prefix zaten kullaniliyor' });
      data.prefix = prefix;
    }
  }

  if (aktif !== undefined) {
    data.durum = Boolean(aktif);
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });
  }

  const guncel = await prismaMaster.modul.update({
    where: { id },
    data,
    include: { _count: { select: { roller: true } } },
  });

  return res.json({ modul: modulYanitOlustur(guncel) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz modul id' });
  }

  const mevcut = await prismaMaster.modul.findUnique({ where: { id } });
  if (!mevcut) {
    return res.status(404).json({ mesaj: 'Modul bulunamadi' });
  }

  await prismaMaster.modul.delete({ where: { id } });
  return res.json({ mesaj: 'Modul silindi' });
});

export default router;
