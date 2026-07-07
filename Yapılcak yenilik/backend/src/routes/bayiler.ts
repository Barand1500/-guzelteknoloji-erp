import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  bayiInclude,
  bayiListesiGetir,
  bayiTekGetir,
  bayiYanitOlustur,
  ustBayiGecerliMi,
} from '../lib/bayiYardimci.js';
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

router.get('/', async (_req: AuthRequest, res: Response) => {
  const bayiler = await bayiListesiGetir();
  return res.json({
    bayiler,
    ozet: {
      toplam: bayiler.length,
      aktif: bayiler.filter((b) => b.aktif).length,
      pasif: bayiler.filter((b) => !b.aktif).length,
      toplamFirma: bayiler.reduce((s, b) => s + b.firmaSayisi, 0),
      altBayi: bayiler.filter((b) => b.ustId != null).length,
    },
  });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const unvan = metinAl(body.unvan, 191);
  if (!unvan || unvan.length < 2) {
    return res.status(400).json({ mesaj: 'Unvan en az 2 karakter olmali' });
  }

  const ustId = body.ustId != null && body.ustId !== '' ? Number(body.ustId) : null;
  if (ustId != null && (!Number.isInteger(ustId) || ustId < 1)) {
    return res.status(400).json({ mesaj: 'Gecersiz ust bayi' });
  }
  if (ustId != null) {
    const ustVar = await prismaMaster.bayi.findUnique({ where: { id: ustId } });
    if (!ustVar) return res.status(400).json({ mesaj: 'Ust bayi bulunamadi' });
  }

  const iskontoHam = body.iskonto;
  let iskonto: number | null = null;
  if (iskontoHam != null && iskontoHam !== '') {
    iskonto = Number(iskontoHam);
    if (Number.isNaN(iskonto) || iskonto < 0 || iskonto > 100) {
      return res.status(400).json({ mesaj: 'Iskonto 0-100 arasi olmali' });
    }
  }

  try {
    const kayit = await prismaMaster.bayi.create({
      data: {
        unvan,
        ustId,
        il: metinAl(body.il, 50),
        ilce: metinAl(body.ilce, 50),
        adres: metinAl(body.adres, 500),
        telefon: metinAl(body.telefon, 20),
        gsm: metinAl(body.gsm, 20),
        eposta: metinAl(body.eposta, 191),
        vergiDairesi: metinAl(body.vergiDairesi, 100),
        vergiNo: metinAl(body.vergiNo, 50),
        iskonto: iskonto != null ? new Prisma.Decimal(iskonto) : null,
        durum: body.aktif === false ? false : true,
      },
      include: bayiInclude,
    });
    return res.status(201).json({ bayi: bayiYanitOlustur(kayit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mesaj: 'Bayi olusturulamadi' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz bayi id' });
  }

  const mevcut = await prismaMaster.bayi.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Bayi bulunamadi' });

  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.unvan !== undefined) {
    const unvan = metinAl(body.unvan, 191);
    if (!unvan || unvan.length < 2) return res.status(400).json({ mesaj: 'Unvan en az 2 karakter olmali' });
    data.unvan = unvan;
  }

  if (body.ustId !== undefined) {
    const ustId = body.ustId === null || body.ustId === '' ? null : Number(body.ustId);
    if (ustId != null && (!Number.isInteger(ustId) || ustId < 1)) {
      return res.status(400).json({ mesaj: 'Gecersiz ust bayi' });
    }
    if (!(await ustBayiGecerliMi(id, ustId))) {
      return res.status(400).json({ mesaj: 'Gecersiz ust bayi hiyerarsisi' });
    }
    data.ustBayi = ustId != null ? { connect: { id: ustId } } : { disconnect: true };
  }

  if (body.aktif !== undefined) data.durum = Boolean(body.aktif);
  if (body.il !== undefined) data.il = metinAl(body.il, 50);
  if (body.ilce !== undefined) data.ilce = metinAl(body.ilce, 50);
  if (body.adres !== undefined) data.adres = metinAl(body.adres, 500);
  if (body.telefon !== undefined) data.telefon = metinAl(body.telefon, 20);
  if (body.gsm !== undefined) data.gsm = metinAl(body.gsm, 20);
  if (body.eposta !== undefined) data.eposta = metinAl(body.eposta, 191);
  if (body.vergiDairesi !== undefined) data.vergiDairesi = metinAl(body.vergiDairesi, 100);
  if (body.vergiNo !== undefined) data.vergiNo = metinAl(body.vergiNo, 50);

  if (body.iskonto !== undefined) {
    if (body.iskonto === null || body.iskonto === '') {
      data.iskonto = null;
    } else {
      const iskonto = Number(body.iskonto);
      if (Number.isNaN(iskonto) || iskonto < 0 || iskonto > 100) {
        return res.status(400).json({ mesaj: 'Iskonto 0-100 arasi olmali' });
      }
      data.iskonto = new Prisma.Decimal(iskonto);
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });
  }

  const guncel = await prismaMaster.bayi.update({
    where: { id },
    data,
    include: bayiInclude,
  });

  return res.json({ bayi: bayiYanitOlustur(guncel) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz bayi id' });
  }

  const mevcut = await prismaMaster.bayi.findUnique({
    where: { id },
    include: { _count: { select: { firmalar: true, altBayiler: true } } },
  });
  if (!mevcut) return res.status(404).json({ mesaj: 'Bayi bulunamadi' });
  if (mevcut._count.firmalar > 0) {
    return res.status(400).json({ mesaj: 'Firmalari olan bayi silinemez' });
  }
  if (mevcut._count.altBayiler > 0) {
    return res.status(400).json({ mesaj: 'Alt bayileri olan bayi silinemez' });
  }

  await prismaMaster.bayi.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
