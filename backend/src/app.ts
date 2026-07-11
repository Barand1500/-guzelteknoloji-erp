import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import bildirimlerRouter from './routes/bildirimler.js';
import eklentilerRouter from './routes/eklentiler.js';
import kullanicilarRouter from './routes/kullanicilar.js';
import loglarRouter from './routes/loglar.js';
import rollerRouter from './routes/roller.js';
import sistemAyarlariRouter from './routes/sistem-ayarlari.js';
import yedekRouter from './routes/yedek.js';
import legacyStubsRouter from './routes/legacy-stubs.js';
import referansRouter from './routes/referans.js';
import tanimlarRouter from './routes/tanimlar.js';

export function appOlustur() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin.includes('*') ? true : config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const saglikYaniti = (_req: Request, res: Response) => {
    res.json({ durum: 'ok', surum: config.surum, dbTuru: config.dbTuru });
  };
  app.get('/api/health', saglikYaniti);
  // Nginx proxy_pass /api on ekini dusururse (proxy_pass ...:3006/;) health yine calissin
  app.get('/health', saglikYaniti);

  const admin = express.Router();
  admin.use('/auth', authRouter);
  admin.use('/kullanicilar', kullanicilarRouter);
  admin.use('/roller', rollerRouter);
  admin.use('/sistem-ayarlari', sistemAyarlariRouter);
  admin.use('/loglar', loglarRouter);
  admin.use('/yedek', yedekRouter);
  admin.use('/bildirimler', bildirimlerRouter);
  admin.use('/eklentiler', eklentilerRouter);
  admin.use('/referans', referansRouter);
  admin.use('/tanimlar', tanimlarRouter);
  admin.use('/', legacyStubsRouter);

  app.use('/api/admin', admin);
  // Nginx /api on ekini dusururse /admin/auth/... istekleri de karsilansin
  app.use('/admin', admin);

  app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ mesaj: 'Endpoint bulunamadi' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ mesaj: 'Sunucu hatasi' });
  });

  return app;
}
