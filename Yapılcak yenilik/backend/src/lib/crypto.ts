import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function sifreHashle(sifre: string): string {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

export function sifreDogrula(sifre: string, kayitli: string): boolean {
  if (!kayitli.startsWith('scrypt:')) return false;
  const [, tuz, hash] = kayitli.split(':');
  if (!tuz || !hash) return false;
  const deneme = scryptSync(sifre, tuz, 64).toString('hex');
  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(deneme, 'hex'));
  } catch {
    return false;
  }
}

export function pinHashle(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}
