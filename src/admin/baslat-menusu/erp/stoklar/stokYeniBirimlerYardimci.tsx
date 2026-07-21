import { useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import type { StokFiyatKdvTipi, StokFiyatPb } from './fiyatDuzenleTipler';

export function sayiOku(ham: string): number | null {
  const t = ham.trim();
  if (!t) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function sayiGoster(deger: number | null | undefined): string {
  if (deger === null || deger === undefined) return '';
  return String(deger).replace('.', ',');
}

export function barkodFiltrele(ham: string): string {
  return ham.replace(/\D/g, '').slice(0, 64);
}

export function CariOutlinedSayi({
  etiket,
  deger,
  onDegistir,
  zorunlu,
  onek,
  placeholder,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
  onek?: string;
  placeholder?: string;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}`.trim()}>
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        {onek ? (
          <span className="stok-yb-outlined-onek" aria-hidden>
            {onek}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`cari-outlined-input${onek ? ' stok-yb-outlined-input--onekli' : ''}`}
          inputMode="decimal"
          placeholder={placeholder}
          value={sayiGoster(deger)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const ham = e.target.value;
            if (!ham.trim()) {
              onDegistir(null);
              return;
            }
            const n = sayiOku(ham);
            if (n !== null) onDegistir(n);
          }}
          aria-label={etiket}
        />
      </div>
    </div>
  );
}

export function CariOutlinedFiyat({
  etiket,
  deger,
  onDegistir,
  pb,
  onPbChange,
  pbSecenekleri,
  zorunlu,
  onek,
  placeholder,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  pb: StokFiyatPb;
  onPbChange: (pb: StokFiyatPb) => void;
  pbSecenekleri: readonly FormAcilirSecimSecenek[];
  zorunlu?: boolean;
  onek?: string;
  placeholder?: string;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field stok-yb-fiyat-alan${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        {onek ? (
          <span className="stok-yb-outlined-onek" aria-hidden>
            {onek}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`cari-outlined-input stok-yb-fiyat-input${onek ? ' stok-yb-outlined-input--onekli' : ''}`}
          inputMode="decimal"
          placeholder={placeholder}
          value={sayiGoster(deger)}
          onChange={(e) => {
            const ham = e.target.value;
            if (!ham.trim()) {
              onDegistir(null);
              return;
            }
            const n = sayiOku(ham);
            if (n !== null) onDegistir(n);
          }}
          aria-label={etiket}
        />
        <div className="cari-outlined-sonek stok-yb-fiyat-pb-sonek ap-form-acilir-secim-liste-anchor">
          <FormAcilirSecim
            value={pb}
            onChange={(v) =>
              onPbChange(v === 'USD' || v === 'EUR' ? v : 'TL')
            }
            secenekler={pbSecenekleri}
            aria-label="Para birimi"
            className="stok-yb-fiyat-pb-secim"
            listeSinifi="stok-yb-fiyat-pb-liste"
            listeAnchor="self"
          />
        </div>
      </div>
    </div>
  );
}

export function MiniToggle({
  acik,
  etiket,
  onChange,
}: {
  acik: boolean;
  etiket: string;
  onChange: (acik: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={acik}
      aria-label={etiket}
      title={etiket}
      onClick={() => onChange(!acik)}
      className={`ap-tanimlar-toggle stok-yb-toggle ${acik ? 'ap-tanimlar-toggle--acik' : ''}`}
    >
      <span className="ap-tanimlar-toggle-dugme" aria-hidden />
    </button>
  );
}

export function CariToggleAlan({
  etiket,
  acik,
  onChange,
}: {
  etiket: string;
  acik: boolean;
  onChange: (acik: boolean) => void;
}) {
  return (
    <div className="cari-durum-alan stok-yb-toggle-alan">
      <span className="cari-secili-etiket">{etiket}</span>
      <div className="cari-durum-icerik">
        <MiniToggle acik={acik} etiket={etiket} onChange={onChange} />
      </div>
    </div>
  );
}

export function KdvTipSegment({
  tip,
  onChange,
}: {
  tip: StokFiyatKdvTipi;
  onChange: (tip: StokFiyatKdvTipi) => void;
}) {
  return (
    <div className="stok-yb-kdv-tip-segment" role="group" aria-label="KDV dahil / hariç">
      <button
        type="button"
        className={`stok-yb-kdv-tip-segment-oge${tip === 'haric' ? ' stok-yb-kdv-tip-segment-oge--aktif' : ''}`}
        onClick={() => onChange('haric')}
      >
        Hariç
      </button>
      <button
        type="button"
        className={`stok-yb-kdv-tip-segment-oge${tip === 'dahil' ? ' stok-yb-kdv-tip-segment-oge--aktif' : ''}`}
        onClick={() => onChange('dahil')}
      >
        Dahil
      </button>
    </div>
  );
}
