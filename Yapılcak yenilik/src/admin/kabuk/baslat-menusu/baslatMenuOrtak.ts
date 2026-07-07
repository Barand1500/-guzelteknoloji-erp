import { useCallback, useState } from 'react';
import { modulAra, adminKategoriler, adminModulleri, modulleriMenuyeGoreFiltrele } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import {
  baslatMenuKapaliKategorileriKaydet,
  baslatMenuKapaliKategorileriOku,
  baslatMenuSonKategoriKaydet,
  baslatMenuSonKategoriOku,
} from './baslatMenuKategoriDurumu';

export const KATEGORI_IKON: Record<string, string> = {
  Master: '🗄️',
  'Hızlı Erişim': '⚡',
  'Site Yönetimi': '🏠',
  'İçerik Yönetimi': '📝',
  'Müşteri / Ajans': '👥',
  Tanımlar: '📋',
  Raporlar: '📊',
  'Paket Servisi Raporları': '📦',
  'Rezervasyon Raporları': '📆',
  Ayarlar: '⚙️',
  Sistem: '⚙️',
};

export type BaslatMenuDurumu = ReturnType<typeof useBaslatMenuDurumu>;

export function useBaslatMenuDurumu() {
  const [arama, setArama] = useState('');
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string>>(() =>
    baslatMenuKapaliKategorileriOku()
  );
  const [seciliKategori, setSeciliKategori] = useState<string | null>(() => baslatMenuSonKategoriOku());
  const { aktifPrefixler } = useModulKatalog();
  const sonuclar = modulAra(arama, aktifPrefixler);
  const gorunurModuller = modulleriMenuyeGoreFiltrele(adminModulleri, aktifPrefixler);

  const kategoriAc = useCallback((kategori: string) => {
    setKapaliKategoriler((onceki) => {
      if (!onceki.has(kategori)) return onceki;
      const yeni = new Set(onceki);
      yeni.delete(kategori);
      baslatMenuKapaliKategorileriKaydet(yeni);
      return yeni;
    });
  }, []);

  const kategoriToggle = useCallback((kategori: string) => {
    setKapaliKategoriler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(kategori)) yeni.delete(kategori);
      else yeni.add(kategori);
      baslatMenuKapaliKategorileriKaydet(yeni);
      return yeni;
    });
    baslatMenuSonKategoriKaydet(kategori);
    setSeciliKategori(kategori);
  }, []);

  const seciliKategoriAyarla = useCallback(
    (kategori: string) => {
      setSeciliKategori(kategori);
      baslatMenuSonKategoriKaydet(kategori);
      kategoriAc(kategori);
    },
    [kategoriAc]
  );

  const modulAcildi = useCallback(
    (kategori: string) => {
      seciliKategoriAyarla(kategori);
    },
    [seciliKategoriAyarla]
  );

  return {
    arama,
    setArama,
    kapaliKategoriler,
    kategoriToggle,
    seciliKategori,
    seciliKategoriAyarla,
    modulAcildi,
    sonuclar,
    gorunurModuller,
    kategoriler: adminKategoriler,
  };
}
