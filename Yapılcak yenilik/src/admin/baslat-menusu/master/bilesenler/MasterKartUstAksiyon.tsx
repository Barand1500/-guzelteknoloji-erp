import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';

interface MasterKartUstAksiyonBaglam {
  setUstAksiyon: (node: ReactNode) => void;
}

const MasterKartUstAksiyonContext = createContext<MasterKartUstAksiyonBaglam | null>(null);

export function MasterKartUstAksiyonProvider({
  children,
  onUstAksiyon,
}: {
  children: ReactNode;
  onUstAksiyon: (node: ReactNode) => void;
}) {
  const deger = useMemo(() => ({ setUstAksiyon: onUstAksiyon }), [onUstAksiyon]);
  return <MasterKartUstAksiyonContext.Provider value={deger}>{children}</MasterKartUstAksiyonContext.Provider>;
}

export interface MasterDurumFiltreSecenek {
  value: string;
  label: string;
}

export const MASTER_DURUM_FILTRE_VARSAYILAN: MasterDurumFiltreSecenek[] = [
  { value: 'tumu', label: 'Tümü' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'pasif', label: 'Pasif' },
];

export const MASTER_LISANS_DURUM_FILTRE: MasterDurumFiltreSecenek[] = [
  { value: 'tumu', label: 'Tümü' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'yakinda', label: 'Süresi yakın' },
  { value: 'pasif', label: 'Pasif' },
];

export function MasterDurumFiltre({
  value,
  onChange,
  secenekler = MASTER_DURUM_FILTRE_VARSAYILAN,
  ariaLabel = 'Durum filtresi',
}: {
  value: string;
  onChange: (v: string) => void;
  secenekler?: MasterDurumFiltreSecenek[];
  ariaLabel?: string;
}) {
  return (
    <select
      className={`${formSelectSinifi} ap-master-kart-durum-filtre`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
    >
      {secenekler.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export function useMasterKartDurumFiltre<T extends string>(
  value: T,
  onChange: (v: T) => void,
  secenekler?: MasterDurumFiltreSecenek[]
) {
  const baglam = useContext(MasterKartUstAksiyonContext);

  useEffect(() => {
    if (!baglam) return;
    baglam.setUstAksiyon(
      <MasterDurumFiltre value={value} onChange={(v) => onChange(v as T)} secenekler={secenekler} />
    );
    return () => baglam.setUstAksiyon(null);
  }, [baglam, value, onChange, secenekler]);
}

export function MasterUstFiltreSatiri({
  arama,
  onArama,
  placeholder,
  sag,
}: {
  arama: string;
  onArama: (v: string) => void;
  placeholder: string;
  sag: ReactNode;
}) {
  return (
    <div className="ap-master-ust ap-master-ust-filtre">
      <MasterArama kompakt placeholder={placeholder} value={arama} onChange={onArama} />
      <div className="ap-master-ust-sag">{sag}</div>
    </div>
  );
}
