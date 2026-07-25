import type { ReactNode } from 'react';
import {
  CariOutlinedGirdi,
  CariOutlinedSarmalayici,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { OtAcilirSecim } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtAcilirSecim';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';

/** Border üstünde etiketli metin alanı (İl / İlçe tarzı) */
export function OtOutlinedGirdi({
  etiket,
  deger,
  onChange,
  zorunlu,
  disabled,
  maxLength,
  buyukHarf,
  odakPlaceholder,
  className,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  zorunlu?: boolean;
  disabled?: boolean;
  maxLength?: number;
  buyukHarf?: boolean;
  odakPlaceholder?: string;
  className?: string;
}) {
  return (
    <CariOutlinedGirdi
      etiket={etiket}
      deger={deger}
      onChange={onChange}
      zorunlu={zorunlu}
      disabled={disabled}
      maxLength={maxLength}
      buyukHarf={buyukHarf}
      odakPlaceholder={odakPlaceholder}
      className={className}
    />
  );
}

/** Border üstünde etiketli sayı alanı */
export function OtOutlinedSayi({
  etiket,
  deger,
  onChange,
  zorunlu,
  disabled,
  step = 'any',
  min,
  max,
  className,
  etiketEk,
}: {
  etiket: string;
  deger: number | string;
  onChange: (v: number) => void;
  zorunlu?: boolean;
  disabled?: boolean;
  step?: string | number;
  min?: number;
  max?: number;
  className?: string;
  etiketEk?: ReactNode;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      disabled={disabled}
      className={className}
      etiketEk={etiketEk}
    >
      <input
        type="number"
        className="cari-outlined-input"
        value={deger}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        required={zorunlu}
        readOnly={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </CariOutlinedSarmalayici>
  );
}

/** Sabit görünümlü yıl — yan oklarla artır/azalt */
export function OtOutlinedYil({
  etiket,
  deger,
  onChange,
  min,
  max,
  disabled,
  className,
}: {
  etiket: string;
  deger: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
  className?: string;
}) {
  const sinirla = (yil: number) => Math.min(max, Math.max(min, yil));
  const yil = sinirla(deger);
  const azalt = () => {
    if (!disabled && yil > min) onChange(yil - 1);
  };
  const artir = () => {
    if (!disabled && yil < max) onChange(yil + 1);
  };

  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      disabled={disabled}
      className={`ot-outlined-yil${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        className="ot-outlined-yil-ok"
        aria-label={`${etiket} azalt`}
        disabled={disabled || yil <= min}
        onClick={azalt}
      >
        ‹
      </button>
      <span className="ot-outlined-yil-deger" aria-live="polite">
        {yil}
      </span>
      <button
        type="button"
        className="ot-outlined-yil-ok"
        aria-label={`${etiket} artır`}
        disabled={disabled || yil >= max}
        onClick={artir}
      >
        ›
      </button>
    </CariOutlinedSarmalayici>
  );
}

/** Border üstünde etiketli tarih alanı */
export function OtOutlinedTarih({
  etiket,
  deger,
  onChange,
  zorunlu,
  min,
  className,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  zorunlu?: boolean;
  min?: string;
  className?: string;
}) {
  return (
    <CariOutlinedSarmalayici etiket={etiket} zorunlu={zorunlu} className={className}>
      <input
        type="date"
        className="cari-outlined-input"
        value={deger}
        min={min}
        required={zorunlu}
        onChange={(e) => onChange(e.target.value)}
      />
    </CariOutlinedSarmalayici>
  );
}

/** Border üstünde etiketli aranabilir açılır seçim */
export function OtOutlinedAcilir({
  etiket,
  deger,
  onChange,
  secenekler,
  zorunlu,
  disabled,
  className,
  bosEtiket,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  zorunlu?: boolean;
  disabled?: boolean;
  className?: string;
  bosEtiket?: string;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      disabled={disabled}
      className={`cari-outlined-acilir${className ? ` ${className}` : ''}`.trim()}
    >
      <OtAcilirSecim
        value={deger}
        onChange={onChange}
        secenekler={secenekler}
        disabled={disabled}
        aria-label={etiket}
        className="cari-outlined-acilir-tus"
        bosEtiket={bosEtiket}
      />
    </CariOutlinedSarmalayici>
  );
}

/** Border üstünde etiketli serbest içerik (görsel, renk, checkbox…) */
export function OtOutlinedAlan({
  etiket,
  zorunlu,
  disabled,
  className,
  etiketEk,
  children,
}: {
  etiket: string;
  zorunlu?: boolean;
  disabled?: boolean;
  className?: string;
  etiketEk?: ReactNode;
  children: ReactNode;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      disabled={disabled}
      className={className}
      etiketEk={etiketEk}
    >
      {children}
    </CariOutlinedSarmalayici>
  );
}
