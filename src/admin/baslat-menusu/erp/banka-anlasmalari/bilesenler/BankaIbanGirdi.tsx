import { useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import type { BankaIbanModu } from '../tipler';

/** TR gövdesi: ülke kodu hariç 24 karakter (toplam TR + 24 = 26) */
const TR_GOVDE_MAX = 24;

function trGovdeTemizle(deger: string): string {
  return deger
    .replace(/^TR/i, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, TR_GOVDE_MAX);
}

function yabanciTemizle(deger: string): string {
  return deger.replace(/\s+/g, '').toUpperCase().slice(0, 34);
}

export function BankaIbanGirdi({
  deger,
  mod,
  disabled,
  onChange,
  onModChange,
}: {
  deger: string;
  mod: BankaIbanModu;
  disabled?: boolean;
  onChange: (iban: string) => void;
  onModChange: (mod: BankaIbanModu) => void;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const trGovde = trGovdeTemizle(deger);
  const gosterilen = mod === 'TR' ? trGovde : deger;

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''} ba-iban-alan`.trim()}
    >
      <CariOutlinedEtiket etiket="IBAN" htmlFor={inputId}>
        {!disabled ? (
          <button
            type="button"
            className="ba-iban-mod-tus"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const sonraki: BankaIbanModu = mod === 'TR' ? 'YABANCI' : 'TR';
              onModChange(sonraki);
              if (sonraki === 'TR') onChange(trGovdeTemizle(deger));
              else onChange(yabanciTemizle(deger.startsWith('TR') ? deger : `TR${deger}`));
            }}
            title={mod === 'TR' ? 'Yabancı IBAN kullan' : 'Türkiye IBAN kullan'}
            aria-label={mod === 'TR' ? 'Yabancı IBAN’a geç' : 'TR IBAN’a geç'}
          >
            {mod === 'TR' ? 'Yabancı' : 'TR'}
          </button>
        ) : null}
      </CariOutlinedEtiket>
      <div className="cari-outlined-cerceve ba-iban-cerceve">
        {mod === 'TR' ? (
          <span className="ba-iban-onek" aria-hidden>
            TR
          </span>
        ) : null}
        <input
          id={inputId}
          className={`cari-outlined-input${mod === 'TR' ? ' ba-iban-input--onekli' : ''}`}
          value={gosterilen}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            if (mod === 'TR') onChange(trGovdeTemizle(e.target.value));
            else onChange(yabanciTemizle(e.target.value));
          }}
          maxLength={mod === 'TR' ? TR_GOVDE_MAX : 34}
          placeholder={focused ? (mod === 'TR' ? '0000 0000 0000 0000 0000 0000' : 'Ülke kodu + IBAN') : undefined}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          aria-label={mod === 'TR' ? 'IBAN (TR)' : 'Yabancı IBAN'}
        />
        {mod === 'TR' ? (
          <span className="cari-outlined-sonek cari-outlined-sayac" aria-hidden>
            {trGovde.length}/{TR_GOVDE_MAX}
          </span>
        ) : null}
      </div>
    </div>
  );
}
