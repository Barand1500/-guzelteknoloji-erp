import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { ilAdindanPlaka, turkiyeIlAdiniPlakadanYukle, turkiyeIlAra } from '@/veri/turkiyeIlIlce';
import { vergiDaireleriAra, vergiDairesiPlakaBul } from '@/veri/vergiDaireleriApi';

interface VergiDairesiSeciciProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
}

export function VergiDairesiSecici({ deger, onChange }: VergiDairesiSeciciProps) {
  const [ilAd, setIlAd] = useState('');

  useEffect(() => {
    if (!deger) return;
    let iptal = false;
    vergiDairesiPlakaBul(deger).then((plaka) => {
      if (iptal || !plaka) return;
      turkiyeIlAdiniPlakadanYukle(plaka).then((ad) => {
        if (!iptal && ad) setIlAd(ad);
      });
    });
    return () => {
      iptal = true;
    };
  }, [deger]);

  const ilPlaka = useMemo(() => ilAdindanPlaka(ilAd), [ilAd]);

  const daireAra = useCallback(
    (arama: string) => vergiDaireleriAra(arama, ilPlaka || undefined),
    [ilPlaka]
  );

  return (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İl (vergi dairesi filtresi)</span>
        <FormAramaSecim
          value={ilAd}
          onChange={(yeniIl) => {
            setIlAd(yeniIl);
            const yeniPlaka = ilAdindanPlaka(yeniIl);
            if (deger && yeniPlaka && ilPlaka && yeniPlaka !== ilPlaka) {
              onChange('');
            }
          }}
          secenekAra={turkiyeIlAra}
          placeholder="En az 2 harf yazın…"
          aria-label="İl filtresi"
        />
      </label>
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
    </div>
  );
}
