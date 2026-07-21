import { adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';

const MIN_ARAMA = 2;
const ARAMA_LIMIT = 80;

type OfflineKayit = { plaka: string; vergi_dairesi: string };

let offlineListe: OfflineKayit[] | null = null;
let adListe: string[] | null = null;
let yuklemeSoz: Promise<OfflineKayit[]> | null = null;

function trSirala(liste: string[]) {
  return [...liste].sort((a, b) => a.localeCompare(b, 'tr'));
}

function adlariDerle(kayitlar: OfflineKayit[]): string[] {
  return trSirala([...new Set(kayitlar.map((k) => k.vergi_dairesi).filter(Boolean))]);
}

function yerelFiltrele(liste: string[], arama: string, plaka?: string): string[] {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (q.length < MIN_ARAMA) return [];

  const plakaFiltre = plaka?.trim().padStart(2, '0').slice(-2);
  if (!plakaFiltre) {
    return liste.filter((ad) => ad.toLocaleLowerCase('tr').includes(q)).slice(0, ARAMA_LIMIT);
  }

  if (!offlineListe) return [];
  const adlar = new Set<string>();
  for (const k of offlineListe) {
    if (k.plaka !== plakaFiltre) continue;
    if (!k.vergi_dairesi.toLocaleLowerCase('tr').includes(q)) continue;
    adlar.add(k.vergi_dairesi);
    if (adlar.size >= ARAMA_LIMIT) break;
  }
  return trSirala([...adlar]);
}

async function offlineKayitlariYukle(): Promise<OfflineKayit[]> {
  if (offlineListe) return offlineListe;
  if (yuklemeSoz) return yuklemeSoz;

  yuklemeSoz = fetch('/vergiDaireleri.json')
    .then(async (res) => {
      if (!res.ok) throw new Error('Vergi dairesi listesi yuklenemedi');
      const kayitlar = (await res.json()) as OfflineKayit[];
      offlineListe = kayitlar;
      adListe = adlariDerle(kayitlar);
      return kayitlar;
    })
    .catch((err) => {
      yuklemeSoz = null;
      throw err;
    });

  return yuklemeSoz;
}

/** Uygulama açılışında listeyi önceden yükler (anlık filtre için) */
export async function vergiDaireleriListeYukle(): Promise<string[]> {
  await offlineKayitlariYukle();
  return adListe ?? [];
}

/** Önbellekteki vergi dairesi adları (yüklenmediyse boş) */
export function vergiDaireleriAdlari(): string[] {
  return adListe ?? [];
}

async function offlineAra(arama: string, plaka?: string): Promise<string[]> {
  await offlineKayitlariYukle();
  return yerelFiltrele(adListe ?? [], arama, plaka);
}

async function offlinePlakaBul(ad: string): Promise<string> {
  const kayitlar = await offlineKayitlariYukle();
  return kayitlar.find((k) => k.vergi_dairesi === ad)?.plaka ?? '';
}

export async function vergiDaireleriAra(arama: string, plaka?: string): Promise<string[]> {
  const q = arama.trim();
  if (q.length < MIN_ARAMA) return [];

  if (BACKEND_YOK || !plaka?.trim()) {
    return offlineAra(q, plaka);
  }

  const params = new URLSearchParams({ arama: q, plaka: plaka.trim() });
  const yanit = await adminJsonFetch<{ liste: { ad: string }[] }>(
    `/referans/vergi-daireleri?${params.toString()}`
  );
  return yanit.liste.map((k) => k.ad);
}

export async function vergiDairesiPlakaBul(ad: string): Promise<string> {
  const q = ad.trim();
  if (!q) return '';

  if (BACKEND_YOK) return offlinePlakaBul(q);

  const yanit = await adminJsonFetch<{ plaka: string }>(
    `/referans/vergi-dairesi-il?${new URLSearchParams({ ad: q }).toString()}`
  );
  return yanit.plaka ?? '';
}

void vergiDaireleriListeYukle().catch(() => {
  /* ilk yükleme isteğe bağlı; arama sırasında tekrar denenir */
});
