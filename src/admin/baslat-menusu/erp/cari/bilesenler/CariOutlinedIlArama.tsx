import { useCallback, useId, useMemo, useState } from 'react';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  MIN_ADRES_ARAMA_UZUNLUGU,
  turkiyeIlAdlari,
  turkiyeIlAdiniDuzelt,
  turkiyeIlceAra,
  turkiyeIlceOnbellekYukle,
  turkiyeIlKayitliMi,
} from '@/veri/turkiyeIlIlce';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

export function CariOutlinedIl({
  deger,
  onChange,
  disabled = false,
}: {
  deger: string;
  onChange: (il: string) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const secenekler = useMemo(() => turkiyeIlAdlari(), []);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket="İl" htmlFor={inputId} />
      <div className="cari-outlined-cerceve cari-outlined-cerceve--icerik">
        <div className="cari-outlined-icerik">
          <FormAramaSecim
            value={deger}
            onChange={(il) => {
              const kanonik = turkiyeIlKayitliMi(il) ? turkiyeIlAdiniDuzelt(il) : il;
              if (kanonik !== deger) void turkiyeIlceOnbellekYukle(kanonik);
              onChange(kanonik);
            }}
            onSecildi={(il) => {
              const duzeltilmis = turkiyeIlAdiniDuzelt(il);
              void turkiyeIlceOnbellekYukle(duzeltilmis);
              onChange(duzeltilmis);
            }}
            secenekler={secenekler}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            placeholder={focused ? 'En az 2 harf yazın…' : undefined}
            disabled={disabled}
            aria-label="İl"
          />
        </div>
      </div>
    </div>
  );
}

export function CariOutlinedIlce({
  deger,
  il,
  onChange,
  disabled = false,
}: {
  deger: string;
  il: string;
  onChange: (ilce: string) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const ilSecildi = turkiyeIlKayitliMi(il);

  const ilceAra = useCallback((arama: string) => turkiyeIlceAra(il, arama), [il]);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket="İlçe" htmlFor={inputId} />
      <div className="cari-outlined-cerceve cari-outlined-cerceve--icerik">
        <div className="cari-outlined-icerik">
          <FormAramaSecim
            value={deger}
            onChange={onChange}
            secenekAra={ilSecildi ? ilceAra : undefined}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            placeholder={
              focused
                ? ilSecildi
                  ? 'En az 2 harf yazın…'
                  : 'Önce il seçin'
                : undefined
            }
            disabled={disabled || !ilSecildi}
            aria-label="İlçe"
          />
        </div>
      </div>
    </div>
  );
}
