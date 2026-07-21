import { useEffect, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAdlari, vergiDaireleriListeYukle } from '@/veri/vergiDaireleriApi';
import { MIN_ADRES_ARAMA_UZUNLUGU } from '@/veri/turkiyeIlIlce';

interface VergiDairesiSeciciProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
}

export function VergiDairesiSecici({ deger, onChange }: VergiDairesiSeciciProps) {
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
    <label className="ap-tanimlar-secim-alan block">
      <span className="ap-tanim-girdi-etiket">Vergi Dairesi</span>
      <FormAramaSecim
        value={deger}
        onChange={onChange}
        secenekler={secenekler}
        minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
        placeholder="En az 2 harf yazın…"
        aria-label="Vergi dairesi"
      />
    </label>
  );
}
