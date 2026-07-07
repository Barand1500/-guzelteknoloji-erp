import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type LisansDurumKod = 'aktif' | 'pasif' | 'yakinda';

export interface MasterLisans {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  paketId: number;
  paketAdi: string;
  baslangicTarihi: string;
  bitisTarihi: string | null;
  durum: LisansDurumKod;
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface LisansFormGirdi {
  firmaId: number;
  paketId: number;
  baslangicTarihi?: string;
  bitisTarihi?: string | null;
  aktif?: boolean;
}

export function lisansDurumEtiketi(durum: LisansDurumKod): string {
  switch (durum) {
    case 'aktif':
      return 'Aktif';
    case 'yakinda':
      return 'Yakında bitiyor';
    default:
      return 'Pasif';
  }
}

export function tarihGoster(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR');
}

export async function masterLisanslariGetir(): Promise<{ lisanslar: MasterLisans[] }> {
  const veri = await adminJsonFetch<{ lisanslar?: MasterLisans[] }>('/lisanslar', { headers: adminHeaders() });
  return { lisanslar: veri.lisanslar ?? [] };
}

export async function masterLisansOlustur(girdi: LisansFormGirdi): Promise<{ lisans: MasterLisans }> {
  return adminJsonFetch('/lisanslar', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterLisansGuncelle(
  id: number,
  girdi: Partial<LisansFormGirdi>
): Promise<{ lisans: MasterLisans }> {
  return adminJsonFetch(`/lisanslar/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterLisansSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/lisanslar/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
