import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { SiparisSatiri } from '@/admin/baslat-menusu/datagrid/demo/demoVeri';

const TABAN = '/datagrid-demo';

export interface SiparisIcerigiKayit {
  kdvDahil: boolean;
  satirlar: SiparisSatiri[];
}

export async function siparisIcerigiGetir(): Promise<SiparisIcerigiKayit> {
  const veri = await adminJsonFetch<SiparisIcerigiKayit>(`${TABAN}/siparis-icerigi`, {
    headers: adminHeaders(),
  });
  return {
    kdvDahil: veri.kdvDahil !== false,
    satirlar: Array.isArray(veri.satirlar) ? veri.satirlar : [],
  };
}

export async function siparisIcerigiKaydet(kayit: SiparisIcerigiKayit): Promise<SiparisIcerigiKayit> {
  const veri = await adminJsonFetch<SiparisIcerigiKayit>(`${TABAN}/siparis-icerigi`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(kayit),
  });
  return {
    kdvDahil: veri.kdvDahil !== false,
    satirlar: Array.isArray(veri.satirlar) ? veri.satirlar : [],
  };
}
