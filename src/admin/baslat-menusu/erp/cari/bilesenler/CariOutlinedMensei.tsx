import { useCallback, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  ulkeAra,
  ulkeBayrakUrl,
  ulkeIsoBul,
  MIN_ULKE_ARAMA_UZUNLUGU,
  MENSEI_ULKELER,
} from '@/veri/ulkeler';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

interface CariOutlinedMenseiProps {
  deger: string;
  onChange: (mensei: string) => void;
  disabled?: boolean;
}

function MenseiBayrak({ iso, className }: { iso: string; className?: string }) {
  return (
    <img
      className={className}
      src={ulkeBayrakUrl(iso, 40)}
      srcSet={`${ulkeBayrakUrl(iso, 80)} 2x`}
      width={20}
      height={15}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

export function CariOutlinedMensei({ deger, onChange, disabled = false }: CariOutlinedMenseiProps) {
  const [focused, setFocused] = useState(false);
  const seciliIso = useMemo(() => ulkeIsoBul(deger), [deger]);

  /** Seçili ülke yazılıyken odaklanınca tüm liste açılsın; yazarken filtrele. */
  const menseiAra = useCallback((arama: string) => {
    if (ulkeIsoBul(arama)) return ulkeAra('');
    return ulkeAra(arama);
  }, []);

  const handleChange = useCallback(
    (mensei: string) => onChange(mensei.toLocaleUpperCase('tr')),
    [onChange]
  );

  const ogeIcerik = useCallback((ad: string) => {
    const iso = ulkeIsoBul(ad);
    return (
      <>
        {iso ? <MenseiBayrak iso={iso} className="cari-mensei-liste-bayrak" /> : null}
        <span className="cari-mensei-liste-ad">{ad}</span>
      </>
    );
  }, []);

  return (
    <CariOutlinedSarmalayici etiket="Menşei" disabled={disabled}>
      <div
        className={`cari-mensei-alan${seciliIso ? ' cari-mensei-alan--bayrakli' : ''}`}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {seciliIso ? <MenseiBayrak iso={seciliIso} className="cari-mensei-secili-bayrak" /> : null}
        <FormAramaSecim
          value={deger}
          onChange={handleChange}
          secenekAra={menseiAra}
          minAramaUzunlugu={MIN_ULKE_ARAMA_UZUNLUGU}
          listeLimit={MENSEI_ULKELER.length}
          placeholder={focused ? 'Ülke ara…' : undefined}
          disabled={disabled}
          aria-label="Menşei"
          ogeIcerik={ogeIcerik}
        />
      </div>
    </CariOutlinedSarmalayici>
  );
}
