import { Router } from 'express';
import type { Response } from 'express';
import {
  adminDepoYanit,
  adminDonemYanit,
  adminFirmaYanit,
  adminKasaYanit,
  adminSubeYanit,
} from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

type SilModu = 'hepsi' | 'pasif';

function silModuOku(body: unknown): SilModu | null {
  if (!body || typeof body !== 'object') return null;
  const mod = (body as { mod?: string }).mod;
  return mod === 'pasif' || mod === 'hepsi' ? mod : null;
}

function sayiAl(deger: unknown): number | null {
  if (deger === null || deger === undefined || deger === '') return null;
  const n = Number(deger);
  return Number.isFinite(n) ? n : null;
}

function adresCadde(adres?: string | null) {
  const metin = adres?.trim();
  return metin ? metin : null;
}

function subeAdresVerisi(form: {
  il?: string;
  ilce?: string;
  mahalle?: string;
  postaKodu?: string;
  adres?: string;
}) {
  return {
    il: form.il?.trim() || null,
    ilce: form.ilce?.trim() || null,
    mahalle: form.mahalle?.trim() || null,
    postaKodu: form.postaKodu?.trim() || null,
    cadde: adresCadde(form.adres),
    sokak: null,
    bina: null,
    no: null,
  };
}

// ——— Firma ———

router.get('/firmalar', async (_req: AuthRequest, res: Response) => {
  const firmalar = await prisma.firma.findMany({ orderBy: { firmaKodu: 'asc' } });
  return res.json({ firmalar: firmalar.map(adminFirmaYanit) });
});

router.post('/firmalar', async (req: AuthRequest, res: Response) => {
  const body = req.body as {
    firmaKodu?: string;
    firmaAdi?: string;
    vergiDairesi?: string;
    vergiNo?: string;
    aktif?: boolean;
  };
  if (!body.firmaKodu?.trim() || !body.firmaAdi?.trim()) {
    return res.status(400).json({ mesaj: 'Firma kodu ve adi zorunlu' });
  }
  const firma = await prisma.firma.create({
    data: {
      firmaKodu: body.firmaKodu.trim().toUpperCase(),
      firmaAdi: body.firmaAdi.trim(),
      vergiDairesi: body.vergiDairesi?.trim() || null,
      vergiNo: body.vergiNo?.trim() || null,
      durum: body.aktif !== false,
    },
  });
  return res.status(201).json({ firma: adminFirmaYanit(firma) });
});

router.put('/firmalar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as {
    firmaKodu?: string;
    firmaAdi?: string;
    vergiDairesi?: string;
    vergiNo?: string;
    aktif?: boolean;
  };
  const firma = await prisma.firma.update({
    where: { id },
    data: {
      ...(body.firmaKodu ? { firmaKodu: body.firmaKodu.trim().toUpperCase() } : {}),
      ...(body.firmaAdi ? { firmaAdi: body.firmaAdi.trim() } : {}),
      ...(body.vergiDairesi !== undefined ? { vergiDairesi: body.vergiDairesi.trim() || null } : {}),
      ...(body.vergiNo !== undefined ? { vergiNo: body.vergiNo.trim() || null } : {}),
      ...(body.aktif !== undefined ? { durum: body.aktif } : {}),
    },
  });
  return res.json({ firma: adminFirmaYanit(firma) });
});

router.delete('/firmalar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);

  const [subeSayisi, donemSayisi] = await Promise.all([
    prisma.sube.count({ where: { firmaId: id } }),
    prisma.donem.count({ where: { firmaId: id } }),
  ]);
  const bagliVar = subeSayisi > 0 || donemSayisi > 0;

  if (mod === 'pasif') {
    const subeler = await prisma.sube.findMany({ where: { firmaId: id }, select: { id: true } });
    const subeIdleri = subeler.map((s) => s.id);
    await prisma.$transaction([
      prisma.firma.update({ where: { id }, data: { durum: false } }),
      prisma.donem.updateMany({ where: { firmaId: id }, data: { durum: false } }),
      prisma.sube.updateMany({ where: { firmaId: id }, data: { durum: false } }),
      ...(subeIdleri.length
        ? [
            prisma.depo.updateMany({ where: { subeId: { in: subeIdleri } }, data: { durum: false } }),
            prisma.kasa.updateMany({ where: { subeId: { in: subeIdleri } }, data: { durum: false } }),
          ]
        : []),
    ]);
    return res.json({ mesaj: 'Pasif yapildi' });
  }

  if (bagliVar && mod !== 'hepsi') {
    return res.status(400).json({ mesaj: 'Bagli donem veya sube varken firma silinemez' });
  }

  await prisma.firma.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

// ——— Dönem ———

router.get('/donemler', async (_req: AuthRequest, res: Response) => {
  const donemler = await prisma.donem.findMany({ orderBy: { donemKodu: 'asc' } });
  return res.json({ donemler: donemler.map(adminDonemYanit) });
});

router.post('/donemler', async (req: AuthRequest, res: Response) => {
  const body = req.body as {
    firmaId?: number | string;
    donemKodu?: string;
    donemAdi?: string;
    aktif?: boolean;
  };
  if (!body.donemKodu?.trim() || !body.donemAdi?.trim()) {
    return res.status(400).json({ mesaj: 'Donem kodu ve adi zorunlu' });
  }
  const firmaId = sayiAl(body.firmaId) ?? req.kullanici?.firmaId ?? 1;
  const donem = await prisma.donem.create({
    data: {
      firmaId,
      donemKodu: body.donemKodu.trim().toUpperCase(),
      donemAdi: body.donemAdi.trim(),
      durum: body.aktif !== false,
    },
  });
  return res.status(201).json({ donem: adminDonemYanit(donem) });
});

router.put('/donemler/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as { donemKodu?: string; donemAdi?: string; aktif?: boolean };
  const donem = await prisma.donem.update({
    where: { id },
    data: {
      ...(body.donemKodu ? { donemKodu: body.donemKodu.trim().toUpperCase() } : {}),
      ...(body.donemAdi ? { donemAdi: body.donemAdi.trim() } : {}),
      ...(body.aktif !== undefined ? { durum: body.aktif } : {}),
    },
  });
  return res.json({ donem: adminDonemYanit(donem) });
});

router.delete('/donemler/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);
  if (mod === 'pasif') {
    await prisma.donem.update({ where: { id }, data: { durum: false } });
    return res.json({ mesaj: 'Pasif yapildi' });
  }
  await prisma.donem.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

// ——— Şube ———

router.get('/subeler', async (_req: AuthRequest, res: Response) => {
  const subeler = await prisma.sube.findMany({ orderBy: { subeKodu: 'asc' } });
  return res.json({ subeler: subeler.map(adminSubeYanit) });
});

router.post('/subeler', async (req: AuthRequest, res: Response) => {
  const body = req.body as {
    firmaId?: number | string;
    subeKodu?: string;
    subeAdi?: string;
    il?: string;
    ilce?: string;
    mahalle?: string;
    postaKodu?: string;
    adres?: string;
    efaturaSeri?: string;
    earsivSeri?: string;
    eirsaliyeSeri?: string;
    mersis?: string;
    ticaretSicil?: string;
    aktif?: boolean;
  };
  if (!body.subeKodu?.trim() || !body.subeAdi?.trim()) {
    return res.status(400).json({ mesaj: 'Sube kodu ve adi zorunlu' });
  }
  const firmaId = sayiAl(body.firmaId) ?? req.kullanici?.firmaId ?? 1;
  const subeKodu = body.subeKodu.trim().toUpperCase();
  const mevcut = await prisma.sube.findUnique({
    where: { firmaId_subeKodu: { firmaId, subeKodu } },
  });
  if (mevcut) return res.status(400).json({ mesaj: 'Bu sube kodu zaten kayitli' });

  const sube = await prisma.sube.create({
    data: {
      firmaId,
      subeKodu,
      subeAdi: body.subeAdi.trim(),
      ...subeAdresVerisi(body),
      efaturaSeri: body.efaturaSeri?.trim() || null,
      earsivSeri: body.earsivSeri?.trim() || null,
      eirsaliyeSeri: body.eirsaliyeSeri?.trim() || null,
      mersis: body.mersis?.trim() || null,
      ticaretSicil: body.ticaretSicil?.trim() || null,
      durum: body.aktif !== false,
    },
  });
  return res.status(201).json({ sube: adminSubeYanit(sube) });
});

router.put('/subeler/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as {
    subeKodu?: string;
    subeAdi?: string;
    il?: string;
    ilce?: string;
    mahalle?: string;
    postaKodu?: string;
    adres?: string;
    efaturaSeri?: string;
    earsivSeri?: string;
    eirsaliyeSeri?: string;
    mersis?: string;
    ticaretSicil?: string;
    aktif?: boolean;
  };
  const sube = await prisma.sube.update({
    where: { id },
    data: {
      ...(body.subeKodu ? { subeKodu: body.subeKodu.trim().toUpperCase() } : {}),
      ...(body.subeAdi ? { subeAdi: body.subeAdi.trim() } : {}),
      ...(body.il !== undefined ? { il: body.il.trim() || null } : {}),
      ...(body.ilce !== undefined ? { ilce: body.ilce.trim() || null } : {}),
      ...(body.mahalle !== undefined ? { mahalle: body.mahalle.trim() || null } : {}),
      ...(body.postaKodu !== undefined ? { postaKodu: body.postaKodu.trim() || null } : {}),
      ...(body.adres !== undefined ? { cadde: adresCadde(body.adres) } : {}),
      ...(body.efaturaSeri !== undefined ? { efaturaSeri: body.efaturaSeri.trim() || null } : {}),
      ...(body.earsivSeri !== undefined ? { earsivSeri: body.earsivSeri.trim() || null } : {}),
      ...(body.eirsaliyeSeri !== undefined ? { eirsaliyeSeri: body.eirsaliyeSeri.trim() || null } : {}),
      ...(body.mersis !== undefined ? { mersis: body.mersis.trim() || null } : {}),
      ...(body.ticaretSicil !== undefined ? { ticaretSicil: body.ticaretSicil.trim() || null } : {}),
      ...(body.aktif !== undefined ? { durum: body.aktif } : {}),
    },
  });
  return res.json({ sube: adminSubeYanit(sube) });
});

router.delete('/subeler/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);
  const [depoSayisi, kasaSayisi] = await Promise.all([
    prisma.depo.count({ where: { subeId: id } }),
    prisma.kasa.count({ where: { subeId: id } }),
  ]);
  const bagliVar = depoSayisi > 0 || kasaSayisi > 0;

  if (mod === 'pasif') {
    await prisma.$transaction([
      prisma.sube.update({ where: { id }, data: { durum: false } }),
      prisma.depo.updateMany({ where: { subeId: id }, data: { durum: false } }),
      prisma.kasa.updateMany({ where: { subeId: id }, data: { durum: false } }),
    ]);
    return res.json({ mesaj: 'Pasif yapildi' });
  }

  if (bagliVar && mod !== 'hepsi') {
    return res.status(400).json({ mesaj: 'Bagli depo veya kasa varken sube silinemez' });
  }

  await prisma.sube.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

// ——— Depo ———

router.get('/depolar', async (_req: AuthRequest, res: Response) => {
  const depolar = await prisma.depo.findMany({
    orderBy: { depoKodu: 'asc' },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.json({ depolar: depolar.map(adminDepoYanit) });
});

router.post('/depolar', async (req: AuthRequest, res: Response) => {
  const body = req.body as {
    subeId?: number | string;
    depoKodu?: string;
    depoAdi?: string;
    il?: string;
    ilce?: string;
    mahalle?: string;
    postaKodu?: string;
    adres?: string;
    aktif?: boolean;
  };
  const subeId = sayiAl(body.subeId);
  if (!subeId || !body.depoKodu?.trim() || !body.depoAdi?.trim()) {
    return res.status(400).json({ mesaj: 'Sube, depo kodu ve adi zorunlu' });
  }
  const depo = await prisma.depo.create({
    data: {
      subeId,
      depoKodu: body.depoKodu.trim().toUpperCase(),
      depoAdi: body.depoAdi.trim(),
      ...subeAdresVerisi(body),
      durum: body.aktif !== false,
    },
  });
  const zengin = await prisma.depo.findUnique({
    where: { id: depo.id },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.status(201).json({ depo: adminDepoYanit(zengin ?? depo) });
});

router.put('/depolar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as {
    subeId?: number | string;
    depoKodu?: string;
    depoAdi?: string;
    il?: string;
    ilce?: string;
    mahalle?: string;
    postaKodu?: string;
    adres?: string;
    aktif?: boolean;
  };
  const subeId = sayiAl(body.subeId);
  const depo = await prisma.depo.update({
    where: { id },
    data: {
      ...(subeId ? { subeId } : {}),
      ...(body.depoKodu ? { depoKodu: body.depoKodu.trim().toUpperCase() } : {}),
      ...(body.depoAdi ? { depoAdi: body.depoAdi.trim() } : {}),
      ...(body.il !== undefined ? { il: body.il.trim() || null } : {}),
      ...(body.ilce !== undefined ? { ilce: body.ilce.trim() || null } : {}),
      ...(body.mahalle !== undefined ? { mahalle: body.mahalle.trim() || null } : {}),
      ...(body.postaKodu !== undefined ? { postaKodu: body.postaKodu.trim() || null } : {}),
      ...(body.adres !== undefined ? { cadde: adresCadde(body.adres) } : {}),
      ...(body.aktif !== undefined ? { durum: body.aktif } : {}),
    },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.json({ depo: adminDepoYanit(depo) });
});

router.delete('/depolar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);
  if (mod === 'pasif') {
    await prisma.depo.update({ where: { id }, data: { durum: false } });
    return res.json({ mesaj: 'Pasif yapildi' });
  }
  await prisma.depo.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

// ——— Kasa ———

router.get('/kasalar', async (_req: AuthRequest, res: Response) => {
  const kasalar = await prisma.kasa.findMany({
    orderBy: { kasaKodu: 'asc' },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.json({ kasalar: kasalar.map(adminKasaYanit) });
});

router.post('/kasalar', async (req: AuthRequest, res: Response) => {
  const body = req.body as {
    subeId?: number | string;
    kasaKodu?: string;
    kasaAdi?: string;
    paraBirimi?: string;
    aktif?: boolean;
  };
  const subeId = sayiAl(body.subeId);
  if (!subeId || !body.kasaKodu?.trim() || !body.kasaAdi?.trim()) {
    return res.status(400).json({ mesaj: 'Sube, kasa kodu ve adi zorunlu' });
  }
  const kasa = await prisma.kasa.create({
    data: {
      subeId,
      kasaKodu: body.kasaKodu.trim().toUpperCase(),
      kasaAdi: body.kasaAdi.trim(),
      paraBirimi: body.paraBirimi?.trim() || 'TL',
      durum: body.aktif !== false,
    },
  });
  const zengin = await prisma.kasa.findUnique({
    where: { id: kasa.id },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.status(201).json({ kasa: adminKasaYanit(zengin ?? kasa) });
});

router.put('/kasalar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as {
    subeId?: number | string;
    kasaKodu?: string;
    kasaAdi?: string;
    paraBirimi?: string;
    aktif?: boolean;
  };
  const subeId = sayiAl(body.subeId);
  const kasa = await prisma.kasa.update({
    where: { id },
    data: {
      ...(subeId ? { subeId } : {}),
      ...(body.kasaKodu ? { kasaKodu: body.kasaKodu.trim().toUpperCase() } : {}),
      ...(body.kasaAdi ? { kasaAdi: body.kasaAdi.trim() } : {}),
      ...(body.paraBirimi !== undefined ? { paraBirimi: body.paraBirimi.trim() || 'TL' } : {}),
      ...(body.aktif !== undefined ? { durum: body.aktif } : {}),
    },
    include: { sube: { select: { subeKodu: true, subeAdi: true } } },
  });
  return res.json({ kasa: adminKasaYanit(kasa) });
});

router.delete('/kasalar/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);
  if (mod === 'pasif') {
    await prisma.kasa.update({ where: { id }, data: { durum: false } });
    return res.json({ mesaj: 'Pasif yapildi' });
  }
  await prisma.kasa.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
