import { writeFileSync } from 'fs';
import { TELEFON_ULKE_HAM_VERI } from '../src/admin/baslat-menusu/erp/cari/telefonUlkeHamVeri';
import { ULKELER } from '../src/veri/ulkeler';

const byIso = new Map<string, string>();
for (const u of TELEFON_ULKE_HAM_VERI) {
  const iso = (u.bayrakId || u.id.match(/^([A-Z]{2})/)?.[1] || u.id).slice(0, 2).toUpperCase();
  if (!byIso.has(iso) || u.id === iso) byIso.set(iso, u.ad);
}

// Read matched from previous logic quickly — rebuild with aliases
const aliases: Record<string, string> = {
  'amerika birleşik devletleri': 'US',
  abd: 'US',
  'birleşik krallık': 'GB',
  ingiltere: 'GB',
  'güney kore': 'KR',
  'kuzey kore': 'KP',
  çekya: 'CZ',
  'çek cumhuriyeti': 'CZ',
  'beyaz rusya': 'BY',
  belarus: 'BY',
  moldova: 'MD',
  vatikan: 'VA',
  'yeşil burun adaları': 'CV',
  'cape verde': 'CV',
  'fildişi sahili': 'CI',
  'bosna-hersek': 'BA',
  'kongo demokratik cumhuriyeti': 'CD',
  'kongo cumhuriyeti': 'CG',
  'doğu timor': 'TL',
  esvatini: 'SZ',
  mikronezya: 'FM',
  'marshall adaları': 'MH',
  'solomon adaları': 'SB',
  'saint kitts ve nevis': 'KN',
  'saint lucia': 'LC',
  'saint vincent ve grenadinler': 'VC',
  'sao tome ve principe': 'ST',
  'trinidad ve tobago': 'TT',
  'birleşik arap emirlikleri': 'AE',
  'kuzey makedonya': 'MK',
  'güney sudan': 'SS',
  'papua yeni gine': 'PG',
  'orta afrika cumhuriyeti': 'CF',
  'dominik cumhuriyeti': 'DO',
  'el salvador': 'SV',
  'ekvator ginesi': 'GQ',
  'antigua ve barbuda': 'AG',
  turkmenistan: 'TM',
  'yeni zelanda': 'NZ',
  'güney afrika': 'ZA',
};

function lower(s: string) {
  return s.toLocaleLowerCase('tr');
}

const isoByAd = new Map<string, string>();
for (const [iso, ad] of byIso) isoByAd.set(lower(ad), iso);
for (const [k, v] of Object.entries(aliases)) isoByAd.set(k, v);

const usedIso = new Set<string>();
const entries: { ad: string; iso: string }[] = [];
for (const ad of ULKELER) {
  let iso = isoByAd.get(lower(ad));
  if (!iso) {
    for (const [iso2, tad] of byIso) {
      if (lower(tad).includes(lower(ad)) || lower(ad).includes(lower(tad))) {
        iso = iso2;
        break;
      }
    }
  }
  if (!iso) continue;
  usedIso.add(iso);
  entries.push({ ad, iso });
}

for (const [iso, ad] of [...byIso.entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'))) {
  if (usedIso.has(iso)) continue;
  entries.push({ ad, iso });
  usedIso.add(iso);
}

// Türkiye first
entries.sort((a, b) => {
  if (a.iso === 'TR') return -1;
  if (b.iso === 'TR') return 1;
  return a.ad.localeCompare(b.ad, 'tr');
});

const ts = `/** Menşei ülkeleri — ad + ISO2 (bayrak için). Otomatik üretildi; elle düzenlemeyin. */
export type MenseiUlke = { ad: string; iso: string };

export const MENSEI_ULKELER: readonly MenseiUlke[] = ${JSON.stringify(entries, null, 2)} as const;
`;

writeFileSync(new URL('../src/veri/menseiUlkeler.ts', import.meta.url), ts, 'utf8');
console.error('wrote', entries.length);
