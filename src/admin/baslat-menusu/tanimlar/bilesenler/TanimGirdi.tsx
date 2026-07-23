import { formInputSinifi } from '@/formlar/FormAlani';
import {
  ALAN_KURALLARI,
  alanDegeriniFiltrele,
  type AlanKuralTipi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';

interface TanimGirdiProps {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  kural?: AlanKuralTipi;
  maxLength?: number;
  zorunlu?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  className?: string;
  autoFocus?: boolean;
}

export function TanimGirdi({
  etiket,
  deger,
  onChange,
  kural = 'serbestMetin',
  maxLength,
  zorunlu,
  placeholder,
  inputMode,
  className,
  autoFocus,
}: TanimGirdiProps) {
  const kuralBilgi = ALAN_KURALLARI[kural];
  const limit = maxLength ?? kuralBilgi.max;
  const sayisal = kural === 'vergiNo' || kural === 'mersis' || kural === 'postaKodu';

  return (
    <label className={`ap-tanim-girdi block ${className ?? ''}`}>
      <span className="ap-tanim-girdi-etiket">
        {etiket}
        {zorunlu ? <span> *</span> : null}
      </span>
      <input
        className={formInputSinifi}
        value={deger}
        autoFocus={autoFocus}
        onChange={(e) => {
          const ham = maxLength != null ? e.target.value.slice(0, limit) : e.target.value;
          onChange(alanDegeriniFiltrele(kural, ham));
        }}
        maxLength={limit}
        required={zorunlu}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize={sayisal ? 'off' : 'characters'}
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        inputMode={inputMode ?? (sayisal ? 'numeric' : 'text')}
      />
    </label>
  );
}
