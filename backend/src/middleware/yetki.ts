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

/** Kullanici / rol yonetimi ekranlari */
export function kullaniciYonetimiErisimi(req: AuthRequest, res: Response, next: NextFunction) {
  return yetkiZorunlu('goruntuleme', 'kullanici_yonetimi')(req, res, next);
}

export function kullaniciYonetimiYazma(req: AuthRequest, res: Response, next: NextFunction) {
  return yetkiZorunlu('kullanici_yonetimi')(req, res, next);
}
