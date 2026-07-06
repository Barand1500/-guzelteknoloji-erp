import { idString } from '@/araclar/idKarsilastir';

function ustSlugYolu(slug: string): string | null {
  const parcalar = slug.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parcalar.length < 2) return null;
  return parcalar.slice(0, -1).join('/');
}

export function sayfaHiyerarsisiTamamla<T extends { id: string | number; slug: string; ustSayfaId?: string | number | null }>(
  sayfalar: T[]
): T[] {
  const slugIndeks = new Map(
    sayfalar.map((s) => [s.slug.replace(/^\/+|\/+$/g, ''), s] as const)
  );

  return sayfalar.map((sayfa) => {
    if (sayfa.ustSayfaId) return sayfa;
    const ustSlug = ustSlugYolu(sayfa.slug);
    if (!ustSlug) return sayfa;
    const ust = slugIndeks.get(ustSlug);
    if (!ust || ust.id === sayfa.id) return sayfa;
    return { ...sayfa, ustSayfaId: idString(ust.id) };
  });
}
