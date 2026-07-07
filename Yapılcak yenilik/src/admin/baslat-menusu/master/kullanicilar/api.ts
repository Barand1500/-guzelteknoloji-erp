import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type KullaniciTipi = 'merkez' | 'bayi' | 'firma' | 'sube';

export interface MasterKullanici {
  id: number;
  ad: string;
  eposta: string;
  gsm: string | null;
  rol: string;
  kullaniciTipi: KullaniciTipi;
  bayiId: number | null;
  bayiUnvan: string | null;
  firmaId: number | null;
  firmaUnvan: string | null;
  firmaTabela: string | null;
  subeId: number | null;
  subeAdi: string | null;
  iskonto: number | null;
  aktif: boolean;
  sonGirisTarihi: string | null;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface KullaniciFormGirdi {
  ad: string;
  email: string;
  sifre?: string;
  rol: string;
  kullaniciTipi: KullaniciTipi;
  bayiId?: number | null;
  firmaId?: number | null;
  subeId?: number | null;
  gsm?: string;
  iskonto?: number | null;
  aktif?: boolean;
}

export function kullaniciTipiHesapla(
  bayiId?: number | null,
  firmaId?: number | null,
  subeId?: number | null
): KullaniciTipi {
  if (subeId) return 'sube';
  if (firmaId) return 'firma';
  if (bayiId) return 'bayi';
  return 'merkez';
}

export function sonGirisGoster(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export const KULLANICI_TIP_ETIKET: Record<KullaniciTipi, string> = {
  merkez: 'Merkez',
  bayi: 'Bayi',
  firma: 'Firma',
  sube: 'Şube',
};

export async function masterKullanicilariGetir(): Promise<{ kullanicilar: MasterKullanici[] }> {
  return adminJsonFetch('/kullanicilar/master', { headers: adminHeaders() });
}

export async function masterKullaniciOlustur(girdi: KullaniciFormGirdi): Promise<{ kullanici: MasterKullanici }> {
  return adminJsonFetch('/kullanicilar', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ ...girdi, kapsam: 'master' }),
  });
}

export async function masterKullaniciGuncelle(
  id: number,
  girdi: Partial<KullaniciFormGirdi>
): Promise<{ kullanici: MasterKullanici }> {
  return adminJsonFetch(`/kullanicilar/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterKullaniciSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/kullanicilar/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
