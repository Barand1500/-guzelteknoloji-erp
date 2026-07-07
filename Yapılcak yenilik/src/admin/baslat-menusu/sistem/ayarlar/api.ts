import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

export type { SistemAyarlariForm };

export interface SistemAyarlariYanit {
  site: {
    id: string;
    ad: string;
    slug: string;
    domain: string | null;
    aktif: boolean;
  };
  sistem: Partial<SistemAyarlariForm>;
  surum: string;
}

export async function sistemAyarlariGetir(): Promise<SistemAyarlariYanit> {
  return adminJsonFetch<SistemAyarlariYanit>('/sistem-ayarlari', { headers: adminHeaders() });
}

export async function sistemAyarlariGuncelle(form: SistemAyarlariForm): Promise<SistemAyarlariYanit> {
  return adminJsonFetch<SistemAyarlariYanit>('/sistem-ayarlari', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
}
