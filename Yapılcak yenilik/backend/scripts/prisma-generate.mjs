import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');

function semaSec() {
  const envYol = join(kok, '.env');
  if (!existsSync(envYol)) return 'prisma/schema-sube.prisma';

  const env = readFileSync(envYol, 'utf8');
  const satir = env.split('\n').find((l) => l.startsWith('DB_TURU='));
  const tur = satir?.split('=')[1]?.trim().replace(/^["']|["']$/g, '') ?? 'sube';
  return tur === 'master' ? 'prisma/schema.prisma' : 'prisma/schema-sube.prisma';
}

const sema = semaSec();
console.log(`Prisma generate: ${sema}`);
execSync(`node ./node_modules/prisma/build/index.js generate --schema ${sema}`, {
  cwd: kok,
  stdio: 'inherit',
});
