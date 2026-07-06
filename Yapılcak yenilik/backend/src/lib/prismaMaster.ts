import { prisma } from './prisma.js';

/** Master DB tablolari — sube modunda cagrilmamali (app.ts masterDbGerekli) */
export const prismaMaster = prisma as any;
