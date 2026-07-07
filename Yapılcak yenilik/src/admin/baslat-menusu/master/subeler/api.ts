import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type SubeTipi = 'restoran' | 'kafe' | 'fast_food' | 'diger';

export interface MasterSube {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  subeAdi: string;
  subeTipi: SubeTipi;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface SubeListeYanit {
  subeler: MasterSube[];
}

export interface SubeFormGirdi {
  firmaId: number;
  subeAdi: string;
  subeTipi?: SubeTipi;
  il?: string;
  ilce?: string;
  adres?: string;
  eposta?: string;
  telefon?: string;
  gsm?: string;
  vergiDairesi?: string;
  vergiNo?: string;
  iskonto?: number | null;
  aktif?: boolean;
}

export const SUBE_TIP_SECENEKLERI: { kod: SubeTipi; etiket: string }[] = [
  { kod: 'restoran', etiket: 'Restoran' },
  { kod: 'kafe', etiket: 'Kafe' },
  { kod: 'fast_food', etiket: 'Fast Food' },
  { kod: 'diger', etiket: 'Diğer' },
];

export function subeTipEtiketi(tip: SubeTipi): string {
  return SUBE_TIP_SECENEKLERI.find((s) => s.kod === tip)?.etiket ?? tip;
}

export function subeTarihGoster(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR');
}

export async function masterSubeleriGetir(): Promise<SubeListeYanit> {
  const veri = await adminJsonFetch<SubeListeYanit>('/subeler', { headers: adminHeaders() });
  return { subeler: veri.subeler ?? [] };
}

export async function masterSubeOlustur(girdi: SubeFormGirdi): Promise<{ sube: MasterSube }> {
  return adminJsonFetch('/subeler', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterSubeGuncelle(
  id: number,
  girdi: Partial<SubeFormGirdi>
): Promise<{ sube: MasterSube }> {
  return adminJsonFetch(`/subeler/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterSubeSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/subeler/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
