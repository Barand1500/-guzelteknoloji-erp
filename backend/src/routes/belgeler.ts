import { Router } from 'express';
import type { Response } from 'express';
import { BelgeDurum, BelgeTipi, type Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const MAX_SATIR = 500;
const GECERLI_TIPLER = new Set<string>(Object.values(BelgeTipi));

function firmaIdAl(req: AuthRequest): number {
  return req.kullanici?.firmaId ?? 1;
}

function tipAl(deger: unknown): BelgeTipi | null {
  const tip = String(deger ?? '').trim().toUpperCase();
  return GECERLI_TIPLER.has(tip) ? (tip as BelgeTipi) : null;
}

function sayiAl(deger: unknown, yedek = 0): number {
  const n = Number(deger);
  return Number.isFinite(n) ? n : yedek;
}

function tarihAl(deger: unknown): Date | null {
  if (!deger) return null;
  const d = new Date(String(deger));
  return Number.isNaN(d.getTime()) ? null : d;
}

function belgeYanit(b: {
  id: number;
  tip: BelgeTipi;
  belgeNo: string;
  tarih: Date;
  vadeTarihi: Date | null;
  cariId: number | null;
  cariKodu: string;
  cariAdi: string;
  aciklama: string | null;
  kdvDahil: boolean;
  durum: BelgeDurum;
  araToplam: { toString(): string } | number;
  kdvToplam: { toString(): string } | number;
  genelToplam: { toString(): string } | number;
  satirlar: unknown;
  onayTarihi: Date | null;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
}) {
  return {
    id: String(b.id),
    tip: b.tip,
    belgeNo: b.belgeNo,
    tarih: b.tarih.toISOString().slice(0, 10),
    vadeTarihi: b.vadeTarihi ? b.vadeTarihi.toISOString().slice(0, 10) : null,
    cariId: b.cariId != null ? String(b.cariId) : null,
    cariKodu: b.cariKodu,
    cariAdi: b.cariAdi,
    aciklama: b.aciklama ?? '',
    kdvDahil: b.kdvDahil,
    durum: b.durum,
    araToplam: Number(b.araToplam),
    kdvToplam: Number(b.kdvToplam),
    genelToplam: Number(b.genelToplam),
    satirlar: Array.isArray(b.satirlar) ? b.satirlar : [],
    onayTarihi: b.onayTarihi ? b.onayTarihi.toISOString() : null,
    kayitTarihi: b.kayitTarihi.toISOString(),
    guncellemeTarihi: b.guncellemeTarihi.toISOString(),
  };
}

function satirMiktarAl(satir: Record<string, unknown>): number {
  return sayiAl(satir.miktar, 0);
}

function satirUrunAl(satir: Record<string, unknown>): { sku: string; ad: string; birim: string } {
  const urun = (satir.urun && typeof satir.urun === 'object' ? satir.urun : {}) as Record<string, unknown>;
  return {
    sku: String(urun.sku ?? satir.sku ?? '').trim(),
    ad: String(urun.ad ?? satir.ad ?? '').trim(),
    birim: String(satir.birim ?? 'ADET').trim() || 'ADET',
  };
}

router.get('/', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const tip = tipAl(req.query.tip);
  if (!tip) return res.status(400).json({ mesaj: 'Gecerli tip gerekli (ALIS_FATURA | SATIS_FATURA)' });

  const kayitlar = await prisma.belge.findMany({
    where: { firmaId, tip },
    orderBy: [{ tarih: 'desc' }, { id: 'desc' }],
  });
  return res.json({ belgeler: kayitlar.map(belgeYanit) });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ mesaj: 'Gecersiz id' });

  const kayit = await prisma.belge.findFirst({ where: { id, firmaId } });
  if (!kayit) return res.status(404).json({ mesaj: 'Belge bulunamadi' });
  return res.json({ belge: belgeYanit(kayit) });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const body = req.body as Record<string, unknown>;
  const tip = tipAl(body.tip);
  if (!tip) return res.status(400).json({ mesaj: 'Gecerli tip gerekli' });

  const belgeNo = String(body.belgeNo ?? '').trim();
  if (!belgeNo) return res.status(400).json({ mesaj: 'Belge no gerekli' });

  const tarih = tarihAl(body.tarih) ?? new Date();
  const satirlar = Array.isArray(body.satirlar) ? body.satirlar : [];
  if (satirlar.length > MAX_SATIR) {
    return res.status(400).json({ mesaj: `En fazla ${MAX_SATIR} satir` });
  }

  const cariIdHam = body.cariId != null && body.cariId !== '' ? Number(body.cariId) : null;

  try {
    const kayit = await prisma.belge.create({
      data: {
        firmaId,
        tip,
        belgeNo,
        tarih,
        vadeTarihi: tarihAl(body.vadeTarihi),
        cariId: Number.isFinite(cariIdHam) ? cariIdHam : null,
        cariKodu: String(body.cariKodu ?? '').trim().slice(0, 30),
        cariAdi: String(body.cariAdi ?? '').trim().slice(0, 255),
        aciklama: String(body.aciklama ?? '').trim().slice(0, 500) || null,
        kdvDahil: body.kdvDahil !== false,
        durum: BelgeDurum.TASLAK,
        araToplam: sayiAl(body.araToplam),
        kdvToplam: sayiAl(body.kdvToplam),
        genelToplam: sayiAl(body.genelToplam),
        satirlar: satirlar as Prisma.InputJsonValue,
      },
    });
    return res.status(201).json({ belge: belgeYanit(kayit) });
  } catch (err) {
    const mesaj = err instanceof Error ? err.message : 'Kayit basarisiz';
    if (mesaj.includes('Unique') || mesaj.includes('unique')) {
      return res.status(409).json({ mesaj: 'Bu belge numarasi zaten kullaniliyor' });
    }
    return res.status(500).json({ mesaj });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ mesaj: 'Gecersiz id' });

  const mevcut = await prisma.belge.findFirst({ where: { id, firmaId } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Belge bulunamadi' });
  if (mevcut.durum !== BelgeDurum.TASLAK) {
    return res.status(400).json({ mesaj: 'Sadece taslak belgeler duzenlenebilir' });
  }

  const body = req.body as Record<string, unknown>;
  const belgeNo = String(body.belgeNo ?? mevcut.belgeNo).trim();
  if (!belgeNo) return res.status(400).json({ mesaj: 'Belge no gerekli' });

  const satirlar = Array.isArray(body.satirlar) ? body.satirlar : (mevcut.satirlar as unknown[]);
  if (satirlar.length > MAX_SATIR) {
    return res.status(400).json({ mesaj: `En fazla ${MAX_SATIR} satir` });
  }

  const cariIdHam = body.cariId != null && body.cariId !== '' ? Number(body.cariId) : mevcut.cariId;

  try {
    const kayit = await prisma.belge.update({
      where: { id },
      data: {
        belgeNo,
        tarih: tarihAl(body.tarih) ?? mevcut.tarih,
        vadeTarihi: body.vadeTarihi !== undefined ? tarihAl(body.vadeTarihi) : mevcut.vadeTarihi,
        cariId: Number.isFinite(cariIdHam as number) ? (cariIdHam as number) : null,
        cariKodu: String(body.cariKodu ?? mevcut.cariKodu).trim().slice(0, 30),
        cariAdi: String(body.cariAdi ?? mevcut.cariAdi).trim().slice(0, 255),
        aciklama:
          body.aciklama !== undefined
            ? String(body.aciklama ?? '').trim().slice(0, 500) || null
            : mevcut.aciklama,
        kdvDahil: body.kdvDahil !== undefined ? body.kdvDahil !== false : mevcut.kdvDahil,
        araToplam: body.araToplam !== undefined ? sayiAl(body.araToplam) : mevcut.araToplam,
        kdvToplam: body.kdvToplam !== undefined ? sayiAl(body.kdvToplam) : mevcut.kdvToplam,
        genelToplam: body.genelToplam !== undefined ? sayiAl(body.genelToplam) : mevcut.genelToplam,
        satirlar: satirlar as Prisma.InputJsonValue,
      },
    });
    return res.json({ belge: belgeYanit(kayit) });
  } catch (err) {
    const mesaj = err instanceof Error ? err.message : 'Guncelleme basarisiz';
    if (mesaj.includes('Unique') || mesaj.includes('unique')) {
      return res.status(409).json({ mesaj: 'Bu belge numarasi zaten kullaniliyor' });
    }
    return res.status(500).json({ mesaj });
  }
});

router.post('/:id/onayla', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ mesaj: 'Gecersiz id' });

  const mevcut = await prisma.belge.findFirst({ where: { id, firmaId } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Belge bulunamadi' });
  if (mevcut.durum !== BelgeDurum.TASLAK) {
    return res.status(400).json({ mesaj: 'Sadece taslak belgeler onaylanabilir' });
  }

  const satirlar = Array.isArray(mevcut.satirlar) ? (mevcut.satirlar as Record<string, unknown>[]) : [];
  if (!satirlar.length) return res.status(400).json({ mesaj: 'Onay icin en az bir satir gerekli' });
  if (!mevcut.cariKodu && !mevcut.cariAdi) {
    return res.status(400).json({ mesaj: 'Onay icin cari secimi gerekli' });
  }

  const yon = mevcut.tip === BelgeTipi.ALIS_FATURA ? 1 : -1;
  const cariYon = mevcut.tip === BelgeTipi.ALIS_FATURA ? 1 : -1;

  const kayit = await prisma.$transaction(async (tx) => {
    await tx.stokHareket.createMany({
      data: satirlar
        .map((s) => {
          const urun = satirUrunAl(s);
          const miktar = satirMiktarAl(s) * yon;
          if (!urun.sku || !miktar) return null;
          return {
            firmaId,
            belgeId: id,
            urunKodu: urun.sku.slice(0, 30),
            urunAdi: urun.ad.slice(0, 255),
            birim: urun.birim.slice(0, 20),
            miktar,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null),
    });

    await tx.cariHareket.create({
      data: {
        firmaId,
        belgeId: id,
        cariId: mevcut.cariId,
        cariKodu: mevcut.cariKodu,
        tutar: Number(mevcut.genelToplam) * cariYon,
        aciklama: `${mevcut.tip} ${mevcut.belgeNo}`,
      },
    });

    return tx.belge.update({
      where: { id },
      data: { durum: BelgeDurum.ONAYLI, onayTarihi: new Date() },
    });
  });

  return res.json({ belge: belgeYanit(kayit) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const firmaId = firmaIdAl(req);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ mesaj: 'Gecersiz id' });

  const mevcut = await prisma.belge.findFirst({ where: { id, firmaId } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Belge bulunamadi' });
  if (mevcut.durum === BelgeDurum.ONAYLI) {
    return res.status(400).json({ mesaj: 'Onayli belge silinemez; iptal akisi sonra eklenecek' });
  }

  await prisma.belge.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
