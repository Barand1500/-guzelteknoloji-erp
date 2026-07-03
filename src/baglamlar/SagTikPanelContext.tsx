import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { sistemAyarlariGetir } from '@/admin/baslat-menusu/sistem/ayarlar/api';
import { sagTikPanelNormalize, sagTikAyarlariYayinla } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
import type { SagTikPanelAyarlari } from '@/admin/ortak/tipler/sagTikPaneli';
import { VARSAYILAN_SAG_TIK_PANEL } from '@/admin/ortak/tipler/sagTikPaneli';

interface SagTikPanelContextValue {
  ayarlar: SagTikPanelAyarlari;
  yukleniyor: boolean;
  yenile: () => Promise<void>;
}

const SagTikPanelContext = createContext<SagTikPanelContextValue | null>(null);

export function SagTikPanelProvider({ children }: { children: ReactNode }) {
  const [ayarlar, setAyarlar] = useState<SagTikPanelAyarlari>(() =>
    sagTikPanelNormalize(VARSAYILAN_SAG_TIK_PANEL)
  );
  const [yukleniyor, setYukleniyor] = useState(true);

  const yenile = useCallback(async () => {
    try {
      const veri = await sistemAyarlariGetir();
      setAyarlar(sagTikPanelNormalize(veri.sistem.sagTikPaneli));
    } catch {
      setAyarlar(sagTikPanelNormalize(VARSAYILAN_SAG_TIK_PANEL));
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yenile();
    const handler = () => void yenile();
    window.addEventListener('ap-sag-tik-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sag-tik-ayarlari-guncellendi', handler);
  }, [yenile]);

  const deger = useMemo(() => ({ ayarlar, yukleniyor, yenile }), [ayarlar, yukleniyor, yenile]);

  return <SagTikPanelContext.Provider value={deger}>{children}</SagTikPanelContext.Provider>;
}

export function useSagTikPanel() {
  const ctx = useContext(SagTikPanelContext);
  if (!ctx) throw new Error('useSagTikPanel SagTikPanelProvider içinde kullanılmalı');
  return ctx;
}

export { sagTikAyarlariYayinla };
