import { useEffect, useRef, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import {
  metinSayiGoster,
  metinSayiKabul,
  metinSayiParse,
  type MetinSayiTipi,
} from '@/admin/baslat-menusu/menu-tanimlari/sayiGirdi';

interface MetinSayiAlaniProps {
  etiket?: string;
  deger: number;
  senkronAnahtar?: string | number;
  onDegistir: (sayi: number) => void;
  tip?: MetinSayiTipi;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  minTam?: number;
}

export function MetinSayiAlani({
  etiket,
  deger,
  senkronAnahtar = '',
  onDegistir,
  tip = 'ondalik',
  disabled = false,
  className = '',
  inputClassName = '',
  minTam = 1,
}: MetinSayiAlaniProps) {
  const [metin, setMetin] = useState(() => metinSayiGoster(deger, tip));
  const [uyari, setUyari] = useState('');
  const oncekiAnahtar = useRef(senkronAnahtar);

  useEffect(() => {
    if (oncekiAnahtar.current !== senkronAnahtar) {
      oncekiAnahtar.current = senkronAnahtar;
      setMetin(metinSayiGoster(deger, tip));
      setUyari('');
    }
  }, [senkronAnahtar, deger, tip]);

  const inputMode = tip === 'tam' ? 'numeric' : 'decimal';

  const degistir = (ham: string) => {
    if (!metinSayiKabul(ham, tip)) {
      setUyari('Sadece sayı girebilirsiniz');
      return;
    }
    setUyari('');
    setMetin(ham);
    let sayi = metinSayiParse(ham, tip);
    if (tip === 'tam' && ham !== '' && sayi < minTam) sayi = minTam;
    onDegistir(sayi);
  };

  return (
    <label className={className || 'ap-menu-tanim-alan'}>
      {etiket ? <span className="ap-menu-tanim-etiket">{etiket}</span> : null}
      <input
        type="text"
        inputMode={inputMode}
        className={`${formInputSinifi} ${inputClassName}`.trim()}
        value={metin}
        disabled={disabled}
        onChange={(e) => degistir(e.target.value)}
      />
      {uyari ? <span className="ap-menu-tanim-sayi-uyari">{uyari}</span> : null}
    </label>
  );
}
