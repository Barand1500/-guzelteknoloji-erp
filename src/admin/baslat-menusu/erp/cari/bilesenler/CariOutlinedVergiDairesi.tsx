import { useEffect, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAdlari, vergiDaireleriListeYukle } from '@/veri/vergiDaireleriApi';
import { MIN_ADRES_ARAMA_UZUNLUGU } from '@/veri/turkiyeIlIlce';
import {
  VERGI_DAIRELERI_GUNCELLENDI,
  vergiDairesiSecenekleriBirlesik,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiDaireleriOt';
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
  const [apiAdlari, setApiAdlari] = useState<string[]>(() => vergiDaireleriAdlari());
  const [otSurum, setOtSurum] = useState(0);

  useEffect(() => {
    if (apiAdlari.length > 0) return;
    let iptal = false;
    void vergiDaireleriListeYukle().then((liste) => {
      if (!iptal) setApiAdlari(liste);
    });
    return () => {
      iptal = true;
    };
  }, [apiAdlari.length]);

  useEffect(() => {
    const yenile = () => setOtSurum((n) => n + 1);
    window.addEventListener(VERGI_DAIRELERI_GUNCELLENDI, yenile);
    return () => window.removeEventListener(VERGI_DAIRELERI_GUNCELLENDI, yenile);
  }, []);

  const secenekler = useMemo(
    () => vergiDairesiSecenekleriBirlesik(apiAdlari),
    [apiAdlari, otSurum]
  );

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
