import { useEffect, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { vergiDaireleriAdlari, vergiDaireleriListeYukle } from '@/veri/vergiDaireleriApi';
import { MIN_ADRES_ARAMA_UZUNLUGU } from '@/veri/turkiyeIlIlce';
import {
  VERGI_DAIRELERI_GUNCELLENDI,
  vergiDairesiSecenekleriBirlesik,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiDaireleriOt';

interface VergiDairesiSeciciProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
}

export function VergiDairesiSecici({ deger, onChange }: VergiDairesiSeciciProps) {
  const [apiAdlari, setApiAdlari] = useState<string[]>(() => vergiDaireleriAdlari());
  const [otSurum, setOtSurum] = useState(0);

  useEffect(() => {
    let iptal = false;
    void vergiDaireleriListeYukle()
      .then((liste) => {
        if (!iptal) setApiAdlari(liste);
      })
      .catch(() => {
        /* offline / ağ hatası — boş liste kalır */
      });
    return () => {
      iptal = true;
    };
  }, []);

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
    <label className="ap-tanimlar-secim-alan block">
      <span className="ap-tanim-girdi-etiket">Vergi Dairesi</span>
      <FormAramaSecim
        value={deger}
        onChange={(v) => onChange(v.toLocaleUpperCase('tr'))}
        buyukHarf
        secenekler={secenekler}
        minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
        placeholder=""
        aria-label="Vergi dairesi"
      />
    </label>
  );
}
