import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export interface AdminBildirim {
  id: string;
  tip: 'form_gonderim' | 'sistem';
  baslik: string;
  mesaj: string;
  okundu: boolean;
  olusturma: string;
  formId?: string;
  gonderimId?: string;
  link?: string;
}

export async function adminBildirimleriGetir(): Promise<{ bildirimler: AdminBildirim[]; okunmamisSayi: number }> {
  return adminJsonFetch<{ bildirimler: AdminBildirim[]; okunmamisSayi: number }>('/bildirimler', {
    headers: adminHeaders(),
  });
}

export async function adminBildirimleriTumunuOkundu(): Promise<void> {
  await adminJsonFetch('/bildirimler/tumu-okundu', {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}
