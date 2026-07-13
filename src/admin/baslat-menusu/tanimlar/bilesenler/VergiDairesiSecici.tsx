import { useCallback } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAra } from '@/veri/vergiDaireleriApi';

import { MIN_ADRES_ARAMA_UZUNLUGU } from '@/veri/turkiyeIlIlce';

interface VergiDairesiSeciciProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
}

export function VergiDairesiSecici({ deger, onChange }: VergiDairesiSeciciProps) {
  const daireAra = useCallback((arama: string) => vergiDaireleriAra(arama), []);

  return (
    <label className="ap-tanimlar-secim-alan block">
      <span className="ap-tanim-girdi-etiket">Vergi Dairesi</span>
      <FormAramaSecim
        value={deger}
        onChange={onChange}
        secenekAra={daireAra}
        minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
        placeholder="En az 2 harf yazın…"
        aria-label="Vergi dairesi"
      />
    </label>
  );
}
