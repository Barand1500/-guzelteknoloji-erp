import { useEffect, useRef, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import {
  metinSayiGoster,
  metinSayiKabul,
  metinSayiParse,
  type MetinSayiTipi,
} from '@/admin/baslat-menusu/menu-tanimlari/sayiGirdi';

interface MetinSayiHucreProps {
  deger: number;
  senkronAnahtar: string;
  onDegistir: (sayi: number) => void;
  tip?: MetinSayiTipi;
  disabled?: boolean;
  className?: string;
}

export function MetinSayiHucre({
  deger,
  senkronAnahtar,
  onDegistir,
  tip = 'isaretli-ondalik',
  disabled = false,
  className = '',
}: MetinSayiHucreProps) {
  const [metin, setMetin] = useState(() => metinSayiGoster(deger, tip));
  const [uyari, setUyari] = useState(false);
  const oncekiAnahtar = useRef(senkronAnahtar);

  useEffect(() => {
    if (oncekiAnahtar.current !== senkronAnahtar) {
      oncekiAnahtar.current = senkronAnahtar;
      setMetin(metinSayiGoster(deger, tip));
      setUyari(false);
    }
  }, [senkronAnahtar, deger, tip]);

  return (
    <div className="ap-menu-tanim-sayi-hucre">
      <input
        type="text"
        inputMode="decimal"
        className={`${formInputSinifi} ${className}`.trim()}
        value={metin}
        disabled={disabled}
        title={uyari ? 'Sadece sayı girebilirsiniz' : undefined}
        aria-invalid={uyari}
        onChange={(e) => {
          const ham = e.target.value;
          if (!metinSayiKabul(ham, tip)) {
            setUyari(true);
            return;
          }
          setUyari(false);
          setMetin(ham);
          onDegistir(metinSayiParse(ham, tip));
        }}
      />
      {uyari ? <span className="ap-menu-tanim-sayi-uyari ap-menu-tanim-sayi-uyari-kucuk">Geçersiz</span> : null}
    </div>
  );
}
