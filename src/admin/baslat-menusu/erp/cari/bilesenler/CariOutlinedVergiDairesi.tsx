import { useEffect, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAdlari, vergiDaireleriListeYukle } from '@/veri/vergiDaireleriApi';
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
  const [secenekler, setSecenekler] = useState<string[]>(() => vergiDaireleriAdlari());

  useEffect(() => {
    if (secenekler.length > 0) return;
    let iptal = false;
    void vergiDaireleriListeYukle().then((liste) => {
      if (!iptal) setSecenekler(liste);
    });
    return () => {
      iptal = true;
    };
  }, [secenekler.length]);

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
          secenekler={secenekler}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          placeholder={focused ? 'En az 2 harf yazın…' : undefined}
          disabled={disabled}
          aria-label="Vergi dairesi"
        />
      </div>
    </CariOutlinedSarmalayici>
  );
}
