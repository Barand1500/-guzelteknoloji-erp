import type { NextFunction, Request, Response } from 'express';
import type { Kullanici } from '@prisma/client';
import { tokenDogrula } from '../lib/jwt.js';
import { mockAuthAktif, mockTokenMi } from '../lib/mockAuth.js';
import { GECERLI_YETKILER, kullaniciYetkileriAl } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';

export interface AuthRequest extends Request {
  kullanici?: Kullanici;
  yetkiler?: string[];
  yetkilerModul?: Record<string, string[]>;
  mockOturum?: { kullaniciKodu: string };
}

export async function authZorunlu(req: AuthRequest, res: Response, next: NextFunction) {
  const baslik = req.headers.authorization;
  if (!baslik?.startsWith('Bearer ')) {
    return res.status(401).json({ mesaj: 'Oturum gerekli' });
  }

  try {
    const payload = tokenDogrula(baslik.slice(7));

    if (mockAuthAktif() && mockTokenMi(payload.sub)) {
      req.mockOturum = { kullaniciKodu: payload.kullaniciKodu };
      req.yetkiler = [...GECERLI_YETKILER];
      return next();
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { id: Number(payload.sub) },
    });

    if (!kullanici || !kullanici.durum) {
      return res.status(401).json({ mesaj: 'Oturum gecersiz' });
    }

    req.kullanici = {
      ...kullanici,
      firmaId: payload.firmaId ?? kullanici.firmaId,
      donemId: payload.donemId ?? kullanici.donemId,
      subeId: payload.subeId ?? kullanici.subeId,
      kasaId: payload.kasaId ?? kullanici.kasaId,
      depoId: payload.depoId !== undefined ? payload.depoId : kullanici.depoId,
    };
    const yetkiPaket = await kullaniciYetkileriAl(kullanici);
    req.yetkiler = yetkiPaket.birlesik;
    req.yetkilerModul = yetkiPaket.modul;
    next();
  } catch {
    return res.status(401).json({ mesaj: 'Oturum gecersiz' });
  }
}
