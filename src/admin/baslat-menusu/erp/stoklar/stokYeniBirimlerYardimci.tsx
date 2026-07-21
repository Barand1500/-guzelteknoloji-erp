import { useEffect, useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import type { StokFiyatKdvTipi } from './fiyatDuzenleTipler';

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

function carpanHamFiltrele(ham: string): string {
  let sonuc = '';
  let virgulVar = false;
  for (const ch of ham) {
    if (ch >= '0' && ch <= '9') {
      sonuc += ch;
    } else if (ch === ',' && !virgulVar) {
      virgulVar = true;
      sonuc += ch;
    }
  }
  return sonuc;
}

export function CariOutlinedSayi({
  etiket,
  deger,
  onDegistir,
  zorunlu,
  onek,
  placeholder,
  sagaHizali,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
  onek?: string;
  placeholder?: string;
  sagaHizali?: boolean;
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
          className={`cari-outlined-input${onek ? ' stok-yb-outlined-input--onekli' : ''}${sagaHizali ? ' cari-outlined-input--saga' : ''}`.trim()}
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

export function CariOutlinedCarpan({
  etiket,
  deger,
  onDegistir,
  zorunlu,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const [ham, setHam] = useState('');

  useEffect(() => {
    if (!focused) {
      setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
    }
  }, [deger, focused]);

  return (
    <div className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}`.trim()}>
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <span className="stok-yb-outlined-onek" aria-hidden>
          ×
        </span>
        <input
          id={inputId}
          className="cari-outlined-input stok-yb-outlined-input--onekli cari-outlined-input--saga"
          inputMode="decimal"
          placeholder="1"
          value={focused ? ham : sayiGoster(deger)}
          onFocus={() => {
            setFocused(true);
            setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
          }}
          onBlur={() => {
            setFocused(false);
            const n = sayiOku(ham);
            onDegistir(n !== null && n > 0 ? n : 1);
          }}
          onChange={(e) => {
            const sonraki = carpanHamFiltrele(e.target.value);
            setHam(sonraki);
            if (!sonraki.trim()) return;
            const n = sayiOku(sonraki);
            if (n !== null) onDegistir(n);
          }}
          aria-label={etiket}
        />
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
