import { useEffect } from 'react';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';

/** Üst sekmedeki turuncu kaydedilmedi noktasını kirli durumuyla senkronlar. */
export function useSekmeKirli(kirli?: boolean) {
  const kabuk = useAdminSekmeKabuk();

  useEffect(() => {
    if (!kabuk || kirli === undefined) return;
    kabuk.kaydedilmediIsaretle(kabuk.sekmeId, kirli);
  }, [kabuk, kirli]);
}
