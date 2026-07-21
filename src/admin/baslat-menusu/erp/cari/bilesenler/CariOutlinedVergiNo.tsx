import { useId, useState } from 'react';
import { yalnizcaRakam } from '../cariFormatYardimci';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

export function CariOutlinedVergiNo({
  etiket,
  deger,
  onChange,
  maxHane,
  disabled = false,
  className,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  maxHane: number;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const hane = deger.replace(/\D/g, '').length;

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''} ${className ?? ''}`.trim()}
    >
      <CariOutlinedEtiket etiket={etiket} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <input
          id={inputId}
          className="cari-outlined-input"
          value={deger}
          disabled={disabled}
          inputMode="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? `Yalnızca rakam, ${maxHane} hane` : undefined}
          onChange={(e) => onChange(yalnizcaRakam(e.target.value, maxHane))}
        />
        {focused || hane > 0 ? (
          <span className="cari-outlined-sonek cari-outlined-sayac" aria-hidden>
            {hane}/{maxHane}
          </span>
        ) : null}
      </div>
    </div>
  );
}
