import { useCallback } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAra } from '@/veri/vergiDaireleriApi';

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
        placeholder="En az 2 harf yazın…"
        aria-label="Vergi dairesi"
      />
    </label>
  );
}
