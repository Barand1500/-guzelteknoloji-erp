import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { subeInclude, subeListesiGetir, subeTipiGecerliMi, subeYanitOlustur } from '../lib/subeYardimci.js';
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
  const subeler = await subeListesiGetir();
  return res.json({ subeler });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const subeAdi = metinAl(body.subeAdi, 100);
  if (!subeAdi || subeAdi.length < 2) {
    return res.status(400).json({ mesaj: 'Sube adi en az 2 karakter olmali' });
  }

  const firmaId = Number(body.firmaId);
  if (!Number.isInteger(firmaId) || firmaId < 1) {
    return res.status(400).json({ mesaj: 'Gecerli bir firma secin' });
  }

  const firma = await prismaMaster.firma.findUnique({ where: { id: firmaId } });
  if (!firma) return res.status(400).json({ mesaj: 'Firma bulunamadi' });
  if (!firma.durum) return res.status(400).json({ mesaj: 'Pasif firmaya sube atanamaz' });

  const subeTipi = body.subeTipi ?? 'restoran';
  if (!subeTipiGecerliMi(subeTipi)) {
    return res.status(400).json({ mesaj: 'Gecersiz sube tipi' });
  }

  try {
    const kayit = await prismaMaster.sube.create({
      data: {
        firmaId,
        subeAdi,
        subeTipi,
        il: metinAl(body.il, 50),
        ilce: metinAl(body.ilce, 50),
        adres: metinAl(body.adres, 500),
        telefon: metinAl(body.telefon, 20),
        gsm: metinAl(body.gsm, 20),
        eposta: metinAl(body.eposta, 191),
        vergiDairesi: metinAl(body.vergiDairesi, 100),
        vergiNo: metinAl(body.vergiNo, 50),
        iskonto:
          body.iskonto != null && body.iskonto !== ''
            ? new Prisma.Decimal(Number(body.iskonto))
            : null,
        durum: body.aktif === false ? false : true,
      },
      include: subeInclude,
    });
    return res.status(201).json({ sube: subeYanitOlustur(kayit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mesaj: 'Sube olusturulamadi' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz sube id' });
  }

  const mevcut = await prismaMaster.sube.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Sube bulunamadi' });

  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.subeAdi !== undefined) {
    const subeAdi = metinAl(body.subeAdi, 100);
    if (!subeAdi || subeAdi.length < 2) return res.status(400).json({ mesaj: 'Sube adi en az 2 karakter olmali' });
    data.subeAdi = subeAdi;
  }

  if (body.subeTipi !== undefined) {
    if (!subeTipiGecerliMi(body.subeTipi)) return res.status(400).json({ mesaj: 'Gecersiz sube tipi' });
    data.subeTipi = body.subeTipi;
  }

  if (body.firmaId !== undefined) {
    const firmaId = Number(body.firmaId);
    if (!Number.isInteger(firmaId) || firmaId < 1) {
      return res.status(400).json({ mesaj: 'Gecerli bir firma secin' });
    }
    const firma = await prismaMaster.firma.findUnique({ where: { id: firmaId } });
    if (!firma) return res.status(400).json({ mesaj: 'Firma bulunamadi' });
    if (!firma.durum) return res.status(400).json({ mesaj: 'Pasif firmaya sube atanamaz' });
    data.firma = { connect: { id: firmaId } };
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

  const guncel = await prismaMaster.sube.update({
    where: { id },
    data,
    include: subeInclude,
  });

  return res.json({ sube: subeYanitOlustur(guncel) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mesaj: 'Gecersiz sube id' });
  }

  const mevcut = await prismaMaster.sube.findUnique({
    where: { id },
    include: { _count: { select: { kullanicilar: true } } },
  });
  if (!mevcut) return res.status(404).json({ mesaj: 'Sube bulunamadi' });
  if (mevcut._count.kullanicilar > 0) {
    return res.status(400).json({ mesaj: 'Kullanicilari olan sube silinemez' });
  }

  await prismaMaster.sube.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
