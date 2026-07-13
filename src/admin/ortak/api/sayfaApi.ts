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

export async function adminSayfalariGetir(): Promise<AdminSayfa[]> {
  try {
    const veri = await adminJsonFetch<{ sayfalar?: AdminSayfa[] }>('/sayfalar', { headers: adminHeaders() });
    return sayfaHiyerarsisiTamamla((veri.sayfalar ?? []).map(normalizeSayfa));
  } catch {
    return [];
  }
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
