import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const sema = 'prisma/schema.prisma';

console.log(`Prisma generate: ${sema}`);
execSync(`node ./node_modules/prisma/build/index.js generate --schema ${sema}`, {
  cwd: kok,
  stdio: 'inherit',
});
