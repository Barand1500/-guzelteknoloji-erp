import { useMemo } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

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

function cozumleYetkiler(rol: string, yetkiler?: YetkiKodu[]): YetkiKodu[] {
  return cozumleKullaniciYetkileri(rol, yetkiler);
}

/** Kullanıcılar ve Roller: SUPER_ADMIN veya kullanıcı yönetimi yetkisi gerekir. */
export function kullaniciModuluErisimVar(rol: string, yetkiler: YetkiKodu[]): boolean {
  return (
    rol.trim().toUpperCase() === 'SUPER_ADMIN' ||
    yetkiler.includes('kullanici_yonetimi')
  );
}

export function useYetkiler() {
  const { kullanici } = useAuth();

  const yetkiler = useMemo(
    () => cozumleYetkiler(kullanici?.rol ?? '', kullanici?.yetkiler),
    [kullanici?.rol, kullanici?.yetkiler]
  );

  const yetkiVar = (kod: YetkiKodu) => yetkiler.includes(kod);
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(kullanici?.rol ?? '', yetkiler);

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
