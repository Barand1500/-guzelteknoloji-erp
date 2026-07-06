import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  panelCeviriMetni,
  panelJsonDisaAktar,
  panelSozlukBirlestir,
  PANEL_SOZLUK_TR,
} from '@/dil/panelSozluk';

interface PanelDilDegerleri {
  dil: string;
  ozelCeviriler: Record<string, Record<string, string>>;
  t: (anahtar: string, yedek?: string) => string;
  dilAyarla: (dil: string) => void;
  cevirileriAyarla: (ceviriler: Record<string, Record<string, string>>) => void;
  tumMetinlerJson: (hedefDil?: string) => string;
  sozluk: Record<string, string>;
}

const PanelDilContext = createContext<PanelDilDegerleri | null>(null);

export function PanelDilProvider({
  children,
  baslangicDili = 'tr',
  baslangicCeviriler = {},
}: {
  children: ReactNode;
  baslangicDili?: string;
  baslangicCeviriler?: Record<string, Record<string, string>>;
}) {
  const [dil, setDil] = useState(baslangicDili);
  const [ozelCeviriler, setOzelCeviriler] = useState(baslangicCeviriler);

  const sozluk = useMemo(() => panelSozlukBirlestir(dil, ozelCeviriler), [dil, ozelCeviriler]);

  const t = useCallback(
    (anahtar: string, yedek?: string) => panelCeviriMetni(anahtar, dil, ozelCeviriler, yedek),
    [dil, ozelCeviriler]
  );

  const tumMetinlerJson = useCallback(
    (hedefDil?: string) => panelJsonDisaAktar(hedefDil ?? dil, ozelCeviriler),
    [dil, ozelCeviriler]
  );

  const deger = useMemo<PanelDilDegerleri>(
    () => ({
      dil,
      ozelCeviriler,
      t,
      dilAyarla: setDil,
      cevirileriAyarla: setOzelCeviriler,
      tumMetinlerJson,
      sozluk,
    }),
    [dil, ozelCeviriler, t, tumMetinlerJson, sozluk]
  );

  return <PanelDilContext.Provider value={deger}>{children}</PanelDilContext.Provider>;
}

export function usePanelDil() {
  const ctx = useContext(PanelDilContext);
  if (!ctx) {
    return {
      dil: 'tr',
      ozelCeviriler: {} as Record<string, Record<string, string>>,
      t: (anahtar: string, yedek?: string) => PANEL_SOZLUK_TR[anahtar] ?? yedek ?? anahtar,
      dilAyarla: () => {},
      cevirileriAyarla: () => {},
      tumMetinlerJson: () => '{}',
      sozluk: PANEL_SOZLUK_TR,
    } satisfies PanelDilDegerleri;
  }
  return ctx;
}
