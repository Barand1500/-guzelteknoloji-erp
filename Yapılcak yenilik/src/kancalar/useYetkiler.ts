import { useMemo } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

const VARSAYILAN_ROL_YETKILERI: Record<string, YetkiKodu[]> = {
  SUPER_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  AJANS_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  MUSTERI_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme'],
  EDITOR: ['goruntuleme', 'ekleme', 'duzenleme'],
  SEO_EDITOR: ['goruntuleme', 'duzenleme'],
  GORUNTULEME: ['goruntuleme'],
};

function cozumleYetkiler(rol: string, yetkiler?: YetkiKodu[]): YetkiKodu[] {
  if (yetkiler && yetkiler.length > 0) return yetkiler;
  return VARSAYILAN_ROL_YETKILERI[rol] ?? ['goruntuleme'];
}

export function useYetkiler() {
  const { kullanici } = useAuth();

  const yetkiler = useMemo(
    () => cozumleYetkiler(kullanici?.rol ?? '', kullanici?.yetkiler),
    [kullanici?.rol, kullanici?.yetkiler]
  );

  const yetkiVar = (kod: YetkiKodu) => yetkiler.includes(kod);

  return {
    yetkiler,
    yetkiVar,
    goruntulemeVar: yetkiVar('goruntuleme'),
    eklemeVar: yetkiVar('ekleme'),
    duzenlemeVar: yetkiVar('duzenleme'),
    silmeVar: yetkiVar('silme'),
    kullaniciYonetimiVar: yetkiVar('kullanici_yonetimi'),
    saltOkunur: !yetkiVar('duzenleme') && !yetkiVar('ekleme'),
  };
}
