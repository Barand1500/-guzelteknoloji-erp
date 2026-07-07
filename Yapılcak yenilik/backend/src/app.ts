import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import bayilerRouter from './routes/bayiler.js';
import firmalarRouter from './routes/firmalar.js';
import subelerRouter from './routes/subeler.js';
import paketlerRouter from './routes/paketler.js';
import lisanslarRouter from './routes/lisanslar.js';
import bildirimlerRouter from './routes/bildirimler.js';
import eklentilerRouter from './routes/eklentiler.js';
import kullanicilarRouter from './routes/kullanicilar.js';
import loglarRouter from './routes/loglar.js';
import modullerRouter from './routes/moduller.js';
import rollerRouter from './routes/roller.js';
import sistemAyarlariRouter from './routes/sistem-ayarlari.js';
import kullaniciAyarlariRouter from './routes/kullanici-ayarlari.js';
import yedekRouter from './routes/yedek.js';
import legacyStubsRouter from './routes/legacy-stubs.js';

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

  app.get('/api/health', (_req, res) => {
    res.json({ durum: 'ok', surum: config.surum, dbTuru: config.dbTuru });
  });

  function masterDbGerekli(_req: Request, res: Response, next: NextFunction) {
    if (config.dbTuru !== 'master') {
      return res.status(404).json({ mesaj: 'Bu ozellik master veritabaninda kullanilir' });
    }
    next();
  }

  const admin = express.Router();
  admin.use('/auth', authRouter);
  admin.use('/kullanicilar', kullanicilarRouter);
  admin.use('/moduller', masterDbGerekli, modullerRouter);
  admin.use('/bayiler', masterDbGerekli, bayilerRouter);
  admin.use('/firmalar', masterDbGerekli, firmalarRouter);
  admin.use('/subeler', masterDbGerekli, subelerRouter);
  admin.use('/paketler', masterDbGerekli, paketlerRouter);
  admin.use('/lisanslar', masterDbGerekli, lisanslarRouter);
  admin.use('/roller', rollerRouter);
  admin.use('/sistem-ayarlari', sistemAyarlariRouter);
  admin.use('/kullanici-ayarlari', kullaniciAyarlariRouter);
  admin.use('/loglar', loglarRouter);
  admin.use('/yedek', yedekRouter);
  admin.use('/bildirimler', bildirimlerRouter);
  admin.use('/eklentiler', eklentilerRouter);
  admin.use('/', legacyStubsRouter);

  app.use('/api/admin', admin);

  app.use((_req, res) => {
    res.status(404).json({ mesaj: 'Endpoint bulunamadi' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ mesaj: 'Sunucu hatasi' });
  });

  return app;
}
