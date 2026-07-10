import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface VergiDairesiOzet {
  ad: string;
  plaka: string;
  ilce: string;
}

type GibVergiDairesi = {
  vdAdi?: string;
  vdKodu?: string;
  ilKodu?: string;
};

type YerelKayit = {
  plaka: string;
  il: string;
  ilce: string;
  vergi_dairesi: string;
};

const TOKEN_URL = 'https://intvrg.gib.gov.tr/intvrg/server/login';
const DATA_URL = 'https://intvrg.gib.gov.tr/intvrg/server/dispatch';

let onbellek: VergiDairesiOzet[] | null = null;
let yukleniyor: Promise<VergiDairesiOzet[]> | null = null;

function basHarfBuyuk(metin: string) {
  const kucuk = metin.toLocaleLowerCase('tr');
  return kucuk.charAt(0).toLocaleUpperCase('tr') + kucuk.slice(1);
}

function gibKayitlariIsle(kayitlar: GibVergiDairesi[]): VergiDairesiOzet[] {
  const harita = new Map<string, VergiDairesiOzet>();
  for (const kayit of kayitlar) {
    const ad = kayit.vdAdi?.trim();
    if (!ad) continue;
    const plaka = String(kayit.ilKodu ?? '').replace(/\D/g, '').padStart(2, '0').slice(-2);
    if (!plaka) continue;
    if (!harita.has(ad)) {
      harita.set(ad, { ad: basHarfBuyuk(ad), plaka, ilce: '' });
    }
  }
  return [...harita.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

async function gibListesiniAl(): Promise<VergiDairesiOzet[] | null> {
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({
        assoscmd: 'cfsession',
        rtype: 'json',
        fskey: 'intvrg.fix.session',
        fuserid: 'INTVRG_FIX',
      }),
    });
    if (!tokenRes.ok) return null;
    const tokenVeri = (await tokenRes.json()) as { token?: string };
    if (!tokenVeri.token) return null;

    const dataRes = await fetch(DATA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Origin: 'https://ivd.gib.gov.tr',
        Referer: `https://ivd.gib.gov.tr/tvd_side/main.jsp?token=${tokenVeri.token}`,
      },
      body: new URLSearchParams({
        cmd: 'referenceDataService_getCacheableRfDataInfo',
        callid: 'erp-ref-1',
        pageName: 'undefined',
        module: 'tvd',
        token: tokenVeri.token,
        jp: JSON.stringify({
          lang: 'tr',
          status: [{ rf: 'RF_VERGI_DAIRELERI' }],
        }),
      }),
    });
    if (!dataRes.ok) return null;

    const govde = (await dataRes.json()) as {
      data?: { refDataInfo?: { name?: string }; values?: GibVergiDairesi[] }[];
    };
    const blok = govde.data?.find((d) => d.refDataInfo?.name === 'RF_VERGI_DAIRELERI');
    if (!blok?.values?.length) return null;
    return gibKayitlariIsle(blok.values);
  } catch {
    return null;
  }
}

async function yerelListeyiAl(): Promise<VergiDairesiOzet[]> {
  const dosya = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/vergiDaireleri.json');
  const ham = await readFile(dosya, 'utf8');
  const kayitlar = JSON.parse(ham) as YerelKayit[];
  const harita = new Map<string, VergiDairesiOzet>();
  for (const kayit of kayitlar) {
    const ad = kayit.vergi_dairesi?.trim();
    if (!ad || harita.has(ad)) continue;
    harita.set(ad, {
      ad,
      plaka: kayit.plaka,
      ilce: kayit.ilce ?? '',
    });
  }
  return [...harita.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

export async function vergiDairesiListesiniAl(): Promise<VergiDairesiOzet[]> {
  if (onbellek) return onbellek;
  if (yukleniyor) return yukleniyor;

  yukleniyor = (async () => {
    const gib = await gibListesiniAl();
    onbellek = gib?.length ? gib : await yerelListeyiAl();
    yukleniyor = null;
    return onbellek;
  })();

  return yukleniyor;
}

export async function vergiDairesiAra(arama: string, plaka?: string, limit = 30): Promise<VergiDairesiOzet[]> {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (q.length < 2) return [];

  const liste = await vergiDairesiListesiniAl();
  const plakaFiltre = plaka?.trim().padStart(2, '0').slice(-2);

  return liste
    .filter((k) => {
      if (plakaFiltre && k.plaka !== plakaFiltre) return false;
      return k.ad.toLocaleLowerCase('tr').includes(q);
    })
    .slice(0, limit);
}

export async function vergiDairesiIlBul(ad: string): Promise<string> {
  const q = ad.trim();
  if (!q) return '';
  const liste = await vergiDairesiListesiniAl();
  const eslesen = liste.find((k) => k.ad === q);
  return eslesen?.plaka ?? '';
}
