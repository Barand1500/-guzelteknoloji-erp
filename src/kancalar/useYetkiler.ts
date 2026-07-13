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
  if (rol.trim().toUpperCase() === 'SUPER_ADMIN') return true;

  const kullanicilar = modulYetkileriniCoz(rol, 'kullanicilar', yetkiler, yetkilerModul);
  const roller = modulYetkileriniCoz(rol, 'roller', yetkiler, yetkilerModul);

  return (
    kullanicilar.includes('kullanici_yonetimi') ||
    roller.includes('kullanici_yonetimi') ||
    yetkiler.includes('kullanici_yonetimi')
  );
}

export function modulGoruntulemeVar(
  rol: string,
  modulId: string,
  yetkiler?: YetkiKodu[],
  yetkilerModul?: Record<string, YetkiKodu[]>
): boolean {
  if (rol.trim().toUpperCase() === 'SUPER_ADMIN') return true;
  const prefix = modulIdDenPrefix(modulId);
  const modulYetkileri = modulYetkileriniCoz(rol, prefix, yetkiler, yetkilerModul);
  if (yetkilerModul && Object.keys(yetkilerModul).length > 0) {
    return modulYetkileri.includes('goruntuleme');
  }
  return cozumleKullaniciYetkileri(rol, yetkiler).includes('goruntuleme');
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
    cozumleKullaniciYetkileri(kullanici?.rol ?? '', kullanici?.yetkiler),
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
