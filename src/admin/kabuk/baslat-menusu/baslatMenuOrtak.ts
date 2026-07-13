import { useCallback, useState } from 'react';
import { modulAra, adminKategoriler, adminModulleri, modulleriMenuyeGoreFiltrele } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import { useAuth } from '@/baglamlar/AuthContext';
import { kullaniciModuluErisimVar } from '@/kancalar/useYetkiler';
import {
  baslatMenuKapaliKategorileriKaydet,
  baslatMenuKapaliKategorileriOku,
} from './baslatMenuKategoriDurumu';

export const KATEGORI_IKON: Record<string, string> = {
  'Müşteri / Ajans': '👥',
  Sistem: '⚙️',
  Tanımlar: '🗃️',
  ERP: '🧩',
  Datagrid: '📊',
};

export type BaslatMenuDurumu = ReturnType<typeof useBaslatMenuDurumu>;

export function useBaslatMenuDurumu() {
  const [arama, setArama] = useState('');
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string>>(() =>
    baslatMenuKapaliKategorileriOku()
  );
  const { aktifPrefixler } = useModulKatalog();
  const { kullanici } = useAuth();
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(
    kullanici?.rol ?? '',
    kullanici?.yetkiler ?? [],
    kullanici?.yetkilerModul
  );
  const sonuclar = modulAra(
    arama,
    aktifPrefixler,
    kullaniciModuluErisimiVar,
    kullanici?.yetkilerModul ?? null,
    kullanici?.rol ?? ''
  );
  const gorunurModuller = modulleriMenuyeGoreFiltrele(
    adminModulleri,
    aktifPrefixler,
    kullaniciModuluErisimiVar,
    kullanici?.yetkilerModul ?? null,
    kullanici?.rol ?? ''
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
