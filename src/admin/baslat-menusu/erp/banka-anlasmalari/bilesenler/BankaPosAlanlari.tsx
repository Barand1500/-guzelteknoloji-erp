import { useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';

export function BankaOutlinedTarih({
  etiket,
  deger,
  onChange,
  disabled,
  zorunlu,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  disabled?: boolean;
  zorunlu?: boolean;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`.trim()}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <input
          id={inputId}
          type="date"
          className="cari-outlined-input"
          value={deger}
          disabled={disabled}
          required={zorunlu}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function BankaValorKutu({
  deger,
  onChange,
  disabled,
}: {
  deger: boolean;
  onChange: (deger: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label className={`ba-valor-kutu${disabled ? ' ba-valor-kutu--pasif' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="ba-valor-check"
        checked={deger}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ba-valor-metin">Valör</span>
    </label>
  );
}
