import { tokenAl } from '@/admin/ortak/api/authApi';
import { jsonYanitOku } from '@/araclar/jsonFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';
import { offlineAdminYanit } from './offlineAdminYanit';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export function adminHeaders(json = true): HeadersInit {
  const token = tokenAl();
  if (!token) throw new Error('Oturum bulunamadi');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function adminJsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (BACKEND_YOK) {
    const method = init?.method ?? 'GET';
    return offlineAdminYanit(path, method, init?.body) as T;
  }

  const yanit = await fetch(`${API_URL}/admin${path}`, init);
  const veri = await jsonYanitOku<{ mesaj?: string; hatalar?: Record<string, string[] | undefined> }>(yanit);
  if (!yanit.ok) {
    const hatalar = veri.hatalar as Record<string, string[] | undefined> | undefined;
    const detay = hatalar
      ? Object.entries(hatalar)
          .flatMap(([alan, liste]) => (liste ?? []).map((m) => `${alan}: ${m}`))
          .join(' · ')
      : '';
    throw new Error(detay ? `${veri.mesaj ?? 'Islem basarisiz'} (${detay})` : (veri.mesaj ?? 'Islem basarisiz'));
  }
  return veri as T;
}
