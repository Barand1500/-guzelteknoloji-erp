import { useEffect, useRef } from 'react';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';

/** Üst sekmedeki turuncu kaydedilmedi noktasını kirli durumuyla senkronlar. */
export function useSekmeKirli(kirli?: boolean) {
  const kabuk = useAdminSekmeKabuk();
  const sonKirliRef = useRef<boolean | undefined>(undefined);
  const sekmeId = kabuk?.sekmeId;
  const isaretle = kabuk?.kaydedilmediIsaretle;

  useEffect(() => {
    sonKirliRef.current = undefined;
  }, [sekmeId]);

  useEffect(() => {
    if (!sekmeId || !isaretle || kirli === undefined) return;
    if (sonKirliRef.current === kirli) return;
    sonKirliRef.current = kirli;
    isaretle(sekmeId, kirli);
  }, [sekmeId, isaretle, kirli]);
}
