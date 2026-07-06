import { useCallback, useState } from 'react';
import { modulAra, adminKategoriler, adminModulleri, modulleriMenuyeGoreFiltrele } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import {
  baslatMenuKapaliKategorileriKaydet,
  baslatMenuKapaliKategorileriOku,
} from './baslatMenuKategoriDurumu';

export const KATEGORI_IKON: Record<string, string> = {
  'Müşteri / Ajans': '👥',
  Sistem: '⚙️',
};

export type BaslatMenuDurumu = ReturnType<typeof useBaslatMenuDurumu>;

export function useBaslatMenuDurumu() {
  const [arama, setArama] = useState('');
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string>>(() =>
    baslatMenuKapaliKategorileriOku()
  );
  const { aktifPrefixler } = useModulKatalog();
  const sonuclar = modulAra(arama, aktifPrefixler);
  const gorunurModuller = modulleriMenuyeGoreFiltrele(adminModulleri, aktifPrefixler);

  const kategoriToggle = useCallback((kategori: string) => {
    setKapaliKategoriler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(kategori)) yeni.delete(kategori);
      else yeni.add(kategori);
      baslatMenuKapaliKategorileriKaydet(yeni);
      return yeni;
    });
  }, []);

  return {
    arama,
    setArama,
    kapaliKategoriler,
    kategoriToggle,
    sonuclar,
    gorunurModuller,
    kategoriler: adminKategoriler,
  };
}
