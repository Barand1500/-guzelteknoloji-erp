import type { AdminTema } from '@/baglamlar/AdminTemaContext';

export interface KenarlikRenkAyari {
  renk: string;
  neon: boolean;
}

export const KENARLIK_RENK_ONAYLI = ['mavi', 'turuncu'] as const;

export const KENARLIK_RENK_SECENEKLERI = [
  { id: 'mavi', ad: 'Mavi', renk: '#3b82f6' },
  { id: 'turuncu', ad: 'Turuncu', renk: '#FF6000' },
] as const;

const STORAGE_KEY = 'erp-kenarlik-ayar';

const VARSAYILAN_MAVI: Record<AdminTema, string> = {
  koyu: '#3b82f6',
  acik: '#2563eb',
};

const TURUNCU = '#FF6000';

export function hexRenkGecerli(deger: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(deger.trim());
}

export function kenarlikRenkCoz(deger: string | undefined, tema: AdminTema): string {
  if (deger === 'mavi') return VARSAYILAN_MAVI[tema];
  if (deger === 'turuncu' || !deger) return TURUNCU;
  if (hexRenkGecerli(deger)) return deger.trim();
  return TURUNCU;
}

export function kenarlikAyariNormalize(
  girdi?: Partial<KenarlikRenkAyari> | string,
  neonLegacy?: unknown
): KenarlikRenkAyari {
  const kaynak =
    typeof girdi === 'string' ? { renk: girdi, neon: neonLegacy === true } : (girdi ?? {});

  const hamRenk = typeof kaynak.renk === 'string' ? kaynak.renk.trim() : 'turuncu';
  const cozulmusRenk =
    hamRenk === 'turuncu' || hamRenk === 'mavi' || hexRenkGecerli(hamRenk) ? hamRenk : 'turuncu';

  return {
    renk: cozulmusRenk,
    neon: kaynak.neon === true,
  };
}

export function kenarlikAyariOku(): KenarlikRenkAyari {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return kenarlikAyariNormalize({});
    const parsed = JSON.parse(ham) as Partial<KenarlikRenkAyari>;
    return kenarlikAyariNormalize(parsed);
  } catch {
    return kenarlikAyariNormalize({});
  }
}

export function kenarlikAyariKaydet(ayar: KenarlikRenkAyari) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kenarlikAyariNormalize(ayar)));
}

export function kenarlikRenkCssDegiskeni(
  ayar: KenarlikRenkAyari,
  tema: AdminTema
): Record<string, string> {
  const normalize = kenarlikAyariNormalize(ayar);
  const hex = kenarlikRenkCoz(normalize.renk, tema);

  if (!normalize.neon) {
    return {
      '--ap-accent': hex,
      '--ap-accent-glow': 'none',
      '--ap-accent-neon-filter': 'none',
    };
  }

  return {
    '--ap-accent': hex,
    '--ap-accent-glow': [
      `0 0 2px color-mix(in srgb, ${hex} 55%, transparent)`,
      `0 0 6px color-mix(in srgb, ${hex} 35%, transparent)`,
      `0 0 14px color-mix(in srgb, ${hex} 18%, transparent)`,
    ].join(', '),
    '--ap-accent-neon-filter': [
      `drop-shadow(0 0 1px color-mix(in srgb, ${hex} 70%, transparent))`,
      `drop-shadow(0 0 4px color-mix(in srgb, ${hex} 40%, transparent))`,
    ].join(' '),
  };
}

export function kenarlikRenkYayinla(ayar: KenarlikRenkAyari | Partial<KenarlikRenkAyari>) {
  const normalize = kenarlikAyariNormalize(ayar);
  kenarlikAyariKaydet(normalize);
  window.dispatchEvent(new CustomEvent('ap-kenarlik-renk-guncellendi', { detail: normalize }));
}
