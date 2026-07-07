import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type FirmaLisansDurum = 'aktif' | 'pasif' | 'yakinda' | 'yok';

export interface MasterFirma {
  id: number;
  bayiId: number;
  bayiUnvan: string;
  tabelaAdi: string | null;
  unvan: string;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  subeSayisi: number;
  lisansDurum: FirmaLisansDurum;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface FirmaListeYanit {
  firmalar: MasterFirma[];
}

export interface FirmaFormGirdi {
  bayiId: number;
  unvan: string;
  tabelaAdi?: string;
  il?: string;
  ilce?: string;
  eposta?: string;
  telefon?: string;
  gsm?: string;
  vergiDairesi?: string;
  vergiNo?: string;
  iskonto?: number | null;
  aktif?: boolean;
}

export function lisansDurumEtiketi(durum: FirmaLisansDurum): string {
  switch (durum) {
    case 'aktif':
      return 'Aktif';
    case 'yakinda':
      return 'Yakında bitiyor';
    case 'pasif':
      return 'Pasif';
    default:
      return 'Lisans yok';
  }
}

export async function masterFirmalariGetir(): Promise<FirmaListeYanit> {
  return adminJsonFetch<FirmaListeYanit>('/firmalar', { headers: adminHeaders() });
}

export async function masterFirmaOlustur(girdi: FirmaFormGirdi): Promise<{ firma: MasterFirma }> {
  return adminJsonFetch('/firmalar', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterFirmaGuncelle(
  id: number,
  girdi: Partial<FirmaFormGirdi>
): Promise<{ firma: MasterFirma }> {
  return adminJsonFetch(`/firmalar/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterFirmaSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/firmalar/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
