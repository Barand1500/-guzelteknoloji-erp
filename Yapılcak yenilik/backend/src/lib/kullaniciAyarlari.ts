import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

export async function sekmeAyarlariGetir(kullaniciId: number): Promise<Record<string, unknown>> {
  const kayit = await prisma.kullaniciSekmeAyar.findUnique({ where: { kullaniciId } });
  const ham = kayit?.ayarlar;
  return ham && typeof ham === 'object' && !Array.isArray(ham) ? (ham as Record<string, unknown>) : {};
}

export async function sekmeAyarlariKaydet(
  kullaniciId: number,
  ayarlar: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const json = ayarlar as Prisma.InputJsonValue;
  await prisma.kullaniciSekmeAyar.upsert({
    where: { kullaniciId },
    create: { kullaniciId, ayarlar: json },
    update: { ayarlar: json },
  });
  return ayarlar;
}

export async function kisayolHaritasiGetir(kullaniciId: number): Promise<Record<string, unknown>> {
  const kayit = await prisma.kullaniciKisayol.findUnique({ where: { kullaniciId } });
  const ham = kayit?.harita;
  return ham && typeof ham === 'object' && !Array.isArray(ham) ? (ham as Record<string, unknown>) : {};
}

export async function kisayolHaritasiKaydet(
  kullaniciId: number,
  harita: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const json = harita as Prisma.InputJsonValue;
  await prisma.kullaniciKisayol.upsert({
    where: { kullaniciId },
    create: { kullaniciId, harita: json },
    update: { harita: json },
  });
  return harita;
}
