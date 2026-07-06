import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { AksiyonCubuguUstCizgi } from './AksiyonCubuguUstCizgi';

interface AksiyonCubuguPanelContextValue {
  panelKaydet: (el: HTMLElement | null) => void;
  panelAcik: boolean;
  panelEl: HTMLElement | null;
}

const AksiyonCubuguPanelContext = createContext<AksiyonCubuguPanelContextValue | null>(null);

export function AksiyonCubuguPanelProvider({ children }: { children: ReactNode }) {
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);

  const panelKaydet = useCallback((el: HTMLElement | null) => {
    setPanelEl((onceki) => (onceki === el ? onceki : el));
  }, []);

  const deger = useMemo(
    () => ({
      panelKaydet,
      panelAcik: panelEl !== null,
      panelEl,
    }),
    [panelKaydet, panelEl]
  );

  return (
    <AksiyonCubuguPanelContext.Provider value={deger}>
      {children}
    </AksiyonCubuguPanelContext.Provider>
  );
}

export function AksiyonCubuguUstCizgiSlot({ footerRef }: { footerRef: RefObject<HTMLElement | null> }) {
  const ctx = useContext(AksiyonCubuguPanelContext);
  if (!ctx) return null;

  return (
    <AksiyonCubuguUstCizgi
      footerRef={footerRef}
      panelEl={ctx.panelEl}
      panelAktif={ctx.panelAcik}
    />
  );
}

/** Açık panel DOM'unu context'e kaydeder; callback ref kullanmaz (sonsuz döngüyü önler). */
export function useAksiyonCubuguPanelSync(acik: boolean, elRef: RefObject<HTMLElement | null>) {
  const ctx = useContext(AksiyonCubuguPanelContext);
  const panelKaydetRef = useRef(ctx?.panelKaydet);
  panelKaydetRef.current = ctx?.panelKaydet;

  useLayoutEffect(() => {
    const kaydet = panelKaydetRef.current;
    if (!kaydet) return;

    if (acik) {
      kaydet(elRef.current);
    } else {
      kaydet(null);
    }

    return () => {
      kaydet(null);
    };
  }, [acik, elRef]);
}

export function useAksiyonCubuguPanelAcik() {
  return useContext(AksiyonCubuguPanelContext)?.panelAcik ?? false;
}
