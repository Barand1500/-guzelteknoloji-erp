import { useMemo } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import { modulIdDenPrefix } from '@/admin/veri/adminMenuYapisi';

const VARSAYILAN_ROL_YETKILERI: Record<string, YetkiKodu[]> = {
  YONETICI: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  SUPER_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  AJANS_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  MUSTERI_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme'],
  EDITOR: ['goruntuleme', 'ekleme', 'duzenleme'],
  SEO_EDITOR: ['goruntuleme', 'duzenleme'],
  GORUNTULEME: ['goruntuleme'],
};

/** Matriste yanlislikla bos birakilmis sistem yonetici rolleri kilitlemesin */
const BOS_YETKI_VARSAYILAN_ROLLER = new Set(['YONETICI', 'SUPER_ADMIN', 'AJANS_ADMIN']);

export function cozumleKullaniciYetkileri(rol: string, yetkiler?: YetkiKodu[]): YetkiKodu[] {
  const varsayilan = VARSAYILAN_ROL_YETKILERI[rol] ?? ['goruntuleme'];

  if (yetkiler === undefined) {
    return varsayilan;
  }

  const birlesik = new Set<YetkiKodu>(yetkiler);
  if (BOS_YETKI_VARSAYILAN_ROLLER.has(rol)) {
    for (const y of varsayilan) birlesik.add(y);
  }

  if (birlesik.size === 0) {
    return BOS_YETKI_VARSAYILAN_ROLLER.has(rol) ? varsayilan : [];
  }
  return [...birlesik];
}

function modulYetkileriniCoz(
  rol: string,
  modulPrefix: string | undefined,
  yetkiler?: YetkiKodu[],
  yetkilerModul?: Record<string, YetkiKodu[]>
): YetkiKodu[] {
  if (modulPrefix && yetkilerModul?.[modulPrefix]?.length) {
    return cozumleKullaniciYetkileri(rol, yetkilerModul[modulPrefix]);
  }
  return cozumleKullaniciYetkileri(rol, yetkiler);
}

/** Kullanıcılar ve Roller: SUPER_ADMIN veya ilgili sayfada kullanıcı yönetimi yetkisi gerekir. */
export function kullaniciModuluErisimVar(
  rol: string,
  yetkiler: YetkiKodu[],
  yetkilerModul?: Record<string, YetkiKodu[]>
): boolean {
  const roller = rol
    .split(/[,;|]/)
    .map((r) => r.trim())
    .filter(Boolean);
  if (roller.some((r) => r.toUpperCase() === 'SUPER_ADMIN')) return true;

  for (const tek of roller.length ? roller : [rol]) {
    const kullanicilar = modulYetkileriniCoz(tek, 'kullanicilar', yetkiler, yetkilerModul);
    const rollerYetki = modulYetkileriniCoz(tek, 'roller', yetkiler, yetkilerModul);
    if (
      kullanicilar.includes('kullanici_yonetimi') ||
      rollerYetki.includes('kullanici_yonetimi') ||
      yetkiler.includes('kullanici_yonetimi')
    ) {
      return true;
    }
  }

  return yetkiler.includes('kullanici_yonetimi');
}

export function modulGoruntulemeVar(
  rol: string,
  modulId: string,
  yetkiler?: YetkiKodu[],
  yetkilerModul?: Record<string, YetkiKodu[]>
): boolean {
  const roller = rol
    .split(/[,;|]/)
    .map((r) => r.trim())
    .filter(Boolean);
  if (roller.some((r) => r.toUpperCase() === 'SUPER_ADMIN')) return true;
  const prefix = modulIdDenPrefix(modulId);
  for (const tek of roller.length ? roller : [rol]) {
    const modulYetkileri = modulYetkileriniCoz(tek, prefix, yetkiler, yetkilerModul);
    if (yetkilerModul && Object.keys(yetkilerModul).length > 0) {
      if (modulYetkileri.includes('goruntuleme')) return true;
    } else if (cozumleKullaniciYetkileri(tek, yetkiler).includes('goruntuleme')) {
      return true;
    }
  }
  return false;
}

export function useYetkiler(modulId?: string) {
  const { kullanici } = useAuth();
  const modulPrefix = modulId ? modulIdDenPrefix(modulId) : undefined;

  const yetkiler = useMemo(
    () =>
      modulYetkileriniCoz(
        kullanici?.rol ?? '',
        modulPrefix,
        kullanici?.yetkiler,
        kullanici?.yetkilerModul
      ),
    [kullanici?.rol, kullanici?.yetkiler, kullanici?.yetkilerModul, modulPrefix]
  );

  const yetkiVar = (kod: YetkiKodu) => yetkiler.includes(kod);
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(
    kullanici?.rol ?? '',
    kullanici?.yetkiler ?? [],
    kullanici?.yetkilerModul
  );

  return {
    yetkiler,
    yetkiVar,
    goruntulemeVar: yetkiVar('goruntuleme'),
    eklemeVar: yetkiVar('ekleme'),
    duzenlemeVar: yetkiVar('duzenleme'),
    silmeVar: yetkiVar('silme'),
    kullaniciYonetimiVar: yetkiVar('kullanici_yonetimi'),
    kullaniciModuluErisimiVar,
    saltOkunur: !yetkiVar('duzenleme') && !yetkiVar('ekleme'),
  };
}
