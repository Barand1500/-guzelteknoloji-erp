import { useCallback, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAra } from '@/veri/vergiDaireleriApi';
import { MIN_ADRES_ARAMA_UZUNLUGU } from '@/veri/turkiyeIlIlce';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

interface CariOutlinedVergiDairesiProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
  disabled?: boolean;
}

export function CariOutlinedVergiDairesi({
  deger,
  onChange,
  disabled = false,
}: CariOutlinedVergiDairesiProps) {
  const [focused, setFocused] = useState(false);
  const daireAra = useCallback((arama: string) => vergiDaireleriAra(arama), []);

  return (
    <CariOutlinedSarmalayici etiket="Vergi Dairesi" disabled={disabled}>
      <div
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <FormAramaSecim
          value={deger}
          onChange={onChange}
          secenekAra={daireAra}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          placeholder={focused ? 'En az 2 harf yazın…' : undefined}
          disabled={disabled}
          aria-label="Vergi dairesi"
        />
      </div>
    </CariOutlinedSarmalayici>
  );
}
