import { useEffect, useRef, type ReactNode } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';

export interface HucreSecenek {
  value: string | number;
  label: string;
}

interface MasterDuzenlenebilirHucreProps {
  duzenleniyor: boolean;
  deger: string;
  taslak: string;
  onTaslakDegistir: (v: string) => void;
  onDuzenleBaslat: () => void;
  onKaydet: (deger?: string) => void;
  onIptal: () => void;
  kaydediliyor?: boolean;
  saltOkunur?: boolean;
  tip?: 'text' | 'email' | 'select' | 'tel' | 'number' | 'date';
  secenekler?: HucreSecenek[];
  placeholder?: string;
  gosterim?: ReactNode;
  className?: string;
}

export function MasterDuzenlenebilirHucre({
  duzenleniyor,
  deger,
  taslak,
  onTaslakDegistir,
  onDuzenleBaslat,
  onKaydet,
  onIptal,
  kaydediliyor,
  saltOkunur,
  tip = 'text',
  secenekler,
  placeholder,
  gosterim,
  className = '',
}: MasterDuzenlenebilirHucreProps) {
  const kapsayiciRef = useRef<HTMLTableCellElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (!duzenleniyor) return;
    inputRef.current?.focus();
    if (inputRef.current instanceof HTMLInputElement) {
      inputRef.current.select();
    }
  }, [duzenleniyor]);

  useEffect(() => {
    if (!duzenleniyor) return;
    function disariTik(e: MouseEvent) {
      if (kapsayiciRef.current?.contains(e.target as Node)) return;
      onKaydet();
    }
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onIptal();
      }
      if (e.key === 'Enter' && tip !== 'select') {
        e.preventDefault();
        onKaydet();
      }
    }
    document.addEventListener('mousedown', disariTik);
    document.addEventListener('keydown', tus);
    return () => {
      document.removeEventListener('mousedown', disariTik);
      document.removeEventListener('keydown', tus);
    };
  }, [duzenleniyor, onKaydet, onIptal, tip]);

  if (saltOkunur) {
    return (
      <td className={`ap-master-excel-hucre ap-master-excel-hucre-salt ${className}`}>
        {gosterim ?? (deger || '—')}
      </td>
    );
  }

  if (duzenleniyor) {
    return (
      <td ref={kapsayiciRef} className={`ap-master-excel-hucre ap-master-excel-hucre-duzenle ${className}`}>
        {tip === 'select' && secenekler ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className={`${formSelectSinifi} ap-master-excel-input`}
            value={taslak}
            disabled={kaydediliyor}
            onChange={(e) => {
              const v = e.target.value;
              onTaslakDegistir(v);
              onKaydet(v);
            }}
          >
            {secenekler.map((s) => (
              <option key={String(s.value)} value={String(s.value)}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={
              tip === 'email'
                ? 'email'
                : tip === 'tel'
                  ? 'tel'
                  : tip === 'number'
                    ? 'number'
                    : tip === 'date'
                      ? 'date'
                      : 'text'
            }
            className={`${formInputSinifi} ap-master-excel-input`}
            value={taslak}
            placeholder={placeholder}
            disabled={kaydediliyor}
            min={tip === 'number' ? 0 : undefined}
            max={tip === 'number' ? 100 : undefined}
            step={tip === 'number' ? '0.01' : undefined}
            onChange={(e) => onTaslakDegistir(e.target.value)}
          />
        )}
      </td>
    );
  }

  const metin = gosterim ?? (deger ? deger : <span className="ap-muted">—</span>);

  return (
    <td
      ref={kapsayiciRef}
      className={`ap-master-excel-hucre ap-master-excel-hucre-tiklanabilir ${className}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDuzenleBaslat();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {metin}
    </td>
  );
}
