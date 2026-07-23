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
  subeIds: string[];
  depoIds: string[];
  kasaIds: string[];
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
  subeIds: string[];
  depoIds: string[];
  kasaIds: string[];
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
  subeIds: [],
  depoIds: [],
  kasaIds: [],
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

function idListesiAl(ham: unknown): string[] {
  if (!Array.isArray(ham)) return [];
  return [...new Set(ham.map((v) => String(v ?? '').trim()).filter(Boolean))];
}

function oturumPaketiniOku(ham: Record<string, unknown>): {
  oturumYetkileri: KullaniciOturumYetkisi[];
  subeIds: string[];
  depoIds: string[];
  kasaIds: string[];
} {
  const paket = ham.oturumYetkileri;
  if (paket && typeof paket === 'object' && !Array.isArray(paket)) {
    const o = paket as Record<string, unknown>;
    const hamYetkiler = Array.isArray(o.yetkiler) ? o.yetkiler : [];
    return {
      oturumYetkileri: hamYetkiler
        .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
        .map((y) => ({
          firmaId: String(y.firmaId ?? ''),
          donemId: String(y.donemId ?? ''),
        }))
        .filter((y) => y.firmaId && y.donemId),
      subeIds: idListesiAl(o.subeIds),
      depoIds: idListesiAl(o.depoIds),
      kasaIds: idListesiAl(o.kasaIds),
    };
  }

  const hamYetkiler = Array.isArray(paket) ? paket : [];
  const oturumYetkileri = hamYetkiler
    .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
    .map((y) => ({
      firmaId: String(y.firmaId ?? ''),
      donemId: String(y.donemId ?? ''),
    }))
    .filter((y) => y.firmaId && y.donemId);

  const subeId = alanStr(ham, 'subeId');
  const depoId = alanStr(ham, 'depoId');
  const kasaId = alanStr(ham, 'kasaId');
  return {
    oturumYetkileri,
    subeIds: idListesiAl(ham.subeIds).length ? idListesiAl(ham.subeIds) : subeId ? [subeId] : [],
    depoIds: idListesiAl(ham.depoIds).length ? idListesiAl(ham.depoIds) : depoId ? [depoId] : [],
    kasaIds: idListesiAl(ham.kasaIds).length ? idListesiAl(ham.kasaIds) : kasaId ? [kasaId] : [],
  };
}

function kullaniciMap(ham: Record<string, unknown>): AdminKullanici {
  const paket = oturumPaketiniOku(ham);
  const subeId = alanStr(ham, 'subeId') || paket.subeIds[0] || '';
  const depoId = alanStr(ham, 'depoId') || paket.depoIds[0] || '';
  const kasaId = alanStr(ham, 'kasaId') || paket.kasaIds[0] || '';

  return {
    id: String(ham.id),
    kullaniciKodu: String(ham.kullaniciKodu ?? ham.email ?? '').trim().toUpperCase(),
    ad: String(ham.ad ?? ham.adSoyad ?? ''),
    rol: String(ham.rol),
    aktif: ham.aktif !== false && ham.durum !== false,
    firmaId: alanStr(ham, 'firmaId'),
    donemId: alanStr(ham, 'donemId'),
    subeId,
    depoId,
    kasaId,
    subeIds: paket.subeIds.length ? paket.subeIds : subeId ? [subeId] : [],
    depoIds: paket.depoIds.length ? paket.depoIds : depoId ? [depoId] : [],
    kasaIds: paket.kasaIds.length ? paket.kasaIds : kasaId ? [kasaId] : [],
    oturumYetkileri: paket.oturumYetkileri,
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
    subeIds: k.subeIds.length ? k.subeIds : k.subeId ? [k.subeId] : [],
    depoIds: k.depoIds.length ? k.depoIds : k.depoId ? [k.depoId] : [],
    kasaIds: k.kasaIds.length ? k.kasaIds : k.kasaId ? [k.kasaId] : [],
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
  const subeIds = form.subeIds.length ? form.subeIds : form.subeId ? [form.subeId] : [];
  const depoIds = form.depoIds.length ? form.depoIds : form.depoId ? [form.depoId] : [];
  const kasaIds = form.kasaIds.length ? form.kasaIds : form.kasaId ? [form.kasaId] : [];
  const payload: Record<string, unknown> = {
    kullaniciKodu: form.kullaniciKodu.trim().toUpperCase(),
    ad: form.ad.trim(),
    rol: form.rol,
    aktif: form.aktif,
    firmaId: form.firmaId ? Number(form.firmaId) : undefined,
    donemId: form.donemId ? Number(form.donemId) : null,
    subeId: (form.subeId || subeIds[0]) ? Number(form.subeId || subeIds[0]) : null,
    depoId: (form.depoId || depoIds[0]) ? Number(form.depoId || depoIds[0]) : null,
    kasaId: (form.kasaId || kasaIds[0]) ? Number(form.kasaId || kasaIds[0]) : null,
    subeIds: subeIds.map(Number).filter(Number.isFinite),
    depoIds: depoIds.map(Number).filter(Number.isFinite),
    kasaIds: kasaIds.map(Number).filter(Number.isFinite),
    oturumYetkileri: {
      yetkiler: form.oturumYetkileri.map((y) => ({
        firmaId: Number(y.firmaId),
        donemId: Number(y.donemId),
      })),
      subeIds: subeIds.map(Number).filter(Number.isFinite),
      depoIds: depoIds.map(Number).filter(Number.isFinite),
      kasaIds: kasaIds.map(Number).filter(Number.isFinite),
    },
    pin: form.pin.trim() || null,
  };
  if (sifreDahil && form.sifre.trim()) {
    payload.sifre = form.sifre;
  }
  return payload;
}
