import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type RolKodu = string;

/** Tek veya virgüllü rol alanını diziye çevirir */
export function rollerAyristir(rol: string | readonly string[] | null | undefined): string[] {
  if (Array.isArray(rol)) {
    return [...new Set(rol.map((r) => String(r ?? '').trim()).filter(Boolean))];
  }
  const ham = String(rol ?? '').trim();
  if (!ham) return [];
  return [...new Set(ham.split(/[,;|]/).map((r) => r.trim()).filter(Boolean))];
}

export function rollerBirlestir(roller: readonly string[]): string {
  return rollerAyristir(roller).join(',');
}

export function anaRol(roller: readonly string[] | string | null | undefined): string {
  return rollerAyristir(roller)[0] ?? '';
}

export interface KullaniciOturumYetkisi {
  firmaId: string;
  donemId: string;
}

export interface AdminKullanici {
  id: string;
  kullaniciKodu: string;
  ad: string;
  /** Birincil / birleşik rol alanı (virgüllü çoklu destek) */
  rol: RolKodu;
  /** Ayrıştırılmış roller */
  roller: string[];
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
  /** Geriye uyum: birincil rol (= roller[0]) */
  rol: RolKodu;
  /** Çoklu rol ataması */
  roller: string[];
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
  roller: ['MUSTERI_ADMIN'],
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
  const roller = rollerAyristir(
    Array.isArray(ham.roller) ? (ham.roller as string[]) : String(ham.rol ?? '')
  );
  const rol = rollerBirlestir(roller);

  return {
    id: String(ham.id),
    kullaniciKodu: String(ham.kullaniciKodu ?? ham.email ?? '').trim().toUpperCase(),
    ad: String(ham.ad ?? ham.adSoyad ?? ''),
    rol,
    roller,
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
  const oturumYetkileri = Array.isArray(k.oturumYetkileri)
    ? k.oturumYetkileri
    : k.firmaId && k.donemId
      ? [{ firmaId: k.firmaId, donemId: k.donemId }]
      : [];
  const subeIds = Array.isArray(k.subeIds) ? k.subeIds : k.subeId ? [k.subeId] : [];
  const depoIds = Array.isArray(k.depoIds) ? k.depoIds : k.depoId ? [k.depoId] : [];
  const kasaIds = Array.isArray(k.kasaIds) ? k.kasaIds : k.kasaId ? [k.kasaId] : [];
  const roller = rollerAyristir(k.roller?.length ? k.roller : k.rol);
  return {
    kullaniciKodu: k.kullaniciKodu,
    ad: k.ad,
    sifre: '',
    rol: anaRol(roller),
    roller,
    aktif: k.aktif,
    firmaId: k.firmaId,
    donemId: k.donemId,
    subeId: k.subeId,
    depoId: k.depoId,
    kasaId: k.kasaId,
    subeIds: subeIds.length ? subeIds : k.subeId ? [k.subeId] : [],
    depoIds: depoIds.length ? depoIds : k.depoId ? [k.depoId] : [],
    kasaIds: kasaIds.length ? kasaIds : k.kasaId ? [k.kasaId] : [],
    oturumYetkileri: oturumYetkileri.length
      ? oturumYetkileri
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
  const liste = Array.isArray(veri.kullanicilar) ? veri.kullanicilar : [];
  return liste.map(kullaniciMap);
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

function idDizisi(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((x) => String(x ?? '').trim()).filter(Boolean))];
}

function yetkiDizisi(v: unknown): KullaniciOturumYetkisi[] {
  if (!Array.isArray(v)) {
    if (v && typeof v === 'object' && Array.isArray((v as { yetkiler?: unknown }).yetkiler)) {
      return yetkiDizisi((v as { yetkiler: unknown }).yetkiler);
    }
    return [];
  }
  return v
    .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
    .map((y) => ({
      firmaId: String(y.firmaId ?? ''),
      donemId: String(y.donemId ?? ''),
    }))
    .filter((y) => y.firmaId && y.donemId);
}

function payloadHazirla(form: KullaniciFormDegeri, sifreDahil: boolean) {
  const subeIds = idDizisi(form.subeIds).length
    ? idDizisi(form.subeIds)
    : form.subeId
      ? [form.subeId]
      : [];
  const depoIds = idDizisi(form.depoIds).length
    ? idDizisi(form.depoIds)
    : form.depoId
      ? [form.depoId]
      : [];
  const kasaIds = idDizisi(form.kasaIds).length
    ? idDizisi(form.kasaIds)
    : form.kasaId
      ? [form.kasaId]
      : [];
  const oturumYetkileri = yetkiDizisi(form.oturumYetkileri);
  const roller = rollerAyristir(form.roller?.length ? form.roller : form.rol);
  const payload: Record<string, unknown> = {
    kullaniciKodu: form.kullaniciKodu.trim().toUpperCase(),
    ad: form.ad.trim(),
    rol: rollerBirlestir(roller),
    roller,
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
      yetkiler: oturumYetkileri.map((y) => ({
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
