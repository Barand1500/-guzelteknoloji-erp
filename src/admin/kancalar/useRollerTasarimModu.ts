import { useEffect, useState } from 'react';
import {
  PANEL_GORUNUM_OLAY,
  sitePanelGorunumOku,
  type PanelGorunumAyarlari,
  type RollerTasarimModu,
} from '@/admin/baslat-menusu/sistem/ayarlar/panelGorunum';

export function useRollerTasarimModu(): RollerTasarimModu {
  const [mod, setMod] = useState<RollerTasarimModu>(() => sitePanelGorunumOku().rollerTasarim);

  useEffect(() => {
    const dinle = (olay: Event) => {
      const detay = (olay as CustomEvent<PanelGorunumAyarlari>).detail;
      if (detay?.rollerTasarim) {
        setMod(detay.rollerTasarim);
        return;
      }
      setMod(sitePanelGorunumOku().rollerTasarim);
    };
    window.addEventListener(PANEL_GORUNUM_OLAY, dinle);
    return () => window.removeEventListener(PANEL_GORUNUM_OLAY, dinle);
  }, []);

  return mod;
}
