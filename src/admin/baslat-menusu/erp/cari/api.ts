import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { AdminCari, CariFormDegeri, CariTipi } from '@/admin/baslat-menusu/erp/cari/tipler';

const TABAN = '/cariler';

export type CariSilModu = 'hepsi' | 'pasif';

function cariSilIstegi(id: string, mod?: CariSilModu) {
  return adminJsonFetch(`${TABAN}/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
    body: mod ? JSON.stringify({ mod }) : undefined,
  });
}

export async function carileriGetir(cariTipi?: CariTipi | ''): Promise<AdminCari[]> {
  const sorgu = cariTipi ? `?cariTipi=${encodeURIComponent(cariTipi)}` : '';
  const veri = await adminJsonFetch<{ cariler: AdminCari[] }>(`${TABAN}${sorgu}`, {
    headers: adminHeaders(),
  });
  return veri.cariler ?? [];
}

export async function cariOlustur(form: CariFormDegeri): Promise<AdminCari> {
  const veri = await adminJsonFetch<{ cari: AdminCari }>(TABAN, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.cari;
}

export async function cariGuncelle(id: string, form: CariFormDegeri): Promise<AdminCari> {
  const veri = await adminJsonFetch<{ cari: AdminCari }>(`${TABAN}/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.cari;
}

export async function cariSil(id: string, mod?: CariSilModu): Promise<void> {
  await cariSilIstegi(id, mod);
}
