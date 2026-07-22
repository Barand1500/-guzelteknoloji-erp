import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** @type {Record<string, string>} */
const TR_ISIMLER = {
  TR: 'Türkiye',
  DE: 'Almanya',
  US: 'ABD',
  GB: 'Birleşik Krallık',
  FR: 'Fransa',
  NL: 'Hollanda',
  IT: 'İtalya',
  ES: 'İspanya',
  AZ: 'Azerbaycan',
  RU: 'Rusya',
  SA: 'Suudi Arabistan',
  AE: 'BAE',
  IQ: 'Irak',
  IR: 'İran',
  SY: 'Suriye',
  BG: 'Bulgaristan',
  GR: 'Yunanistan',
  RO: 'Romanya',
  CN: 'Çin',
  JP: 'Japonya',
  KR: 'Güney Kore',
  IN: 'Hindistan',
  PK: 'Pakistan',
  CA: 'Kanada',
  AU: 'Avustralya',
  CH: 'İsviçre',
  AT: 'Avusturya',
  BE: 'Belçika',
  SE: 'İsveç',
  NO: 'Norveç',
  PL: 'Polonya',
  UA: 'Ukrayna',
  EG: 'Mısır',
  GE: 'Gürcistan',
  AF: 'Afganistan',
  AL: 'Arnavutluk',
  DZ: 'Cezayir',
  AD: 'Andorra',
  AO: 'Angola',
  AG: 'Antigua ve Barbuda',
  AR: 'Arjantin',
  AM: 'Ermenistan',
  BS: 'Bahamalar',
  BH: 'Bahreyn',
  BD: 'Bangladeş',
  BB: 'Barbados',
  BY: 'Belarus',
  BZ: 'Belize',
  BJ: 'Benin',
  BT: 'Bhutan',
  BO: 'Bolivya',
  BA: 'Bosna-Hersek',
  BW: 'Botsvana',
  BR: 'Brezilya',
  BN: 'Brunei',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Kamboçya',
  CM: 'Kamerun',
  CV: 'Yeşil Burun Adaları',
  CF: 'Orta Afrika Cumhuriyeti',
  TD: 'Çad',
  CL: 'Şili',
  CO: 'Kolombiya',
  KM: 'Komorlar',
  CG: 'Kongo',
  CD: 'Kongo Demokratik Cumhuriyeti',
  CR: 'Kosta Rika',
  CI: 'Fildişi Sahili',
  HR: 'Hırvatistan',
  CU: 'Küba',
  CY: 'Kıbrıs',
  CZ: 'Çekya',
  DK: 'Danimarka',
  DJ: 'Cibuti',
  DM: 'Dominika',
  DO: 'Dominik Cumhuriyeti',
  EC: 'Ekvador',
  SV: 'El Salvador',
  GQ: 'Ekvator Ginesi',
  ER: 'Eritre',
  EE: 'Estonya',
  SZ: 'Esvatini',
  ET: 'Etiyopya',
  FJ: 'Fiji',
  FI: 'Finlandiya',
  GA: 'Gabon',
  GM: 'Gambiya',
  GH: 'Gana',
  GD: 'Grenada',
  GT: 'Guatemala',
  GN: 'Gine',
  GW: 'Gine-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HN: 'Honduras',
  HU: 'Macaristan',
  IS: 'İzlanda',
  ID: 'Endonezya',
  IE: 'İrlanda',
  IL: 'İsrail',
  JM: 'Jamaika',
  JO: 'Ürdün',
  KZ: 'Kazakistan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KW: 'Kuveyt',
  KG: 'Kırgızistan',
  LA: 'Laos',
  LV: 'Letonya',
  LB: 'Lübnan',
  LS: 'Lesotho',
  LR: 'Liberya',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Litvanya',
  LU: 'Lüksemburg',
  MK: 'Kuzey Makedonya',
  MG: 'Madagaskar',
  MW: 'Malavi',
  MY: 'Malezya',
  MV: 'Maldivler',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Adaları',
  MR: 'Moritanya',
  MU: 'Mauritius',
  MX: 'Meksika',
  FM: 'Mikronezya',
  MD: 'Moldova',
  MC: 'Monako',
  MN: 'Moğolistan',
  ME: 'Karadağ',
  MA: 'Fas',
  MZ: 'Mozambik',
  MM: 'Myanmar',
  NA: 'Namibya',
  NR: 'Nauru',
  NP: 'Nepal',
  NZ: 'Yeni Zelanda',
  NI: 'Nikaragua',
  NE: 'Nijer',
  NG: 'Nijerya',
  KP: 'Kuzey Kore',
  OM: 'Umman',
  PA: 'Panama',
  PG: 'Papua Yeni Gine',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Filipinler',
  PT: 'Portekiz',
  QA: 'Katar',
  RW: 'Ruanda',
  KN: 'Saint Kitts ve Nevis',
  LC: 'Saint Lucia',
  VC: 'Saint Vincent ve Grenadinler',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'São Tomé ve Príncipe',
  SN: 'Senegal',
  RS: 'Sırbistan',
  SC: 'Seyşeller',
  SL: 'Sierra Leone',
  SG: 'Singapur',
  SK: 'Slovakya',
  SI: 'Slovenya',
  SB: 'Solomon Adaları',
  SO: 'Somali',
  ZA: 'Güney Afrika',
  SS: 'Güney Sudan',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Surinam',
  SE: 'İsveç',
  TJ: 'Tacikistan',
  TZ: 'Tanzanya',
  TH: 'Tayland',
  TL: 'Doğu Timor',
  TG: 'Togo',
  TO: 'Tonga',
  TT: 'Trinidad ve Tobago',
  TN: 'Tunus',
  TM: 'Türkmenistan',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UY: 'Uruguay',
  UZ: 'Özbekistan',
  VU: 'Vanuatu',
  VA: 'Vatikan',
  VE: 'Venezuela',
  VN: 'Vietnam',
  YE: 'Yemen',
  ZM: 'Zambiya',
  ZW: 'Zimbabve',
  PS: 'Filistin',
  XK: 'Kosova',
  HK: 'Hong Kong',
  MO: 'Makao',
  TW: 'Tayvan',
  PR: 'Porto Riko',
  RE: 'Réunion',
  GP: 'Guadeloupe',
  MQ: 'Martinik',
  GF: 'Fransız Guyanası',
  NC: 'Yeni Kaledonya',
  PF: 'Fransız Polinezyası',
  GL: 'Grönland',
  FO: 'Faroe Adaları',
  GI: 'Cebelitarık',
  IM: 'Man Adası',
  JE: 'Jersey',
  GG: 'Guernsey',
  AX: 'Åland Adaları',
  AW: 'Aruba',
  CW: 'Curaçao',
  SX: 'Sint Maarten',
  BQ: 'Karayip Hollandası',
  BM: 'Bermuda',
  KY: 'Cayman Adaları',
  VG: 'Britanya Virgin Adaları',
  VI: 'ABD Virgin Adaları',
  TC: 'Turks ve Caicos Adaları',
  MS: 'Montserrat',
  AI: 'Anguilla',
  FK: 'Falkland Adaları',
  SH: 'Saint Helena',
  PM: 'Saint Pierre ve Miquelon',
  WF: 'Wallis ve Futuna',
  CK: 'Cook Adaları',
  NU: 'Niue',
  TK: 'Tokelau',
  AS: 'Amerikan Samoası',
  GU: 'Guam',
  MP: 'Kuzey Mariana Adaları',
  PW: 'Palau',
  MH: 'Marshall Adaları',
  FM: 'Mikronezya',
  KI: 'Kiribati',
  NR: 'Nauru',
  TV: 'Tuvalu',
};

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === ',' && !inQ) {
      cols.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  cols.push(cur);
  return cols;
}

function dialParcalari(hamDial) {
  return hamDial
    .split(',')
    .map((part) => part.replace(/[^\d]/g, ''))
    .filter(Boolean);
}

function ulkeKayitId(iso2, dial, dialParcaSayisi) {
  if (dialParcaSayisi <= 1) return iso2;
  if (/^1\d{3}$/.test(dial)) return `${iso2}${dial.slice(1)}`;
  return `${iso2}_${dial}`;
}

function ulkeKayitAd(temelAd, dial, dialParcaSayisi) {
  if (dialParcaSayisi <= 1) return temelAd;
  if (/^1\d{3}$/.test(dial)) return `${temelAd} (${dial.slice(1)})`;
  return temelAd;
}

const res = await fetch(
  'https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv'
);
const csv = await res.text();
const lines = csv.trim().split('\n');
const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''));
const idx = {
  name: headers.indexOf('CLDR display name'),
  iso2: headers.indexOf('ISO3166-1-Alpha-2'),
  dial: headers.indexOf('Dial'),
};

/** @type {{ id: string; ad: string; dial: string; maxHane: number; trFormat?: boolean; bayrakId?: string }[]} */
const ulkeler = [];
const seen = new Set();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const iso2 = (cols[idx.iso2] || '').trim();
  const hamDial = (cols[idx.dial] || '').trim();
  const adEn = (cols[idx.name] || '').trim();
  if (!iso2 || iso2.length !== 2 || !hamDial) continue;

  const dialList = dialParcalari(hamDial);
  if (dialList.length === 0) continue;

  const temelAd = TR_ISIMLER[iso2] || adEn;

  for (const dial of dialList) {
    const kayitId = ulkeKayitId(iso2, dial, dialList.length);
    const key = `${kayitId}|${dial}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const kayit = {
      id: kayitId,
      ad: ulkeKayitAd(temelAd, dial, dialList.length),
      dial,
      maxHane: iso2 === 'TR' ? 11 : iso2 === 'DO' ? 7 : 12,
    };
    if (iso2 === 'TR') kayit.trFormat = true;
    if (kayitId !== iso2) kayit.bayrakId = iso2;
    ulkeler.push(kayit);
  }
}

// Kosova CSV'de yoksa ekle
if (!ulkeler.some((u) => u.id === 'XK')) {
  ulkeler.push({ id: 'XK', ad: 'Kosova', dial: '383', maxHane: 12 });
}

ulkeler.sort(
  (a, b) => Number(a.dial) - Number(b.dial) || a.ad.localeCompare(b.ad, 'tr')
);

const outPath = path.join(root, 'src/admin/baslat-menusu/erp/cari/telefonUlkeHamVeri.ts');
const body = `/** Otomatik üretildi — scripts/gen-telefon-ulkeler.mjs */
export const TELEFON_ULKE_HAM_VERI = ${JSON.stringify(ulkeler, null, 2)} as const;
`;

fs.writeFileSync(outPath, body, 'utf8');
console.log(`Yazildi: ${ulkeler.length} ulke -> ${outPath}`);
