import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type RolKodu = string;

export interface KullaniciOturumYetkisi {
  firmaId: string;
  donemId: string;
}

export interface AdminKullanici {
  id: string;
  kullaniciKodu: string;
  ad: string;
  rol: RolKodu;
  aktif: boolean;
  firmaId: string;
  donemId: string;
  subeId: string;
  depoId: string;
  kasaId: string;
  oturumYetkileri: KullaniciOturumYetkisi[];
  pin: string;
  olusturma: string;
  guncelleme: string;
}

export interface KullaniciFormDegeri {
  kullaniciKodu: string;
  ad: string;
  sifre: string;
  rol: RolKodu;
  aktif: boolean;
  firmaId: string;
  donemId: string;
  subeId: string;
  depoId: string;
  kasaId: string;
  oturumYetkileri: KullaniciOturumYetkisi[];
  pin: string;
}

export const bosKullaniciForm: KullaniciFormDegeri = {
  kullaniciKodu: '',
  ad: '',
  sifre: '',
  rol: 'MUSTERI_ADMIN',
  aktif: true,
  firmaId: '',
  donemId: '',
  subeId: '',
  depoId: '',
  kasaId: '',
  oturumYetkileri: [],
  pin: '',
};

function alanStr(ham: Record<string, unknown>, ...anahtarlar: string[]): string {
  for (const a of anahtarlar) {
    const v = ham[a];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return '';
}

function kullaniciMap(ham: Record<string, unknown>): AdminKullanici {
  const hamYetkiler = Array.isArray(ham.oturumYetkileri) ? ham.oturumYetkileri : [];
  const oturumYetkileri = hamYetkiler
    .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
    .map((y) => ({
      firmaId: String(y.firmaId ?? ''),
      donemId: String(y.donemId ?? ''),
    }))
    .filter((y) => y.firmaId && y.donemId);

  return {
    id: String(ham.id),
    kullaniciKodu: String(ham.kullaniciKodu ?? ham.email ?? '').trim().toUpperCase(),
    ad: String(ham.ad ?? ham.adSoyad ?? ''),
    rol: String(ham.rol),
    aktif: ham.aktif !== false && ham.durum !== false,
    firmaId: alanStr(ham, 'firmaId'),
    donemId: alanStr(ham, 'donemId'),
    subeId: alanStr(ham, 'subeId'),
    depoId: alanStr(ham, 'depoId'),
    kasaId: alanStr(ham, 'kasaId'),
    oturumYetkileri,
    pin: String(ham.pin ?? ''),
    olusturma: String(ham.olusturma ?? ham.kayitTarihi ?? ''),
    guncelleme: String(ham.guncelleme ?? ham.guncellemeTarihi ?? ''),
  };
}

export function kullanicidanForm(k: AdminKullanici): KullaniciFormDegeri {
  return {
    kullaniciKodu: k.kullaniciKodu,
    ad: k.ad,
    sifre: '',
    rol: k.rol,
    aktif: k.aktif,
    firmaId: k.firmaId,
    donemId: k.donemId,
    subeId: k.subeId,
    depoId: k.depoId,
    kasaId: k.kasaId,
    oturumYetkileri: k.oturumYetkileri.length
      ? k.oturumYetkileri
      : k.firmaId && k.donemId
        ? [{ firmaId: k.firmaId, donemId: k.donemId }]
        : [],
    pin: k.pin,
  };
}

export async function adminKullanicilariGetir(): Promise<AdminKullanici[]> {
  const veri = await adminJsonFetch<{ kullanicilar: Record<string, unknown>[] }>('/kullanicilar', {
    headers: adminHeaders(),
  });
  return (veri.kullanicilar ?? []).map(kullaniciMap);
}

export async function adminKullaniciOlustur(form: KullaniciFormDegeri): Promise<AdminKullanici> {
  const veri = await adminJsonFetch<{ kullanici: Record<string, unknown> }>('/kullanicilar', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payloadHazirla(form, true)),
  });
  return kullaniciMap(veri.kullanici);
}

export async function adminKullaniciGuncelle(
  id: string,
  form: KullaniciFormDegeri,
  sifreDegisti: boolean
): Promise<AdminKullanici> {
  const veri = await adminJsonFetch<{ kullanici: Record<string, unknown> }>(`/kullanicilar/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payloadHazirla(form, sifreDegisti)),
  });
  return kullaniciMap(veri.kullanici);
}

export async function adminKullaniciSil(id: string): Promise<void> {
  await adminJsonFetch(`/kullanicilar/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

export const VARSAYILAN_ROL_ETIKETLERI: Record<string, string> = {
  YONETICI: 'Yönetici',
  SUPER_ADMIN: 'Super Admin',
  AJANS_ADMIN: 'Ajans Admin',
  MUSTERI_ADMIN: 'Müşteri Admin',
  EDITOR: 'Editör',
  SEO_EDITOR: 'SEO Editörü',
  GORUNTULEME: 'Sadece Görüntüleme',
};

export function rolEtiketi(kod: string, etiketler: Record<string, string> = VARSAYILAN_ROL_ETIKETLERI): string {
  return etiketler[kod] ?? kod.replace(/_/g, ' ');
}

function payloadHazirla(form: KullaniciFormDegeri, sifreDahil: boolean) {
  const payload: Record<string, unknown> = {
    kullaniciKodu: form.kullaniciKodu.trim().toUpperCase(),
    ad: form.ad.trim(),
    rol: form.rol,
    aktif: form.aktif,
    firmaId: form.firmaId ? Number(form.firmaId) : undefined,
    donemId: form.donemId ? Number(form.donemId) : null,
    subeId: form.subeId ? Number(form.subeId) : null,
    depoId: form.depoId ? Number(form.depoId) : null,
    kasaId: form.kasaId ? Number(form.kasaId) : null,
    oturumYetkileri: form.oturumYetkileri.map((y) => ({
      firmaId: Number(y.firmaId),
      donemId: Number(y.donemId),
    })),
    pin: form.pin.trim() || null,
  };
  if (sifreDahil && form.sifre.trim()) {
    payload.sifre = form.sifre;
  }
  return payload;
}
