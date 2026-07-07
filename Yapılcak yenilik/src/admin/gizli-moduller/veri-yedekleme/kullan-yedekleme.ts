import { useCallback, useEffect, useState } from 'react';
import { adminYedekApi, type YedekKaydi } from '@/admin/ortak/api/adminSistemApi';

export function useYedekleme() {
  const [varsayilanDosyaAdi, setVarsayilanDosyaAdi] = useState('');
  const [kayitlar, setKayitlar] = useState<YedekKaydi[]>([]);
  const [sonKayit, setSonKayit] = useState<YedekKaydi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  const yenile = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [dosya, gecmis] = await Promise.all([
        adminYedekApi.varsayilanDosyaAdi(),
        adminYedekApi.gecmis(),
      ]);
      setVarsayilanDosyaAdi(dosya.dosyaAdi);
      setKayitlar(gecmis.kayitlar);
      setSonKayit(gecmis.sonKayit);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Veriler yuklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yenile();
  }, [yenile]);

  return {
    varsayilanDosyaAdi,
    kayitlar,
    sonKayit,
    yukleniyor,
    hata,
    yenile,
  };
}
