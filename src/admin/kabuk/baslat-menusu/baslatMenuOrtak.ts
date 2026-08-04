import { useCallback, useMemo, useState } from 'react';
import { modulAra, adminKategoriler, adminModulleri, modulleriMenuyeGoreFiltrele } from '@/admin/veri/adminMenuYapisi';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { useModulKatalogOptional } from '@/baglamlar/ModulKatalogContext';
import { useAuth } from '@/baglamlar/AuthContext';
import { kullaniciModuluErisimVar } from '@/kancalar/useYetkiler';
import {
  baslatMenuKapaliKategorileriKaydet,
  baslatMenuKapaliKategorileriOku,
} from './baslatMenuKategoriDurumu';
import { KATEGORI_FLAT_IKON } from './baslatMenuIkonlar';

/** @deprecated Emoji yerine flat SVG kullanın — geriye dönük uyumluluk */
export const KATEGORI_IKON: Record<string, string> = {
  'Müşteri / Ajans': '👥',
  Sistem: '⚙️',
  Tanımlar: '🗃️',
  ERP: '🧩',
  Datagrid: '📊',
};

export { KATEGORI_FLAT_IKON };
export { BaslatMenuIkon } from './baslatMenuIkonlar';

export type BaslatMenuDurumu = ReturnType<typeof useBaslatMenuDurumu>;

const EMPTY_FAVORI: string[] = [];

function favoriyeGoreFiltrele(moduller: AdminModul[], favoriIds: string[], sadeceFavoriler: boolean) {
  if (!sadeceFavoriler) return moduller;
  const favoriSet = new Set(favoriIds);
  const sira = new Map(favoriIds.map((id, i) => [id, i]));
  return moduller
    .filter((m) => favoriSet.has(m.id))
    .sort((a, b) => (sira.get(a.id) ?? 999) - (sira.get(b.id) ?? 999));
}

export function useBaslatMenuDurumu() {
  const [arama, setArama] = useState('');
  const [sadeceFavoriler, setSadeceFavoriler] = useState(false);
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string>>(() =>
    baslatMenuKapaliKategorileriOku()
  );
  const { aktifPrefixler } = useModulKatalogOptional() ?? { aktifPrefixler: null };
  const { kullanici } = useAuth();
  const favoriIds = kullanici?.tercihler?.dashboardHizliErisim;
  const favoriListe = favoriIds ?? EMPTY_FAVORI;
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(
    kullanici?.rol ?? '',
    kullanici?.yetkiler ?? [],
    kullanici?.yetkilerModul
  );
  const aramaSonuclari = modulAra(
    arama,
    aktifPrefixler,
    kullaniciModuluErisimiVar,
    kullanici?.yetkilerModul ?? null,
    kullanici?.rol ?? ''
  );
  const tumGorunur = modulleriMenuyeGoreFiltrele(
    adminModulleri,
    aktifPrefixler,
    kullaniciModuluErisimiVar,
    kullanici?.yetkilerModul ?? null,
    kullanici?.rol ?? ''
  );

  const sonuclar = useMemo(
    () => favoriyeGoreFiltrele(aramaSonuclari, favoriListe, sadeceFavoriler),
    [aramaSonuclari, favoriListe, sadeceFavoriler]
  );
  const gorunurModuller = useMemo(
    () => favoriyeGoreFiltrele(tumGorunur, favoriListe, sadeceFavoriler),
    [tumGorunur, favoriListe, sadeceFavoriler]
  );

  const kategoriToggle = useCallback((kategori: string) => {
    setKapaliKategoriler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(kategori)) yeni.delete(kategori);
      else yeni.add(kategori);
      baslatMenuKapaliKategorileriKaydet(yeni);
      return yeni;
    });
  }, []);

  const favoriFiltreToggle = useCallback(() => {
    setSadeceFavoriler((onceki) => !onceki);
  }, []);

  return {
    arama,
    setArama,
    sadeceFavoriler,
    favoriFiltreToggle,
    kapaliKategoriler,
    kategoriToggle,
    sonuclar,
    gorunurModuller,
    kategoriler: adminKategoriler,
  };
}
