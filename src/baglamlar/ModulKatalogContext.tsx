import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { useAuth } from '@/baglamlar/AuthContext';
import { modulMenuGorunurMu as panelModulMenuGorunurMu } from '@/admin/veri/adminMenuYapisi';
import { kullaniciModuluErisimVar } from '@/kancalar/useYetkiler';

export const MODUL_KATALOG_YENILE_OLAY = 'ap-modul-katalog-yenile';

export function modulKatalogYenile() {
  window.dispatchEvent(new Event(MODUL_KATALOG_YENILE_OLAY));
}

interface ModulKatalogDeger {
  aktifPrefixler: Set<string> | null;
  yukleniyor: boolean;
  yenile: () => Promise<void>;
  modulMenuGorunurMu: (modulId: string) => boolean;
}

const ModulKatalogContext = createContext<ModulKatalogDeger | null>(null);

export function ModulKatalogProvider({ children }: { children: ReactNode }) {
  const [aktifPrefixler, setAktifPrefixler] = useState<Set<string> | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const { kullanici } = useAuth();
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(
    kullanici?.rol ?? '',
    kullanici?.yetkiler ?? [],
    kullanici?.yetkilerModul
  );

  const yenile = useCallback(async () => {
    setYukleniyor(true);
    try {
      const { moduller } = await adminJsonFetch<{ moduller: { prefix: string }[] }>('/roller', {
        headers: adminHeaders(),
      });
      setAktifPrefixler(new Set(moduller.map((m) => m.prefix)));
    } catch {
      setAktifPrefixler(null);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yenile();
    const dinle = () => void yenile();
    window.addEventListener(MODUL_KATALOG_YENILE_OLAY, dinle);
    return () => window.removeEventListener(MODUL_KATALOG_YENILE_OLAY, dinle);
  }, [yenile]);

  const modulMenuGorunurMu = useCallback(
    (modulId: string) =>
      panelModulMenuGorunurMu(
        modulId,
        aktifPrefixler,
        kullaniciModuluErisimiVar,
        kullanici?.yetkilerModul ?? null,
        kullanici?.rol ?? ''
      ),
    [aktifPrefixler, kullaniciModuluErisimiVar, kullanici?.yetkilerModul, kullanici?.rol]
  );

  const deger = useMemo(
    () => ({ aktifPrefixler, yukleniyor, yenile, modulMenuGorunurMu }),
    [aktifPrefixler, yukleniyor, yenile, modulMenuGorunurMu]
  );

  return <ModulKatalogContext.Provider value={deger}>{children}</ModulKatalogContext.Provider>;
}

export function useModulKatalog() {
  const ctx = useContext(ModulKatalogContext);
  if (!ctx) {
    throw new Error('useModulKatalog ModulKatalogProvider icinde kullanilmali');
  }
  return ctx;
}

export function useModulKatalogOptional() {
  return useContext(ModulKatalogContext);
}
