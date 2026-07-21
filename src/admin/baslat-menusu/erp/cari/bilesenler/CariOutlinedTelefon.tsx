import { useId, useState } from 'react';
import { telefonFormatla, yalnizcaRakam } from '../cariFormatYardimci';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

export function CariOutlinedTelefon({
  deger,
  onChange,
  disabled = false,
  etiket = 'Telefon',
}: {
  deger: string;
  onChange: (deger: string) => void;
  disabled?: boolean;
  etiket?: string;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
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
          placeholder={focused ? '0xxx xxx xx xx' : undefined}
          onChange={(e) => {
            const rakamlar = yalnizcaRakam(e.target.value, 11);
            onChange(telefonFormatla(rakamlar));
          }}
        />
      </div>
    </div>
  );
}
