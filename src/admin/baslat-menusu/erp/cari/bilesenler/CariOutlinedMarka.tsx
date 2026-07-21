import { useCallback, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { markaAra, MIN_MARKA_ARAMA_UZUNLUGU } from '@/veri/markalar';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

interface CariOutlinedMarkaProps {
  deger: string;
  onChange: (marka: string) => void;
  disabled?: boolean;
}

export function CariOutlinedMarka({ deger, onChange, disabled = false }: CariOutlinedMarkaProps) {
  const [focused, setFocused] = useState(false);
  const markaAraCb = useCallback((arama: string) => markaAra(arama), []);
  const handleChange = useCallback(
    (marka: string) => onChange(marka.toLocaleUpperCase('tr')),
    [onChange]
  );

  return (
    <CariOutlinedSarmalayici etiket="Marka" disabled={disabled}>
      <div
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <FormAramaSecim
          value={deger}
          onChange={handleChange}
          secenekAra={markaAraCb}
          minAramaUzunlugu={MIN_MARKA_ARAMA_UZUNLUGU}
          placeholder={focused ? 'En az 2 harf yazın…' : undefined}
          disabled={disabled}
          aria-label="Marka"
        />
      </div>
    </CariOutlinedSarmalayici>
  );
}
