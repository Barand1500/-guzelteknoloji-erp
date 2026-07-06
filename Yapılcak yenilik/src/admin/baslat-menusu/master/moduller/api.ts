import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export interface MasterModul {
  id: number;
  ad: string;
  prefix: string;
  aktif: boolean;
  rolSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface ModulListeYanit {
  moduller: MasterModul[];
  ozet: { toplam: number; aktif: number; pasif: number };
}

export function prefixNormalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function prefixUret(modulAdi: string, mevcutPrefixler: string[]): string {
  let temel = prefixNormalize(modulAdi);
  if (!temel) temel = 'modul';
  if (!/^[a-z]/.test(temel)) temel = `m_${temel}`;
  if (!mevcutPrefixler.includes(temel)) return temel;
  let sayac = 2;
  while (mevcutPrefixler.includes(`${temel}_${sayac}`)) sayac += 1;
  return `${temel}_${sayac}`.slice(0, 50);
}

export async function masterModulleriGetir(): Promise<ModulListeYanit> {
  return adminJsonFetch<ModulListeYanit>('/moduller', { headers: adminHeaders() });
}

export async function masterModulOlustur(girdi: {
  modulAdi: string;
  prefix?: string;
  aktif?: boolean;
}): Promise<{ modul: MasterModul }> {
  return adminJsonFetch('/moduller', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(girdi),
  });
}

export async function masterModulGuncelle(
  id: number,
  girdi: { modulAdi?: string; prefix?: string; aktif?: boolean }
): Promise<{ modul: MasterModul }> {
  const body: Record<string, unknown> = {};
  if (girdi.aktif !== undefined) body.aktif = girdi.aktif;
  if (girdi.modulAdi !== undefined) body.modulAdi = girdi.modulAdi;
  if (girdi.prefix !== undefined) body.prefix = girdi.prefix;

  return adminJsonFetch(`/moduller/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

export async function masterModulSil(id: number): Promise<{ mesaj: string }> {
  return adminJsonFetch(`/moduller/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
