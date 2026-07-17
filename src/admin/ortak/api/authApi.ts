import type {
  AuthKullanici,
  AuthYanit,
  GirisFormu,
  KullaniciTercihleri,
  OturumSecenekleriYanit,
} from '@/admin/ortak/tipler/admin';
import { jsonYanitOku } from '@/araclar/jsonFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';
import {
  offlineGirisDogrula,
  offlineKullanicilariOku,
  offlineOturumKaydet,
  offlineOturumOku,
  offlineOturumTemizle,
  type OfflineKullaniciKayit,
} from '@/admin/ortak/api/offlineKullaniciDepo';
import { offlinePanelDeposuTemizle } from '@/admin/ortak/api/offlinePanelDepo';
import { offlineTanimlarGetir } from '@/admin/ortak/api/offlineTanimlar';

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const TOKEN_KEY = 'gt_admin_token';
const HIZLI_ERISIM_KEY = 'gt_admin_hizli_erisim';
const AUTH_OFFLINE_KEY = 'gt_auth_offline';

/** Uretimde (VITE_BACKEND_YOK=false) offline fallback kapali — karisik oturum onlenir. */
function offlineFallbackAktif(): boolean {
  return BACKEND_YOK || !import.meta.env.PROD;
}

export function authOfflineMi(): boolean {
  if (BACKEND_YOK) return true;
  if (import.meta.env.PROD) return false;
  try {
    return sessionStorage.getItem(AUTH_OFFLINE_KEY) === '1';
  } catch {
    return false;
  }
}

export function authOfflineTemizle() {
  try {
    sessionStorage.removeItem(AUTH_OFFLINE_KEY);
  } catch {
    /* storage yok */
  }
}

function authOfflineAyarla() {
  if (!offlineFallbackAktif()) return;
  try {
    sessionStorage.setItem(AUTH_OFFLINE_KEY, '1');
  } catch {
    /* storage yok */
  }
}

function authApiKullanilamazMi(hata: unknown): boolean {
  if (hata instanceof TypeError) return true;
  if (hata instanceof Error && /fetch|network|failed/i.test(hata.message)) return true;
  return false;
}

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

function offlineOturumSecenekleriOlustur(kullaniciKodu?: string): OturumSecenekleriYanit {
  const kullanicilar = offlineKullanicilariOku().filter((k) => k.aktif);
  const kod = kullaniciKodu?.trim().toUpperCase();
  const kullanici =
    kullanicilar.find((k) => k.kullaniciKodu === kod) ?? kullanicilar[0];
  if (!kullanici) {
    return { firmalar: [], kullaniciKodlari: [] };
  }

  const firmaKaynak = offlineTanimlarGetir('/tanimlar/firmalar') as {
    firmalar?: Array<{ id: string; firmaKodu: string; firmaAdi: string; aktif: boolean }>;
  };
  const donemKaynak = offlineTanimlarGetir('/tanimlar/donemler') as {
    donemler?: Array<{
      id: string;
      firmaId: string;
      donemKodu: string;
      donemAdi: string;
      aktif: boolean;
    }>;
  };
  const subeKaynak = offlineTanimlarGetir('/tanimlar/subeler') as {
    subeler?: Array<{
      id: string;
      firmaId: string;
      subeKodu: string;
      subeAdi: string;
      aktif: boolean;
    }>;
  };
  const kasaKaynak = offlineTanimlarGetir('/tanimlar/kasalar') as {
    kasalar?: Array<{
      id: string;
      subeId: string;
      kasaKodu: string;
      kasaAdi: string;
      aktif: boolean;
    }>;
  };

  const yetkiler = kullanici.oturumYetkileri.length
    ? kullanici.oturumYetkileri
    : kullanici.firmaId && kullanici.donemId
      ? [{ firmaId: kullanici.firmaId, donemId: kullanici.donemId }]
      : [];
  const firmaIdleri = new Set(yetkiler.map((y) => y.firmaId));
  const donemIdleri = new Set(yetkiler.map((y) => y.donemId));
  const subeler = subeKaynak.subeler ?? [];
  const kasalar = kasaKaynak.kasalar ?? [];
  const firmalar = (firmaKaynak.firmalar ?? [])
    .filter((f) => f.aktif && firmaIdleri.has(f.id))
    .map((firma) => ({
      id: Number(firma.id),
      firmaKodu: firma.firmaKodu,
      firmaAdi: firma.firmaAdi,
      donemler: (donemKaynak.donemler ?? [])
        .filter((d) => d.aktif && d.firmaId === firma.id && donemIdleri.has(d.id))
        .map((d) => ({
          id: Number(d.id),
          donemKodu: d.donemKodu,
          donemAdi: d.donemAdi,
        })),
      subeler: subeler
        .filter((s) => s.aktif && s.firmaId === firma.id)
        .map((s) => ({
          id: Number(s.id),
          subeKodu: s.subeKodu,
          subeAdi: s.subeAdi,
          kasalar: kasalar
            .filter((k) => k.aktif && k.subeId === s.id)
            .map((k) => ({
              id: Number(k.id),
              kasaKodu: k.kasaKodu,
              kasaAdi: k.kasaAdi,
            })),
        })),
    }));

  const varsayilanFirma =
    firmalar.find((f) => String(f.id) === kullanici.firmaId) ?? firmalar[0];
  const varsayilanDonem =
    varsayilanFirma?.donemler.find((d) => String(d.id) === kullanici.donemId) ??
    varsayilanFirma?.donemler[0];
  const varsayilanSube =
    varsayilanFirma?.subeler.find((s) => String(s.id) === kullanici.subeId) ??
    varsayilanFirma?.subeler[0];
  const varsayilanKasa =
    varsayilanSube?.kasalar.find((k) => String(k.id) === kullanici.kasaId) ??
    varsayilanSube?.kasalar[0];

  return {
    firmalar,
    kullaniciKodlari: kullanicilar.map((k) => k.kullaniciKodu).sort(),
    seciliKullaniciKodu: kullanici.kullaniciKodu,
    varsayilan: {
      firmaKodu: varsayilanFirma?.firmaKodu ?? '',
      donemKodu: varsayilanDonem?.donemKodu ?? '',
      subeKodu: varsayilanSube?.subeKodu ?? '',
      kasaKodu: varsayilanKasa?.kasaKodu ?? '',
    },
  };
}

function offlineAuthKullaniciOlustur(kayit: OfflineKullaniciKayit): AuthKullanici {
  return {
    id: kayit.id,
    kullaniciKodu: kayit.kullaniciKodu,
    ad: kayit.ad,
    rol: kayit.rol,
    tercihler: { dashboardHizliErisim: hizliErisimOku(kayit.id) },
    yetkiler: [],
    oturum: OFFLINE_KULLANICI.oturum,
  };
}

const OFFLINE_KULLANICI: AuthKullanici = {
  id: '1',
  kullaniciKodu: 'ADMIN',
  ad: 'ERCAN GUZEL',
  rol: 'YONETICI',
  tercihler: { dashboardHizliErisim: [] },
  yetkiler: [],
  oturum: {
    firmaKodu: 'F001',
    firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
    donemKodu: 'D001',
    donemAdi: '2026',
    subeKodu: 'MERKEZ',
    subeAdi: 'MERKEZ',
    kasaKodu: 'MERKEZ',
    kasaAdi: 'MERKEZ',
  },
};

export interface ProfilGuncelleForm {
  ad: string;
  email?: string;
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
  const kod = kullaniciKodu?.trim().toUpperCase();
  const kayit = kod
    ? offlineKullanicilariOku().find((k) => k.kullaniciKodu === kod)
    : offlineKullanicilariOku()[0];
  if (kayit) return offlineAuthKullaniciOlustur(kayit);
  return {
    ...OFFLINE_KULLANICI,
    kullaniciKodu: kod || OFFLINE_KULLANICI.kullaniciKodu,
  };
}

export async function oturumSecenekleriGetir(kullaniciKodu?: string): Promise<OturumSecenekleriYanit> {
  const kod = kullaniciKodu?.trim().toUpperCase();
  if (authOfflineMi()) {
    return offlineOturumSecenekleriOlustur(kod);
  }

  try {
    const sorgu = kod ? `?kullaniciKodu=${encodeURIComponent(kod)}` : '';
    const yanit = await fetch(`${API_URL}/admin/auth/oturum-secenekleri${sorgu}`);
    if (yanit.status === 404) {
      authOfflineAyarla();
      return offlineOturumSecenekleriOlustur(kod);
    }
    const veri = await jsonYanitOku<{ mesaj?: string } & OturumSecenekleriYanit>(yanit);
    if (!yanit.ok) throw new Error(veri.mesaj ?? 'Oturum secenekleri alinamadi');
    return veri;
  } catch (err) {
    if (authApiKullanilamazMi(err)) {
      authOfflineAyarla();
      return offlineOturumSecenekleriOlustur(kod);
    }
    throw err;
  }
}

export async function girisYap(form: GirisFormu): Promise<AuthYanit> {
  if (authOfflineMi()) {
    const kayit = offlineGirisDogrula(form.kullaniciKodu, form.sifre);
    if (!kayit) throw new Error('Geçersiz kullanıcı veya şifre');
    offlineOturumKaydet(kayit.kullaniciKodu);
    return { token: 'offline-token', kullanici: offlineAuthKullaniciOlustur(kayit) };
  }

  try {
    const yanit = await fetch(`${API_URL}/admin/auth/giris`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kullaniciKodu: form.kullaniciKodu.trim().toUpperCase(),
        sifre: form.sifre,
        firmaKodu: form.firmaKodu.trim().toUpperCase(),
        donemKodu: form.donemKodu.trim().toUpperCase(),
        subeKodu: form.subeKodu.trim().toUpperCase(),
        kasaKodu: form.kasaKodu.trim().toUpperCase(),
      }),
    });

    if (yanit.status === 404) {
      authOfflineAyarla();
      const kayit = offlineGirisDogrula(form.kullaniciKodu, form.sifre);
      if (!kayit) throw new Error('Geçersiz kullanıcı veya şifre');
      offlineOturumKaydet(kayit.kullaniciKodu);
      return { token: 'offline-token', kullanici: offlineAuthKullaniciOlustur(kayit) };
    }

    const veri = await jsonYanitOku<{ mesaj?: string } & AuthYanit>(yanit);
    if (!yanit.ok) throw new Error(veri.mesaj ?? 'Giris basarisiz');
    authOfflineTemizle();
    offlinePanelDeposuTemizle();
    return { ...veri, kullanici: kullaniciTercihleriEkle(veri.kullanici) };
  } catch (err) {
    if (authApiKullanilamazMi(err)) {
      authOfflineAyarla();
      const kayit = offlineGirisDogrula(form.kullaniciKodu, form.sifre);
      if (!kayit) throw new Error('Geçersiz kullanıcı veya şifre');
      offlineOturumKaydet(kayit.kullaniciKodu);
      return { token: 'offline-token', kullanici: offlineAuthKullaniciOlustur(kayit) };
    }
    throw err;
  }
}

export async function benGetir(): Promise<AuthKullanici> {
  const token = tokenAl();
  if (!token) throw new Error('Token yok');

  if (authOfflineMi()) {
    const kod = offlineOturumOku();
    if (!kod) throw new Error('Oturum yok');
    const kayit = offlineKullanicilariOku().find((k) => k.kullaniciKodu === kod);
    if (!kayit || !kayit.aktif) {
      offlineOturumTemizle();
      throw new Error('Oturum geçersiz');
    }
    return offlineAuthKullaniciOlustur(kayit);
  }

  try {
    const yanit = await fetch(`${API_URL}/admin/auth/ben`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (yanit.status === 404) {
      authOfflineAyarla();
      const kod = offlineOturumOku();
      if (!kod) throw new Error('Oturum yok');
      const kayit = offlineKullanicilariOku().find((k) => k.kullaniciKodu === kod);
      if (!kayit) throw new Error('Oturum geçersiz');
      return offlineAuthKullaniciOlustur(kayit);
    }

    const veri = await jsonYanitOku<{ mesaj?: string; kullanici: AuthKullanici }>(yanit);
    if (!yanit.ok) throw new Error(veri.mesaj ?? 'Oturum gecersiz');
    return kullaniciTercihleriEkle(veri.kullanici);
  } catch (err) {
    if (authApiKullanilamazMi(err)) {
      authOfflineAyarla();
      const kod = offlineOturumOku();
      if (!kod) throw new Error('Oturum yok');
      const kayit = offlineKullanicilariOku().find((k) => k.kullaniciKodu === kod);
      if (!kayit) throw new Error('Oturum geçersiz');
      return offlineAuthKullaniciOlustur(kayit);
    }
    throw err;
  }
}

export async function profilGuncelle(form: ProfilGuncelleForm): Promise<AuthKullanici> {
  if (authOfflineMi()) {
    return offlineKullanici();
  }

  const payload: Record<string, string> = {
    ad: form.ad.trim(),
  };
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
  const mevcut = authOfflineMi() ? offlineKullanici() : await benGetir().catch(() => offlineKullanici());
  hizliErisimKaydetLocal(mevcut.id, tercihler.dashboardHizliErisim ?? []);
  return kullaniciTercihleriEkle(mevcut);
}
