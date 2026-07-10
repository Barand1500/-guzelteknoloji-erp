import { adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';

const MIN_ARAMA = 2;

type OfflineKayit = { plaka: string; vergi_dairesi: string };

let offlineListe: OfflineKayit[] | null = null;

async function offlineKayitlariYukle(): Promise<OfflineKayit[]> {
  if (offlineListe) return offlineListe;
  const res = await fetch('/vergiDaireleri.json');
  if (!res.ok) throw new Error('Vergi dairesi listesi yuklenemedi');
  offlineListe = (await res.json()) as OfflineKayit[];
  return offlineListe;
}

async function offlineAra(arama: string, plaka?: string): Promise<string[]> {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (q.length < MIN_ARAMA) return [];

  const kayitlar = await offlineKayitlariYukle();
  const plakaFiltre = plaka?.trim().padStart(2, '0').slice(-2);
  const adlar = new Set<string>();

  for (const k of kayitlar) {
    if (plakaFiltre && k.plaka !== plakaFiltre) continue;
    if (!k.vergi_dairesi.toLocaleLowerCase('tr').includes(q)) continue;
    adlar.add(k.vergi_dairesi);
    if (adlar.size >= 30) break;
  }

  return [...adlar].sort((a, b) => a.localeCompare(b, 'tr'));
}

async function offlinePlakaBul(ad: string): Promise<string> {
  const kayitlar = await offlineKayitlariYukle();
  return kayitlar.find((k) => k.vergi_dairesi === ad)?.plaka ?? '';
}

export async function vergiDaireleriAra(arama: string, plaka?: string): Promise<string[]> {
  const q = arama.trim();
  if (q.length < MIN_ARAMA) return [];

  if (BACKEND_YOK) return offlineAra(q, plaka);

  const params = new URLSearchParams({ arama: q });
  if (plaka?.trim()) params.set('plaka', plaka.trim());
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
