import { useId, useState, type ReactNode } from 'react';
import { yalnizcaRakam } from '../cariFormatYardimci';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

export function CariOutlinedVergiNo({
  etiket,
  deger,
  onChange,
  maxHane,
  disabled = false,
  className,
  sonek,
  onEnter,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  maxHane: number;
  disabled?: boolean;
  className?: string;
  sonek?: ReactNode;
  onEnter?: () => void;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const hane = deger.replace(/\D/g, '').length;
  const sayacGoster = focused || hane > 0;

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
        />
        {sayacGoster || sonek ? (
          <div className="cari-outlined-sonek">
            {sayacGoster ? (
              <span className="cari-outlined-sayac" aria-hidden>
                {hane}/{maxHane}
              </span>
            ) : null}
            {sonek}
          </div>
        ) : null}
      </div>
    </div>
  );
}
