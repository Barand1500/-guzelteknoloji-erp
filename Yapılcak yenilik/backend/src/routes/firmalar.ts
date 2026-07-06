import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { firmaInclude, firmaListesiGetir, firmaYanitOlustur } from '../lib/firmaYardimci.js';
import { prisma } from '../lib/prisma.js';
import { prismaMaster } from '../lib/prismaMaster.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

function metinAl(deger: unknown, max: number): string | null | undefined {
  if (deger === undefined) return undefined;
  if (deger === null) return null;
  const s = String(deger).trim();
  if (!s) return null;
  return s.slice(0, max);
}

function iskontoAl(deger: unknown): number | null | undefined {
  if (deger === undefined) return undefined;
  if (deger === null || deger === '') return null;
  const n = Number(deger);
  if (Number.isNaN(n) || n < 0 || n > 100) return undefined;
  return n;
}

function iskontoGecersizMi(deger: unknown): boolean {
  if (deger === undefined || deger === null || deger === '') return false;
  const n = Number(deger);
  return Number.isNaN(n) || n < 0 || n > 100;
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  const firmalar = await firmaListesiGetir();
  return res.json({ firmalar });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const unvan = metinAl(body.unvan, 191);
  if (!unvan || unvan.length < 2) {
    return res.status(400).json({ mesaj: 'Unvan en az 2 karakter olmali' });
  }

  const bayiId = Number(body.bayiId);
  if (!Number.isInteger(bayiId) || bayiId < 1) {
    return res.status(400).json({ mesaj: 'Gecerli bir bayi secin' });
  }

  const bayi = await prismaMaster.bayi.findUnique({ where: { id: bayiId } });
  if (!bayi) return res.status(400).json({ mesaj: 'Bayi bulunamadi' });
  if (!bayi.durum) return res.status(400).json({ mesaj: 'Pasif bayiye firma atanamaz' });

  const iskonto = iskontoAl(body.iskonto);
  if (iskontoGecersizMi(body.iskonto)) {
    return res.status(400).json({ mesaj: 'Iskonto 0-100 arasinda olmali' });
  }

  try {
    const kayit = await prismaMaster.firma.create({
      data: {
        bayiId,
        unvan,
        tabelaAdi: metinAl(body.tabelaAdi, 150),
        il: metinAl(body.il, 50),
        ilce: metinAl(body.ilce, 50),
        telefon: metinAl(body.telefon, 20),
        gsm: metinAl(body.gsm, 20),
        eposta: metinAl(body.eposta, 191),
        vergiDairesi: metinAl(body.vergiDairesi, 100),
        vergiNo: metinAl(body.vergiNo, 50),
        iskonto: iskonto != null ? new Prisma.Decimal(iskonto) : null,
        durum: body.aktif === false ? false : true,
      },
      include: firmaInclude,
    });
    return res.status(201).json({ firma: firmaYanitOlustur(kayit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mesaj: 'Firma olusturulamadi' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz firma id' });
  }

  const mevcut = await prismaMaster.firma.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Firma bulunamadi' });

  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.unvan !== undefined) {
    const unvan = metinAl(body.unvan, 191);
    if (!unvan || unvan.length < 2) return res.status(400).json({ mesaj: 'Unvan en az 2 karakter olmali' });
    data.unvan = unvan;
  }

  if (body.tabelaAdi !== undefined) data.tabelaAdi = metinAl(body.tabelaAdi, 150);

  if (body.bayiId !== undefined) {
    const bayiId = Number(body.bayiId);
    if (!Number.isInteger(bayiId) || bayiId < 1) {
      return res.status(400).json({ mesaj: 'Gecerli bir bayi secin' });
    }
    const bayi = await prismaMaster.bayi.findUnique({ where: { id: bayiId } });
    if (!bayi) return res.status(400).json({ mesaj: 'Bayi bulunamadi' });
    if (!bayi.durum) return res.status(400).json({ mesaj: 'Pasif bayiye firma atanamaz' });
    data.bayi = { connect: { id: bayiId } };
  }

  if (body.aktif !== undefined) data.durum = Boolean(body.aktif);
  if (body.il !== undefined) data.il = metinAl(body.il, 50);
  if (body.ilce !== undefined) data.ilce = metinAl(body.ilce, 50);
  if (body.telefon !== undefined) data.telefon = metinAl(body.telefon, 20);
  if (body.gsm !== undefined) data.gsm = metinAl(body.gsm, 20);
  if (body.eposta !== undefined) data.eposta = metinAl(body.eposta, 191);
  if (body.vergiDairesi !== undefined) data.vergiDairesi = metinAl(body.vergiDairesi, 100);
  if (body.vergiNo !== undefined) data.vergiNo = metinAl(body.vergiNo, 50);

  if (body.iskonto !== undefined) {
    if (iskontoGecersizMi(body.iskonto)) {
      return res.status(400).json({ mesaj: 'Iskonto 0-100 arasinda olmali' });
    }
    const iskonto = iskontoAl(body.iskonto);
    data.iskonto = iskonto != null ? new Prisma.Decimal(iskonto) : null;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });
  }

  const guncel = await prismaMaster.firma.update({
    where: { id },
    data,
    include: firmaInclude,
  });

  return res.json({ firma: firmaYanitOlustur(guncel) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz firma id' });
  }

  const mevcut = await prismaMaster.firma.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Firma bulunamadi' });

  await prismaMaster.firma.delete({ where: { id } });
  return res.json({ mesaj: 'Firma silindi' });
});

export default router;
