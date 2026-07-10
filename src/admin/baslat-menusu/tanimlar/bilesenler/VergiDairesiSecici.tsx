import { useEffect, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  TUM_VERGI_DAIRELERI,
  TURKIYE_IL_ADLARI,
  TURKIYE_ILLERI,
  vergiDaireleriIlIle,
  vergiDairesiIlBul,
} from '@/admin/baslat-menusu/tanimlar/veri/vergiDaireleriVeri';

interface VergiDairesiSeciciProps {
  deger: string;
  onChange: (vergiDairesi: string) => void;
}

function ilAdindanPlaka(ilAd: string): string {
  const anahtar = ilAd.trim();
  if (!anahtar) return '';
  const tam = TURKIYE_ILLERI.find((il) => il.ad === anahtar);
  if (tam) return tam.plaka;
  const eslesen = TURKIYE_ILLERI.find(
    (il) => il.ad.toLocaleLowerCase('tr') === anahtar.toLocaleLowerCase('tr')
  );
  return eslesen?.plaka ?? '';
}

function plakadanIlAd(plaka: string): string {
  return TURKIYE_ILLERI.find((il) => il.plaka === plaka)?.ad ?? '';
}

export function VergiDairesiSecici({ deger, onChange }: VergiDairesiSeciciProps) {
  const [ilAd, setIlAd] = useState(() => plakadanIlAd(vergiDairesiIlBul(deger)));

  useEffect(() => {
    if (deger) {
      const plaka = vergiDairesiIlBul(deger);
      if (plaka) setIlAd(plakadanIlAd(plaka));
    }
  }, [deger]);

  const ilPlaka = useMemo(() => ilAdindanPlaka(ilAd), [ilAd]);

  const daireSecenekleri = useMemo(() => {
    if (ilPlaka) return vergiDaireleriIlIle(ilPlaka);
    return TUM_VERGI_DAIRELERI;
  }, [ilPlaka]);

  return (
    <div className="grid gap-3 md:grid-cols-2 md:items-end">
      <label className="block">
        <span className="ap-muted mb-1 block text-xs">İl (vergi dairesi filtresi)</span>
        <FormAramaSecim
          value={ilAd}
          onChange={(yeniIl) => {
            setIlAd(yeniIl);
            const yeniPlaka = ilAdindanPlaka(yeniIl);
            if (deger && yeniPlaka && vergiDairesiIlBul(deger) !== yeniPlaka) {
              onChange('');
            }
          }}
          secenekler={TURKIYE_IL_ADLARI}
          placeholder="Yazın veya listeden seçin"
          aria-label="İl filtresi"
        />
      </label>
      <label className="block">
        <span className="ap-muted mb-1 block text-xs">Vergi Dairesi</span>
        <FormAramaSecim
          value={deger}
          onChange={onChange}
          secenekler={daireSecenekleri}
          placeholder="Yazın veya listeden seçin"
          aria-label="Vergi dairesi"
        />
      </label>
    </div>
  );
}
