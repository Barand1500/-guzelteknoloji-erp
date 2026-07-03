import { Router } from 'express';
import type { Response } from 'express';
import { sifreDogrula, sifreHashle } from '../lib/crypto.js';
import { tokenUret } from '../lib/jwt.js';
import { kullaniciYanit, kullaniciYetkileriAl } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();

router.post('/giris', async (req, res) => {
  const { kullaniciKodu, sifre } = req.body as {
    kullaniciKodu?: string;
    sifre?: string;
  };

  if (!sifre || !kullaniciKodu?.trim()) {
    return res.status(400).json({ mesaj: 'Kullanici kodu ve sifre gerekli' });
  }

  const kullanici = await prisma.kullanici.findUnique({
    where: { kullaniciKodu: kullaniciKodu.trim().toUpperCase() },
  });

  if (!kullanici || !kullanici.durum || !sifreDogrula(sifre, kullanici.sifreHash)) {
    return res.status(401).json({ mesaj: 'Gecersiz kullanici veya sifre' });
  }

  const yetkiler = await kullaniciYetkileriAl(kullanici);
  const token = tokenUret(kullanici.id, kullanici.kullaniciKodu);

  return res.json({
    token,
    kullanici: await kullaniciYanit(kullanici, yetkiler),
  });
});

router.get('/ben', authZorunlu, async (req: AuthRequest, res: Response) => {
  const k = req.kullanici!;
  return res.json({
    kullanici: await kullaniciYanit(k, req.yetkiler ?? []),
  });
});

router.patch('/profil', authZorunlu, async (req: AuthRequest, res: Response) => {
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
