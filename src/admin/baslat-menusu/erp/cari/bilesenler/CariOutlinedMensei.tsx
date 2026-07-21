import { useCallback, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { ulkeAra, MIN_ULKE_ARAMA_UZUNLUGU } from '@/veri/ulkeler';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

interface CariOutlinedMenseiProps {
  deger: string;
  onChange: (mensei: string) => void;
  disabled?: boolean;
}

export function CariOutlinedMensei({ deger, onChange, disabled = false }: CariOutlinedMenseiProps) {
  const [focused, setFocused] = useState(false);
  const menseiAra = useCallback((arama: string) => ulkeAra(arama), []);

  const handleChange = useCallback(
    (mensei: string) => onChange(mensei.toLocaleUpperCase('tr')),
    [onChange]
  );

  return (
    <CariOutlinedSarmalayici etiket="Menşei" disabled={disabled}>
      <div
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <FormAramaSecim
          value={deger}
          onChange={handleChange}
          secenekAra={menseiAra}
          minAramaUzunlugu={MIN_ULKE_ARAMA_UZUNLUGU}
          placeholder={focused ? 'En az 2 harf yazın…' : undefined}
          disabled={disabled}
          aria-label="Menşei"
        />
      </div>
    </CariOutlinedSarmalayici>
  );
}
