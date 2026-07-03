import type { AuthKullanici, AuthYanit, KullaniciTercihleri } from '@/admin/ortak/tipler/admin';
import { jsonYanitOku } from '@/araclar/jsonFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'gt_admin_token';
const HIZLI_ERISIM_KEY = 'gt_admin_hizli_erisim';

function hizliErisimOku(kullaniciId: string | number): string[] {
  try {
    const ham = localStorage.getItem(`${HIZLI_ERISIM_KEY}_${kullaniciId}`);
    if (!ham) return [];
    const dizi = JSON.parse(ham) as unknown;
    return Array.isArray(dizi) ? dizi.map(String) : [];
  } catch {
    return [];
  }
}

function hizliErisimKaydetLocal(kullaniciId: string | number, ids: string[]) {
  localStorage.setItem(`${HIZLI_ERISIM_KEY}_${kullaniciId}`, JSON.stringify(ids));
}

function kullaniciTercihleriEkle(k: AuthKullanici): AuthKullanici {
  return {
    ...k,
    tercihler: { dashboardHizliErisim: hizliErisimOku(k.id) },
  };
}

const OFFLINE_KULLANICI: AuthKullanici = {
  id: '1',
  kullaniciKodu: 'ADMIN',
  email: 'bilgi@guzelteknoloji.com',
  ad: 'ERCAN GUZEL',
  rol: 'YONETICI',
  tercihler: { dashboardHizliErisim: [] },
  yetkiler: [],
};

export interface ProfilGuncelleForm {
  ad: string;
  email: string;
  mevcutSifre?: string;
  yeniSifre?: string;
}

function authHeaders() {
  const token = tokenAl();
  if (!token) throw new Error('Oturum bulunamadı');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function tokenAl(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function tokenKaydet(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function tokenSil() {
  localStorage.removeItem(TOKEN_KEY);
}

export function offlineKullanici(kullaniciKodu?: string): AuthKullanici {
  return {
    ...OFFLINE_KULLANICI,
    kullaniciKodu: kullaniciKodu?.trim().toUpperCase() || OFFLINE_KULLANICI.kullaniciKodu,
  };
}

export async function girisYap(kullaniciKodu: string, sifre: string): Promise<AuthYanit> {
  if (BACKEND_YOK) {
    return { token: 'offline-token', kullanici: offlineKullanici(kullaniciKodu) };
  }

  const yanit = await fetch(`${API_URL}/admin/auth/giris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullaniciKodu: kullaniciKodu.trim().toUpperCase(), sifre }),
  });

  const veri = await jsonYanitOku<{ mesaj?: string } & AuthYanit>(yanit);
  if (!yanit.ok) throw new Error(veri.mesaj ?? 'Giris basarisiz');
  return { ...veri, kullanici: kullaniciTercihleriEkle(veri.kullanici) };
}

export async function benGetir(): Promise<AuthKullanici> {
  const token = tokenAl();
  if (!token) throw new Error('Token yok');

  if (BACKEND_YOK) {
    return offlineKullanici();
  }

  const yanit = await fetch(`${API_URL}/admin/auth/ben`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const veri = await jsonYanitOku<{ mesaj?: string; kullanici: AuthKullanici }>(yanit);
  if (!yanit.ok) throw new Error(veri.mesaj ?? 'Oturum gecersiz');
  return kullaniciTercihleriEkle(veri.kullanici);
}

export async function profilGuncelle(form: ProfilGuncelleForm): Promise<AuthKullanici> {
  if (BACKEND_YOK) {
    return offlineKullanici();
  }

  const payload: Record<string, string> = {
    ad: form.ad.trim(),
  };
  if (form.email?.trim()) payload.email = form.email.trim();
  if (form.yeniSifre?.trim()) {
    payload.yeniSifre = form.yeniSifre.trim();
    payload.mevcutSifre = form.mevcutSifre?.trim() ?? '';
  }

  const yanit = await fetch(`${API_URL}/admin/auth/profil`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const veri = await jsonYanitOku<{ mesaj?: string; kullanici: AuthKullanici }>(yanit);
  if (!yanit.ok) throw new Error(veri.mesaj ?? 'Profil güncellenemedi');
  return veri.kullanici;
}

export async function tercihlerKaydet(tercihler: KullaniciTercihleri): Promise<AuthKullanici> {
  const mevcut = BACKEND_YOK ? offlineKullanici() : await benGetir().catch(() => offlineKullanici());
  hizliErisimKaydetLocal(mevcut.id, tercihler.dashboardHizliErisim ?? []);
  return kullaniciTercihleriEkle(mevcut);
}
