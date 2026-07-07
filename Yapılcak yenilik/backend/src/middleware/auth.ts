import type { NextFunction, Request, Response } from 'express';
import type { Kullanici } from '@prisma/client';
import { tokenDogrula } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { kullaniciYetkileriAl } from '../lib/mappers.js';

export interface AuthRequest extends Request {
  kullanici?: Kullanici;
  yetkiler?: string[];
}

export async function authZorunlu(req: AuthRequest, res: Response, next: NextFunction) {
  const baslik = req.headers.authorization;
  if (!baslik?.startsWith('Bearer ')) {
    return res.status(401).json({ mesaj: 'Oturum gerekli' });
  }

  try {
    const payload = tokenDogrula(baslik.slice(7));
    const kullanici = await prisma.kullanici.findUnique({
      where: { id: Number(payload.sub) },
    });

    if (!kullanici || !kullanici.aktif) {
      return res.status(401).json({ mesaj: 'Oturum gecersiz' });
    }

    req.kullanici = kullanici;
    req.yetkiler = await kullaniciYetkileriAl(kullanici);
    next();
  } catch {
    return res.status(401).json({ mesaj: 'Oturum gecersiz' });
  }
}
