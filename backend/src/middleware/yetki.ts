import type { NextFunction, Response } from 'express';
import type { AuthRequest } from './auth.js';

/** En az bir yetki gerekli */
export function yetkiZorunlu(...gerekliYetkiler: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const yetkiler = req.yetkiler ?? [];
    if (gerekliYetkiler.some((y) => yetkiler.includes(y))) {
      return next();
    }
    return res.status(403).json({ mesaj: 'Bu islem icin yetkiniz yok' });
  };
}

/** Kullanici / rol yonetimi: SUPER_ADMIN veya kullanici_yonetimi yetkisi gerekli. */
export function kullaniciYonetimiErisimi(req: AuthRequest, res: Response, next: NextFunction) {
  const roller = String(req.kullanici?.rol ?? '')
    .split(/[,;|]/)
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);
  const superAdmin = roller.includes('SUPER_ADMIN');
  const kullaniciYonetimiVar = req.yetkiler?.includes('kullanici_yonetimi');
  if (superAdmin || kullaniciYonetimiVar) return next();
  return res.status(403).json({ mesaj: 'Kullanici ve rol yonetimi yetkisi gerekli' });
}

export function kullaniciYonetimiYazma(req: AuthRequest, res: Response, next: NextFunction) {
  return kullaniciYonetimiErisimi(req, res, next);
}
