import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { PaketParaBirimi } from '@/admin/baslat-menusu/master/paketler/paraBirimi';
import { paketParaBirimiNormallestir } from '@/admin/baslat-menusu/master/paketler/paraBirimi';

export interface MasterPaket {
  id: number;
  paketAdi: string;
  subeSayisi: number;
  personelSayisi: number;
  masaSayisi: number;
  fiyat: number;
  paraBirimi: PaketParaBirimi;
  aktif: boolean;
  aktifLisansSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface PaketFormGirdi {
  paketAdi: string;
  subeSayisi: number;
  personelSayisi: number;
  masaSayisi: number;
  fiyat: number;
  paraBirimi: PaketParaBirimi;
  aktif?: boolean;
}

export async function masterPaketleriGetir(): Promise<{ paketler: MasterPaket[] }> {
  const veri = await adminJsonFetch<{ paketler?: MasterPaket[] }>('/paketler', { headers: adminHeaders() });
  return {
    paketler: (veri.paketler ?? []).map((p) => ({
      ...p,
      paraBirimi: paketParaBirimiNormallestir(p.paraBirimi),
    })),
  };
}

export async function masterPaketOlustur(girdi: PaketFormGirdi): Promise<{ paket: MasterPaket }> {
  return adminJsonFetch('/paketler', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterPaketGuncelle(
  id: number,
  girdi: Partial<PaketFormGirdi>
): Promise<{ paket: MasterPaket }> {
  return adminJsonFetch(`/paketler/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterPaketSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/paketler/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
