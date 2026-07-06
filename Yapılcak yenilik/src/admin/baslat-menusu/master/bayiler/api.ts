import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export interface MasterBayi {
  id: number;
  unvan: string;
  ustId: number | null;
  ustUnvan: string | null;
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
  firmaSayisi: number;
  altBayiSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface BayiListeYanit {
  bayiler: MasterBayi[];
  ozet: {
    toplam: number;
    aktif: number;
    pasif: number;
    toplamFirma: number;
    altBayi: number;
  };
}

export interface BayiFormGirdi {
  unvan: string;
  ustId?: number | null;
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

export function bayiTarihGoster(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR');
}

export async function masterBayileriGetir(): Promise<BayiListeYanit> {
  return adminJsonFetch<BayiListeYanit>('/bayiler', { headers: adminHeaders() });
}

export async function masterBayiOlustur(girdi: BayiFormGirdi): Promise<{ bayi: MasterBayi }> {
  return adminJsonFetch('/bayiler', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterBayiGuncelle(
  id: number,
  girdi: Partial<BayiFormGirdi>
): Promise<{ bayi: MasterBayi }> {
  return adminJsonFetch(`/bayiler/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterBayiSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/bayiler/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
