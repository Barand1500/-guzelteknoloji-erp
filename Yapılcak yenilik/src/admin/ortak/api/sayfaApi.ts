import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { idString } from '@/araclar/idKarsilastir';
import { sayfaHiyerarsisiTamamla } from '@/araclar/sayfaAgaci';

export type SayfaAcilisModu = 'normal' | 'yeni_sekme' | 'modal';
export type AltMenuGorunum = 'dikey' | 'yatay';
export type AltMenuTetikleyici = 'hover' | 'tikla';

export interface AdminSayfa {
  id: string;
  baslik: string;
  slug: string;
  icerik: string;
  kapakGorsel?: string | null;
  ikon?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  yayinda: boolean;
  menudeGoster: boolean;
  sira: number;
  acilisModu: SayfaAcilisModu;
  ustSayfaId?: string | null;
  altMenuGorunum?: AltMenuGorunum;
  altMenuTetikleyici?: AltMenuTetikleyici;
}

export interface SayfaFormDegeri {
  baslik: string;
  slug: string;
  icerik: string;
  ikon: string;
  seoTitle: string;
  seoDesc: string;
  yayinda: boolean;
  menudeGoster: boolean;
  sira: number;
  acilisModu: SayfaAcilisModu;
  ustSayfaId: string | null;
  altMenuGorunum: AltMenuGorunum;
  altMenuTetikleyici: AltMenuTetikleyici;
}

export async function adminSayfalariGetir(): Promise<AdminSayfa[]> {
  try {
    const veri = await adminJsonFetch<{ sayfalar?: AdminSayfa[] }>('/sayfalar', { headers: adminHeaders() });
    return sayfaHiyerarsisiTamamla((veri.sayfalar ?? []).map(normalizeSayfa));
  } catch {
    return [];
  }
}

export async function adminSayfaOlustur(form: SayfaFormDegeri): Promise<AdminSayfa> {
  const veri = await adminJsonFetch<{ sayfa: AdminSayfa }>('/sayfalar', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payloadHazirla(form)),
  });
  return normalizeSayfa(veri.sayfa);
}

export async function adminSayfaGuncelle(id: string, form: SayfaFormDegeri): Promise<AdminSayfa> {
  const veri = await adminJsonFetch<{ sayfa: AdminSayfa }>(`/sayfalar/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payloadHazirla(form)),
  });
  return normalizeSayfa(veri.sayfa);
}

export async function adminSayfaSil(id: string): Promise<void> {
  await adminJsonFetch(`/sayfalar/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

function sayfaFormuOlustur(s: AdminSayfa): SayfaFormDegeri {
  return {
    baslik: s.baslik,
    slug: s.slug,
    icerik: s.icerik,
    ikon: s.ikon ?? '',
    seoTitle: s.seoTitle ?? '',
    seoDesc: s.seoDesc ?? '',
    yayinda: s.yayinda,
    menudeGoster: s.menudeGoster,
    sira: s.sira,
    acilisModu: s.acilisModu ?? 'normal',
    ustSayfaId: s.ustSayfaId ?? null,
    altMenuGorunum: s.altMenuGorunum ?? 'dikey',
    altMenuTetikleyici: s.altMenuTetikleyici ?? 'hover',
  };
}

export async function adminSayfaSirala(
  id: string,
  yon: 'yukari' | 'asagi',
  sayfalar: AdminSayfa[]
): Promise<AdminSayfa[]> {
  const duzeltildi = sayfaHiyerarsisiTamamla(sayfalar);
  const mevcut = duzeltildi.find((s) => s.id === id);
  if (!mevcut) throw new Error('Sayfa bulunamadi');

  const kardesler = duzeltildi
    .filter((s) => (s.ustSayfaId ?? null) === (mevcut.ustSayfaId ?? null))
    .sort((a, b) => a.sira - b.sira || a.baslik.localeCompare(b.baslik, 'tr'));

  const idx = kardesler.findIndex((s) => s.id === id);
  const hedefIdx = yon === 'yukari' ? idx - 1 : idx + 1;
  if (idx < 0 || hedefIdx < 0 || hedefIdx >= kardesler.length) {
    return duzeltildi.map(normalizeSayfa);
  }

  const yeni = [...kardesler];
  [yeni[idx], yeni[hedefIdx]] = [yeni[hedefIdx], yeni[idx]];

  for (let i = 0; i < yeni.length; i++) {
    if (yeni[i].sira === i) continue;
    const form = sayfaFormuOlustur(yeni[i]);
    form.sira = i;
    await adminSayfaGuncelle(yeni[i].id, form);
    yeni[i] = { ...yeni[i], sira: i };
  }

  return adminSayfalariGetir();
}

export async function adminMenuGuncelle(ogeler: { id: string; sira: number; menudeGoster: boolean }[]): Promise<AdminSayfa[]> {
  const veri = await adminJsonFetch<{ sayfalar: AdminSayfa[] }>('/menu', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ ogeler }),
  });
  return veri.sayfalar.map(normalizeSayfa);
}

function normalizeSayfa(sayfa: AdminSayfa): AdminSayfa {
  return {
    ...sayfa,
    id: idString(sayfa.id),
    acilisModu: sayfa.acilisModu ?? 'normal',
    ustSayfaId: sayfa.ustSayfaId != null ? idString(sayfa.ustSayfaId) : null,
    altMenuGorunum: sayfa.altMenuGorunum ?? 'dikey',
    altMenuTetikleyici: sayfa.altMenuTetikleyici ?? 'hover',
  };
}

function payloadHazirla(form: SayfaFormDegeri) {
  return {
    baslik: form.baslik.trim(),
    slug: form.slug.trim() || undefined,
    icerik: form.icerik,
    ikon: form.ikon.trim() || null,
    seoTitle: form.seoTitle.trim() || null,
    seoDesc: form.seoDesc.trim() || null,
    yayinda: form.yayinda,
    menudeGoster: form.menudeGoster,
    sira: form.sira,
    acilisModu: form.acilisModu,
    ustSayfaId: form.ustSayfaId ? Number(form.ustSayfaId) : null,
    altMenuGorunum: form.altMenuGorunum,
    altMenuTetikleyici: form.altMenuTetikleyici,
  };
}
