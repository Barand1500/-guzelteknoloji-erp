import { useEffect, useRef } from 'react';
import type { GomuluDuzenleSecenek } from '@/admin/baslat-menusu/tanimlar/tipler';

/**
 * Grid panelinden acilan gomulu duzenlemede formu yalnizca kayit ilk yuklendiginde doldurur.
 * seciliKayit referansi degisse bile kullanici girdisini silmez.
 */
export function useGomuluDuzenleFormYukle(
  gomuluDuzenle: GomuluDuzenleSecenek | undefined,
  seciliKayit: { id: string } | null | undefined,
  yukle: () => void
) {
  const yuklenenIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gomuluDuzenle) {
      yuklenenIdRef.current = null;
      return;
    }
    if (!seciliKayit) return;
    if (yuklenenIdRef.current === seciliKayit.id) return;
    yuklenenIdRef.current = seciliKayit.id;
    yukle();
  }, [gomuluDuzenle, seciliKayit, yukle]);
}
