import 'dotenv/config';

function zorunlu(anahtar: string, varsayilan?: string): string {
  const deger = process.env[anahtar] ?? varsayilan;
  if (!deger) throw new Error(`Ortam degiskeni eksik: ${anahtar}`);
  return deger;
}

export const config = {
  port: Number(process.env.PORT ?? 3007),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dbTuru: 'erp' as const,
  databaseUrl: zorunlu('DATABASE_URL'),
  jwtSecret: zorunlu('JWT_SECRET', 'gelistirme-anahtari-degistirin'),
  jwtSureGun: Number(process.env.JWT_SURE_GUN ?? 7),
  corsOrigin: (process.env.CORS_ORIGIN ?? '*').split(',').map((o) => o.trim()),
  surum: '0.1.0',
};
