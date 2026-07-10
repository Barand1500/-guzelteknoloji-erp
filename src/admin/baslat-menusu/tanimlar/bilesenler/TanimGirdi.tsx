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
  buyukHarf?: boolean;
  aciklamaGoster?: boolean;
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
  buyukHarf,
  aciklamaGoster = true,
}: TanimGirdiProps) {
  const kuralBilgi = ALAN_KURALLARI[kural];
  const limit = maxLength ?? kuralBilgi.max;

  return (
    <label className={`block ${className ?? ''}`}>
      <span className="ap-muted mb-1 block text-xs">
        {etiket}
        {zorunlu ? ' *' : ''}
      </span>
      {aciklamaGoster && kuralBilgi.aciklama && (
        <span className="ap-muted mb-1 block text-[10px] leading-snug opacity-80">
          {kuralBilgi.aciklama}
        </span>
      )}
      <input
        className={formInputSinifi}
        value={deger}
        onChange={(e) => {
          let sonraki = kural === 'serbestMetin' ? e.target.value.slice(0, limit) : alanDegeriniFiltrele(kural, e.target.value);
          if (buyukHarf) sonraki = sonraki.toUpperCase();
          onChange(sonraki);
        }}
        maxLength={limit}
        required={zorunlu}
        placeholder={placeholder}
        inputMode={inputMode ?? (kural === 'vergiNo' || kural === 'mersis' || kural === 'postaKodu' ? 'numeric' : 'text')}
      />
    </label>
  );
}
