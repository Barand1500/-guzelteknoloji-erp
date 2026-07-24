import { useId, useState, type ReactNode } from 'react';
import {
  ALAN_KURALLARI,
  alanDegeriniFiltrele,
  type AlanKuralTipi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';

interface CariOutlinedGirdiProps {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  kural?: AlanKuralTipi;
  maxLength?: number;
  zorunlu?: boolean;
  odakPlaceholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  className?: string;
  buyukHarf?: boolean;
  disabled?: boolean;
  onek?: ReactNode;
  sonek?: ReactNode;
  onEnter?: () => void;
}

export function CariOutlinedEtiket({
  etiket,
  zorunlu,
  htmlFor,
  children,
}: {
  etiket: string;
  zorunlu?: boolean;
  htmlFor?: string;
  children?: ReactNode;
}) {
  return (
    <label className="cari-outlined-etiket" htmlFor={htmlFor}>
      <span className="cari-outlined-etiket-metin">
        {etiket}
        {zorunlu ? <span className="cari-outlined-zorunlu"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export function CariOutlinedGirdi({
  etiket,
  deger,
  onChange,
  kural = 'serbestMetin',
  maxLength,
  zorunlu,
  odakPlaceholder,
  inputMode,
  className,
  buyukHarf,
  disabled = false,
  onek,
  sonek,
  onEnter,
}: CariOutlinedGirdiProps) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const kuralBilgi = ALAN_KURALLARI[kural];
  const limit = maxLength ?? kuralBilgi.max;

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''} ${className ?? ''}`.trim()}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div
        className="cari-outlined-cerceve"
        onMouseDown={(e) => {
          const hedef = e.target as HTMLElement;
          /* Sonek/onek içindeki etkileşimli kontroller (PB seçimi vb.) bozulmasın */
          if (
            hedef.closest(
              'button, a, input, select, textarea, [role="button"], [role="combobox"], [role="listbox"], .ap-form-acilir-secim'
            )
          ) {
            return;
          }
          if (hedef.closest('.cari-outlined-onek, .cari-outlined-sonek') || hedef === e.currentTarget) {
            e.preventDefault();
            const girdi = e.currentTarget.querySelector('input.cari-outlined-input');
            girdi?.focus();
          }
        }}
      >
        {onek ? <div className="cari-outlined-onek">{onek}</div> : null}
        <input
          id={inputId}
          className="cari-outlined-input"
          value={deger}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            let sonraki =
              kural === 'serbestMetin'
                ? e.target.value.slice(0, limit)
                : alanDegeriniFiltrele(kural, e.target.value);
            if (buyukHarf) sonraki = sonraki.toLocaleUpperCase('tr');
            onChange(sonraki);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          maxLength={limit}
          required={zorunlu}
          placeholder={focused ? odakPlaceholder : undefined}
          inputMode={
            inputMode ?? (kural === 'vergiNo' || kural === 'mersis' || kural === 'postaKodu' ? 'numeric' : 'text')
          }
        />
        {sonek ? <div className="cari-outlined-sonek">{sonek}</div> : null}
      </div>
    </div>
  );
}

export function CariOutlinedSarmalayici({
  etiket,
  zorunlu,
  disabled,
  className,
  children,
  etiketEk,
}: {
  etiket: string;
  zorunlu?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  etiketEk?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''} ${className ?? ''}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu}>
        {etiketEk}
      </CariOutlinedEtiket>
      <div className="cari-outlined-cerceve cari-outlined-cerceve--icerik">
        <div className="cari-outlined-icerik">{children}</div>
      </div>
    </div>
  );
}
