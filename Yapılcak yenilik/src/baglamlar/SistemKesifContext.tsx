import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { sistemKesifTurBul } from '@/admin/kabuk/kesif/veri-kesif';
import { SistemKesifBaslatModal } from '@/admin/kabuk/kesif/SistemKesifBaslatModal';
import { SistemKesifTurOverlay } from '@/admin/kabuk/kesif/SistemKesifTurOverlay';
import type { SistemKesifTur } from '@/admin/ortak/tipler/sistemKesif';

interface SistemKesifContextValue {
  modalAc: () => void;
  turBaslat: (turId: string) => void;
  turAktif: boolean;
  baslatMenuKaydet: (ac: () => void, kapat: () => void) => void;
}

const SistemKesifContext = createContext<SistemKesifContextValue | null>(null);

interface SistemKesifProviderProps {
  children: ReactNode;
  onModulAc: (modulId: string) => void;
}

export function SistemKesifProvider({ children, onModulAc }: SistemKesifProviderProps) {
  const [modalAcik, setModalAcik] = useState(false);
  const [aktifTur, setAktifTur] = useState<SistemKesifTur | null>(null);
  const menuAcRef = useRef<(() => void) | null>(null);
  const menuKapatRef = useRef<(() => void) | null>(null);

  const baslatMenuKaydet = useCallback((ac: () => void, kapat: () => void) => {
    menuAcRef.current = ac;
    menuKapatRef.current = kapat;
  }, []);

  const turBaslat = useCallback((turId: string) => {
    const tur = sistemKesifTurBul(turId);
    if (!tur) return;
    setModalAcik(false);
    setAktifTur(tur);
  }, []);

  const turBitir = useCallback(() => {
    setAktifTur(null);
    menuKapatRef.current?.();
  }, []);

  const deger = useMemo(
    () => ({
      modalAc: () => setModalAcik(true),
      turBaslat,
      turAktif: !!aktifTur,
      baslatMenuKaydet,
    }),
    [turBaslat, aktifTur, baslatMenuKaydet]
  );

  return (
    <SistemKesifContext.Provider value={deger}>
      {children}
      <SistemKesifBaslatModal
        acik={modalAcik}
        onKapat={() => setModalAcik(false)}
        onTurBaslat={turBaslat}
      />
      {aktifTur && (
        <SistemKesifTurOverlay
          tur={aktifTur}
          onModulAc={onModulAc}
          onMenuAc={() => menuAcRef.current?.()}
          onMenuKapat={() => menuKapatRef.current?.()}
          onBitir={turBitir}
        />
      )}
    </SistemKesifContext.Provider>
  );
}

export function useSistemKesif() {
  const ctx = useContext(SistemKesifContext);
  if (!ctx) {
    throw new Error('useSistemKesif yalnızca SistemKesifProvider içinde kullanılabilir');
  }
  return ctx;
}

export function useSistemKesifOptional() {
  return useContext(SistemKesifContext);
}
