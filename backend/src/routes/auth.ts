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

router.get('/oturum-secenekleri', async (_req, res) => {
  if (mockAuthAktif()) {
    return res.json(MOCK_OTURUM_SECENEKLERI);
  }

  const firmalar = await prisma.firma.findMany({
    where: { durum: true },
    orderBy: { firmaKodu: 'asc' },
    select: {
      id: true,
      firmaKodu: true,
      firmaAdi: true,
      donemler: {
        where: { durum: true },
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

  return res.json({
    firmalar,
    kullaniciKodlari: (
      await prisma.kullanici.findMany({
        where: { durum: true },
        orderBy: { kullaniciKodu: 'asc' },
        select: { kullaniciKodu: true },
      })
    ).map((k) => k.kullaniciKodu),
  });
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

  if (kullanici.firmaId !== firma.id && kullanici.rol !== 'YONETICI' && kullanici.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({ mesaj: 'Bu firmaya erisim yetkiniz yok' });
  }

  const guncel = await prisma.kullanici.update({
    where: { id: kullanici.id },
    data: {
      firmaId: firma.id,
      donemId: donem.id,
      subeId: sube.id,
      kasaId: kasa.id,
      depoId: depo?.id ?? null,
    },
  });

  const yetkiler = await kullaniciYetkileriAl(guncel);
  const token = tokenUret(guncel.id, guncel.kullaniciKodu);

  return res.json({
    token,
    kullanici: await kullaniciYanit(guncel, yetkiler),
  });
});

router.get('/ben', authZorunlu, async (req: AuthRequest, res: Response) => {
  if (mockAuthAktif() && req.mockOturum) {
    return res.json({ kullanici: mockKullaniciYanit(req.mockOturum.kullaniciKodu) });
  }

  const k = req.kullanici!;
  return res.json({
    kullanici: await kullaniciYanit(k, req.yetkiler ?? []),
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
