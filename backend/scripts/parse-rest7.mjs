import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = path.join(os.tmpdir(), 'rest7_parse');
const shared = fs.readFileSync(path.join(tmp, 'xl/sharedStrings.xml'), 'utf8');
const strings = [...shared.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1]);

function parseSheet(name) {
  const xml = fs.readFileSync(path.join(tmp, 'xl/worksheets', name), 'utf8');
  console.log(`\n=== ${name} ===`);
  const rows = [...xml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
  for (const row of rows) {
    const r = parseInt(row[1], 10);
    const cells = [...row[2].matchAll(/<c r="([A-Z]+)\d+"[^>]*?(?: t="s")?[^>]*>(?:<v>(\d+)<\/v>)?/g)];
    const vals = [];
    for (const c of cells) {
      const v = c[2];
      if (v === undefined) continue;
      const idx = parseInt(v, 10);
      vals.push(strings[idx] ?? v);
    }
    if (vals.length) console.log(`R${r}:`, vals.join(' | '));
  }
}

for (const s of ['sheet1.xml', 'sheet2.xml']) parseSheet(s);
