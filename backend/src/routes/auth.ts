import { Router } from 'express';
import type { Response } from 'express';
import { sifreDogrula, sifreHashle } from '../lib/crypto.js';
import { tokenUret } from '../lib/jwt.js';
import {
  mockAuthAktif,
  mockGirisDogrula,
  mockGirisYanit,
  mockKullaniciYanit,
  MOCK_OTURUM_SECENEKLERI,
} from '../lib/mockAuth.js';
import { kullaniciYanit, kullaniciYetkileriAl } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();

interface OturumYetkisi {
  firmaId: number;
  donemId: number;
}

function kullaniciOturumYetkileri(kullanici: {
  firmaId: number;
  donemId: number | null;
  oturumYetkileri: unknown;
}): OturumYetkisi[] {
  const ham = Array.isArray(kullanici.oturumYetkileri) ? kullanici.oturumYetkileri : [];
  const yetkiler = ham
    .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
    .map((y) => ({ firmaId: Number(y.firmaId), donemId: Number(y.donemId) }))
    .filter((y) => Number.isFinite(y.firmaId) && Number.isFinite(y.donemId));
  if (yetkiler.length > 0) return yetkiler;
  return kullanici.donemId
    ? [{ firmaId: kullanici.firmaId, donemId: kullanici.donemId }]
    : [];
}

router.get('/oturum-secenekleri', async (req, res) => {
  try {
    if (mockAuthAktif()) {
      return res.json(MOCK_OTURUM_SECENEKLERI);
    }

    const kullanicilar = await prisma.kullanici.findMany({
      where: { durum: true },
      orderBy: { kullaniciKodu: 'asc' },
      select: {
        kullaniciKodu: true,
        firmaId: true,
        donemId: true,
        subeId: true,
        kasaId: true,
        oturumYetkileri: true,
      },
    });
    const istenenKod = String(req.query.kullaniciKodu ?? '').trim().toUpperCase();
    const seciliKullanici =
      kullanicilar.find((k) => k.kullaniciKodu === istenenKod) ?? kullanicilar[0];
    const yetkiler = seciliKullanici ? kullaniciOturumYetkileri(seciliKullanici) : [];
    const firmaIdleri = [...new Set(yetkiler.map((y) => y.firmaId))];
    const donemIdleri = [...new Set(yetkiler.map((y) => y.donemId))];

    const firmalar = await prisma.firma.findMany({
      where: { durum: true, id: { in: firmaIdleri } },
      orderBy: { firmaKodu: 'asc' },
      select: {
        id: true,
        firmaKodu: true,
        firmaAdi: true,
        donemler: {
          where: { durum: true, id: { in: donemIdleri } },
          orderBy: { donemKodu: 'asc' },
          select: { id: true, donemKodu: true, donemAdi: true },
        },
        subeler: {
          where: { durum: true },
          orderBy: { subeKodu: 'asc' },
          select: {
            id: true,
            subeKodu: true,
            subeAdi: true,
            kasalar: {
              where: { durum: true },
              orderBy: { kasaKodu: 'asc' },
              select: { id: true, kasaKodu: true, kasaAdi: true },
            },
            depolar: {
              where: { durum: true },
              orderBy: { depoKodu: 'asc' },
              select: { id: true, depoKodu: true, depoAdi: true },
            },
          },
        },
      },
    });

    const varsayilanFirma = firmalar.find((f) => f.id === seciliKullanici?.firmaId) ?? firmalar[0];
    const varsayilanDonem =
      varsayilanFirma?.donemler.find((d) => d.id === seciliKullanici?.donemId) ??
      varsayilanFirma?.donemler[0];
    const varsayilanSube =
      varsayilanFirma?.subeler.find((s) => s.id === seciliKullanici?.subeId) ??
      varsayilanFirma?.subeler[0];
    const varsayilanKasa =
      varsayilanSube?.kasalar.find((k) => k.id === seciliKullanici?.kasaId) ??
      varsayilanSube?.kasalar[0];

    return res.json({
      firmalar,
      kullaniciKodlari: kullanicilar.map((k) => k.kullaniciKodu),
      seciliKullaniciKodu: seciliKullanici?.kullaniciKodu ?? '',
      varsayilan: {
        firmaKodu: varsayilanFirma?.firmaKodu ?? '',
        donemKodu: varsayilanDonem?.donemKodu ?? '',
        subeKodu: varsayilanSube?.subeKodu ?? '',
        kasaKodu: varsayilanKasa?.kasaKodu ?? '',
      },
    });
  } catch (err) {
    console.error('[auth/oturum-secenekleri]', err);
    return res.status(500).json({ mesaj: 'Oturum secenekleri yuklenemedi' });
  }
});

router.post('/giris', async (req, res) => {
  const { kullaniciKodu, sifre, firmaKodu, donemKodu, subeKodu, kasaKodu } = req.body as {
    kullaniciKodu?: string;
    sifre?: string;
    firmaKodu?: string;
    donemKodu?: string;
    subeKodu?: string;
    kasaKodu?: string;
  };

  if (!sifre || !kullaniciKodu?.trim()) {
    return res.status(400).json({ mesaj: 'Kullanici kodu ve sifre gerekli' });
  }

  if (!firmaKodu?.trim() || !donemKodu?.trim() || !subeKodu?.trim() || !kasaKodu?.trim()) {
    return res.status(400).json({ mesaj: 'Firma, donem, sube ve kasa secimi gerekli' });
  }

  if (mockAuthAktif()) {
    if (!mockGirisDogrula(kullaniciKodu, sifre)) {
      return res.status(401).json({ mesaj: 'Gecersiz kullanici veya sifre' });
    }
    return res.json(mockGirisYanit(kullaniciKodu));
  }

  const kullanici = await prisma.kullanici.findUnique({
    where: { kullaniciKodu: kullaniciKodu.trim().toUpperCase() },
  });

  if (!kullanici || !kullanici.durum || !sifreDogrula(sifre, kullanici.sifreHash)) {
    return res.status(401).json({ mesaj: 'Gecersiz kullanici veya sifre' });
  }

  const firma = await prisma.firma.findFirst({
    where: { firmaKodu: firmaKodu.trim().toUpperCase(), durum: true },
  });
  if (!firma) {
    return res.status(400).json({ mesaj: 'Gecersiz firma kodu' });
  }

  const donem = await prisma.donem.findFirst({
    where: { firmaId: firma.id, donemKodu: donemKodu.trim().toUpperCase(), durum: true },
  });
  if (!donem) {
    return res.status(400).json({ mesaj: 'Gecersiz donem' });
  }

  const sube = await prisma.sube.findFirst({
    where: { firmaId: firma.id, subeKodu: subeKodu.trim().toUpperCase(), durum: true },
  });
  if (!sube) {
    return res.status(400).json({ mesaj: 'Gecersiz sube' });
  }

  const kasa = await prisma.kasa.findFirst({
    where: { subeId: sube.id, kasaKodu: kasaKodu.trim().toUpperCase(), durum: true },
  });
  if (!kasa) {
    return res.status(400).json({ mesaj: 'Gecersiz kasa' });
  }

  const depo =
    (await prisma.depo.findFirst({
      where: { subeId: sube.id, depoKodu: sube.subeKodu, durum: true },
    })) ??
    (await prisma.depo.findFirst({
      where: { subeId: sube.id, durum: true },
      orderBy: { depoKodu: 'asc' },
    }));

  const oturumYetkileri = kullaniciOturumYetkileri(kullanici);
  if (!oturumYetkileri.some((y) => y.firmaId === firma.id && y.donemId === donem.id)) {
    return res.status(403).json({ mesaj: 'Bu firma ve doneme erisim yetkiniz yok' });
  }

  const yetkiler = await kullaniciYetkileriAl(kullanici);
  const token = tokenUret(kullanici.id, kullanici.kullaniciKodu, {
    firmaId: firma.id,
    donemId: donem.id,
    subeId: sube.id,
    kasaId: kasa.id,
    depoId: depo?.id ?? null,
  });

  return res.json({
    token,
    kullanici: await kullaniciYanit(kullanici, yetkiler, { firma, donem, sube, kasa }),
  });
});

router.get('/ben', authZorunlu, async (req: AuthRequest, res: Response) => {
  if (mockAuthAktif() && req.mockOturum) {
    return res.json({ kullanici: mockKullaniciYanit(req.mockOturum.kullaniciKodu) });
  }

  const k = req.kullanici!;
  const yetkiPaket =
    req.yetkilerModul !== undefined
      ? { birlesik: req.yetkiler ?? [], modul: req.yetkilerModul }
      : await kullaniciYetkileriAl(k);
  const [firma, donem, sube, kasa] = await Promise.all([
    prisma.firma.findUnique({ where: { id: k.firmaId } }),
    k.donemId ? prisma.donem.findUnique({ where: { id: k.donemId } }) : null,
    k.subeId ? prisma.sube.findUnique({ where: { id: k.subeId } }) : null,
    k.kasaId ? prisma.kasa.findUnique({ where: { id: k.kasaId } }) : null,
  ]);
  return res.json({
    kullanici: await kullaniciYanit(
      k,
      yetkiPaket,
      firma && donem && sube && kasa ? { firma, donem, sube, kasa } : undefined
    ),
  });
});

router.patch('/profil', authZorunlu, async (req: AuthRequest, res: Response) => {
  if (mockAuthAktif() && req.mockOturum) {
    const { ad } = req.body as { ad?: string };
    if (!ad?.trim()) {
      return res.status(400).json({ mesaj: 'Ad soyad gerekli' });
    }
    return res.json({
      kullanici: { ...mockKullaniciYanit(req.mockOturum.kullaniciKodu), ad: ad.trim() },
    });
  }

  const k = req.kullanici!;
  const { ad, mevcutSifre, yeniSifre } = req.body as {
    ad?: string;
    mevcutSifre?: string;
    yeniSifre?: string;
  };

  if (!ad?.trim()) {
    return res.status(400).json({ mesaj: 'Ad soyad gerekli' });
  }

  const veri: { adSoyad: string; sifreHash?: string } = {
    adSoyad: ad.trim(),
  };

  if (yeniSifre?.trim()) {
    if (!mevcutSifre || !sifreDogrula(mevcutSifre, k.sifreHash)) {
      return res.status(400).json({ mesaj: 'Mevcut sifre hatali' });
    }
    veri.sifreHash = sifreHashle(yeniSifre.trim());
  }

  const guncel = await prisma.kullanici.update({
    where: { id: k.id },
    data: veri,
  });

  const yetkiler = await kullaniciYetkileriAl(guncel);
  return res.json({ kullanici: await kullaniciYanit(guncel, yetkiler) });
});

export default router;
