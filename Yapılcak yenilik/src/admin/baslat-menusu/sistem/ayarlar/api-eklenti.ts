import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { tokenAl } from '@/admin/ortak/api/authApi';
import type { EklentiKart } from '@/admin/ortak/tipler/eklenti';

export async function eklentileriGetir(): Promise<EklentiKart[]> {
  const yanit = await adminJsonFetch<{ eklentiler: EklentiKart[] }>('/eklentiler', {
    headers: adminHeaders(),
  });
  return yanit.eklentiler ?? [];
}

export async function eklentiKur(kod: string): Promise<void> {
  await adminJsonFetch(`/eklentiler/${encodeURIComponent(kod)}/kur`, {
    method: 'POST',
    headers: adminHeaders(),
  });
}

export async function eklentiAktif(kod: string): Promise<void> {
  await adminJsonFetch(`/eklentiler/${encodeURIComponent(kod)}/aktif`, {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}

export async function eklentiPasif(kod: string): Promise<void> {
  await adminJsonFetch(`/eklentiler/${encodeURIComponent(kod)}/pasif`, {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}

export async function eklentiKaldir(kod: string): Promise<void> {
  await adminJsonFetch(`/eklentiler/${encodeURIComponent(kod)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

export async function eklentiZipYukle(dosya: File): Promise<void> {
  const form = new FormData();
  form.append('dosya', dosya);
  const token = tokenAl();
  if (!token) throw new Error('Oturum bulunamadi');
  const API_URL = import.meta.env.VITE_API_URL ?? '/api';
  const yanit = await fetch(`${API_URL}/admin/eklentiler/yukle`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!yanit.ok) {
    const hata = (await yanit.json().catch(() => ({}))) as { mesaj?: string };
    throw new Error(hata.mesaj ?? 'Eklenti yüklenemedi');
  }
}
