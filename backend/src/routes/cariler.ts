import { Router } from 'express';
import type { Response } from 'express';
import { adminCariYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

type SilModu = 'hepsi' | 'pasif';

const GECERLI_CARI_TIPLERI = new Set(['SATICI', 'ALICI']);
const GECERLI_ISLETME_TURLERI = new Set(['TUZEL', 'GERCEK']);

function firmaIdAl(req: AuthRequest): number {
  return req.kullanici?.firmaId ?? 1;
}

function silModuOku(body: unknown): SilModu | null {
  if (!body || typeof body !== 'object') return null;
  const mod = (body as { mod?: string }).mod;
  return mod === 'pasif' || mod === 'hepsi' ? mod : null;
}

function metinAl(deger: unknown, max: number): string | null {
  if (deger == null) return null;
  const metin = String(deger).trim();
  if (!metin) return null;
  return metin.slice(0, max);
}

function ustIdAl(deger: unknown): number | null {
  if (deger == null || deger === '') return null;
  const n = Number(deger);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cariVerisiOku(body: Record<string, unknown>) {
  const cariTipi = String(body.cariTipi ?? '').trim().toUpperCase();
  const isletmeTuruHam = body.isletmeTuru != null ? String(body.isletmeTuru).trim().toUpperCase() : '';
  const cariKodu = String(body.cariKodu ?? '').trim();
  const cariAdi = String(body.cariAdi ?? '').trim();

  return {
    ustId: ustIdAl(body.ustId),
    cariTipi,
    isletmeTuru: isletmeTuruHam || null,
    cariKodu,
    cariAdi,
    unvan: metinAl(body.unvan, 255),
    yetkili: metinAl(body.yetkili, 150),
    vergiDairesi: metinAl(body.vergiDairesi, 100),
    vergiNo: metinAl(body.vergiNo, 20),
    il: metinAl(body.il, 50),
    ilce: metinAl(body.ilce, 50),
    adres: metinAl(body.adres, 500),
    telefon: metinAl(body.telefon, 20),
    eposta: metinAl(body.eposta, 191),
    web: metinAl(body.web, 255),
    efatura: body.efatura === true,
    efaturaTipi: metinAl(body.efaturaTipi, 50),
    alias: metinAl(body.alias, 255),
    aktif: body.aktif !== false,
  };
}

function cariDogrula(veri: ReturnType<typeof cariVerisiOku>): string | null {
  if (!GECERLI_CARI_TIPLERI.has(veri.cariTipi)) {
    return 'Cari tipi SATICI veya ALICI olmalidir';
  }
  if (veri.isletmeTuru && !GECERLI_ISLETME_TURLERI.has(veri.isletmeTuru)) {
    return 'Isletme turu TUZEL veya GERCEK olmalidir';
  }
  if (!veri.cariKodu || veri.cariKodu.length > 30) {
    return 'Cari kodu zorunludur (en fazla 30 karakter)';
  }
  if (!veri.cariAdi || veri.cariAdi.length > 255) {
    return 'Cari adi zorunludur (en fazla 255 karakter)';
  }
  if (veri.vergiNo && !/^\d{10,11}$/.test(veri.vergiNo)) {
    return 'Vergi no 10 veya 11 haneli olmalidir';
  }
  return null;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const cariTipi = String(req.query.cariTipi ?? '').trim().toUpperCase();

  const cariler = await prisma.f001Cari.findMany({
    where: {
      firmaId,
      ...(GECERLI_CARI_TIPLERI.has(cariTipi) ? { cariTipi } : {}),
    },
    orderBy: [{ cariTipi: 'asc' }, { cariKodu: 'asc' }],
  });

  return res.json({ cariler: cariler.map(adminCariYanit) });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const veri = cariVerisiOku((req.body ?? {}) as Record<string, unknown>);
  const hata = cariDogrula(veri);
  if (hata) return res.status(400).json({ mesaj: hata });

  const cari = await prisma.f001Cari.create({
    data: {
      firmaId,
      ustId: veri.ustId,
      cariTipi: veri.cariTipi,
      isletmeTuru: veri.isletmeTuru,
      cariKodu: veri.cariKodu,
      cariAdi: veri.cariAdi,
      unvan: veri.unvan,
      yetkili: veri.yetkili,
      vergiDairesi: veri.vergiDairesi,
      vergiNo: veri.vergiNo,
      il: veri.il,
      ilce: veri.ilce,
      adres: veri.adres,
      telefon: veri.telefon,
      eposta: veri.eposta,
      web: veri.web,
      efatura: veri.efatura,
      efaturaTipi: veri.efaturaTipi,
      alias: veri.alias,
      durum: veri.aktif,
    },
  });

  return res.status(201).json({ cari: adminCariYanit(cari) });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  const mevcut = await prisma.f001Cari.findFirst({ where: { id, firmaId } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Cari bulunamadi' });

  const veri = cariVerisiOku((req.body ?? {}) as Record<string, unknown>);
  const hata = cariDogrula(veri);
  if (hata) return res.status(400).json({ mesaj: hata });

  const cari = await prisma.f001Cari.update({
    where: { id },
    data: {
      ustId: veri.ustId,
      cariTipi: veri.cariTipi,
      isletmeTuru: veri.isletmeTuru,
      cariKodu: veri.cariKodu,
      cariAdi: veri.cariAdi,
      unvan: veri.unvan,
      yetkili: veri.yetkili,
      vergiDairesi: veri.vergiDairesi,
      vergiNo: veri.vergiNo,
      il: veri.il,
      ilce: veri.ilce,
      adres: veri.adres,
      telefon: veri.telefon,
      eposta: veri.eposta,
      web: veri.web,
      efatura: veri.efatura,
      efaturaTipi: veri.efaturaTipi,
      alias: veri.alias,
      durum: veri.aktif,
    },
  });

  return res.json({ cari: adminCariYanit(cari) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  const mod = silModuOku(req.body);

  const mevcut = await prisma.f001Cari.findFirst({ where: { id, firmaId } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Cari bulunamadi' });

  if (mod === 'pasif') {
    await prisma.f001Cari.update({ where: { id }, data: { durum: false } });
    return res.json({ mesaj: 'Cari pasif yapildi' });
  }

  await prisma.f001Cari.delete({ where: { id } });
  return res.json({ mesaj: 'Cari silindi' });
});

export default router;
