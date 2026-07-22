import { useEffect, useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { StokFiyatKdvTipi, StokBarkodTipi } from './fiyatDuzenleTipler';
import { STOK_BARKOD_TIP_SECENEKLERI } from './fiyatDuzenleTipler';
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

export function sayiGosterFormatli(deger: number | null | undefined): string {
  if (deger === null || deger === undefined) return '';
  return deger.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function fiyatHamFiltrele(ham: string): string {
  let sonuc = '';
  let virgulVar = false;
  for (const ch of ham) {
    if (ch >= '0' && ch <= '9') {
      sonuc += ch;
    } else if ((ch === ',' || ch === '.') && !virgulVar) {
      virgulVar = true;
      sonuc += ',';
    }
  }
  return sonuc;
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
  sonek,
  placeholder,
  sagaHizali,
  yuzde,
  formatli,
  onUcNokta,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
  onek?: string;
  sonek?: string;
  placeholder?: string;
  sagaHizali?: boolean;
  /** Yüzde alanı: KDV gibi `% 10`, sağa hizalı */
  yuzde?: boolean;
  /** Blur'da binlik ayırıcılı tr-TR format (ör. 1.234,56) */
  formatli?: boolean;
  /** Sol köşede ⋯ menü */
  onUcNokta?: () => void;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const [ham, setHam] = useState('');
  const gosterilenOnek = yuzde ? undefined : onek;
  const gosterilenSonek = yuzde ? undefined : sonek;

  useEffect(() => {
    if (!focused) {
      setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
    }
  }, [deger, focused]);

  const gosterilenDeger = (() => {
    if (yuzde) {
      if (focused) return ham;
      return sayiGoster(deger);
    }
    if (formatli) {
      if (focused) return ham;
      return sayiGosterFormatli(deger);
    }
    return sayiGoster(deger);
  })();

  const sayiInput = (
    <input
      id={inputId}
      className={`cari-outlined-input${gosterilenOnek ? ' stok-yb-outlined-input--onekli' : ''}${gosterilenSonek ? ' stok-yb-outlined-input--sonekli' : ''}${onUcNokta ? ' stok-yb-outlined-input--uc-nokta' : ''}${yuzde ? ' stok-yb-yuzde-input' : ''}${sagaHizali || yuzde || formatli ? ' cari-outlined-input--saga' : ''}`.trim()}
      inputMode={yuzde ? 'numeric' : 'decimal'}
      placeholder={placeholder}
      value={gosterilenDeger}
      onFocus={() => {
        setFocused(true);
        if (formatli || yuzde) {
          setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
        }
      }}
      onBlur={() => {
        setFocused(false);
        if (yuzde) {
          if (!ham.trim()) {
            onDegistir(null);
            return;
          }
          const sadeceRakam = ham.replace(/\D/g, '');
          onDegistir(sadeceRakam ? Number(sadeceRakam) : null);
          return;
        }
        if (formatli) {
          if (!ham.trim()) {
            onDegistir(null);
            return;
          }
          const n = sayiOku(ham);
          if (n !== null) onDegistir(n);
        }
      }}
      onChange={(e) => {
        const hamGirdi = e.target.value;
        if (yuzde) {
          const sadeceRakam = hamGirdi.replace(/\D/g, '');
          setHam(sadeceRakam);
          if (!sadeceRakam) {
            onDegistir(null);
            return;
          }
          onDegistir(Number(sadeceRakam));
          return;
        }
        if (formatli) {
          const sonraki = fiyatHamFiltrele(hamGirdi);
          setHam(sonraki);
          if (!sonraki.trim()) {
            onDegistir(null);
            return;
          }
          const n = sayiOku(sonraki);
          if (n !== null) onDegistir(n);
          return;
        }
        if (!hamGirdi.trim()) {
          onDegistir(null);
          return;
        }
        const n = sayiOku(hamGirdi);
        if (n !== null) onDegistir(n);
      }}
      aria-label={etiket}
    />
  );

  return (
    <div className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${onUcNokta ? ' cari-outlined-field--ic-uc-nokta' : ''}`.trim()}>
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className={`cari-outlined-cerceve${onUcNokta ? ' cari-outlined-cerceve--ic-uc-nokta' : ''}${yuzde ? ' stok-yb-yuzde-cerceve' : ''}`.trim()}>
        {onUcNokta ? (
          <button
            type="button"
            className="stok-yb-fiyat-uc-nokta stok-yb-fiyat-uc-nokta--ic"
            onClick={onUcNokta}
            title="Ek fiyatlar"
            aria-label={`${etiket} ek fiyatlar`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        ) : null}
        {gosterilenOnek ? (
          <span className="stok-yb-outlined-onek" aria-hidden>
            {gosterilenOnek}
          </span>
        ) : null}
        {yuzde ? (
          <div className="stok-yb-yuzde-grup">
            <span className="stok-yb-yuzde-onek" aria-hidden>
              %
            </span>
            {sayiInput}
          </div>
        ) : (
          sayiInput
        )}
        {gosterilenSonek ? (
          <span className="stok-yb-outlined-sonek" aria-hidden>
            {gosterilenSonek}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CariOutlinedBarkod({
  etiket,
  deger,
  tip,
  onBarkodDegistir,
  onTipDegistir,
  onBarkodModal,
  zorunlu,
}: {
  etiket: string;
  deger: string;
  tip: StokBarkodTipi;
  onBarkodDegistir: (deger: string) => void;
  onTipDegistir: (tip: StokBarkodTipi) => void;
  onBarkodModal: () => void;
  zorunlu?: boolean;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const tipSecenekleri = STOK_BARKOD_TIP_SECENEKLERI.map((s) => ({ value: s.deger, label: s.etiket }));

  const alanOdakIci = (hedef: EventTarget | null) => {
    const kok = hedef as HTMLElement | null;
    return Boolean(kok?.closest?.('.stok-yb-barkod-tip-liste'));
  };

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        const sonraki = e.relatedTarget as Node | null;
        if (sonraki && e.currentTarget.contains(sonraki)) return;
        if (alanOdakIci(sonraki)) return;
        setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve stok-yb-barkod-cerceve">
        <button
          type="button"
          className="stok-yb-barkod-ikon"
          onClick={onBarkodModal}
          title="Ek barkodlar"
          aria-label={`${etiket} ek barkodlar`}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
            <path
              d="M4 6v12M7 6v12M10 4v16M13 7v10M16 5v14M19 8v8M22 6v12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <input
          id={inputId}
          className="cari-outlined-input stok-yb-barkod-input"
          value={deger}
          inputMode="numeric"
          placeholder={focused ? 'Barkod yazınız' : undefined}
          onChange={(e) => onBarkodDegistir(barkodFiltrele(e.target.value))}
          aria-label={etiket}
        />
        <div className="stok-yb-barkod-tip ap-form-acilir-secim-liste-anchor">
          <FormAcilirSecim
            value={tip}
            onChange={(v) => onTipDegistir(v as StokBarkodTipi)}
            secenekler={tipSecenekleri}
            aria-label="Barkod tipi"
            className="stok-yb-barkod-tip-secim"
            listeSinifi="stok-yb-barkod-tip-liste"
            listeAnchor="self"
            listeYonu="yukari"
            listeDikeyBosluk={4}
          />
        </div>
      </div>
    </div>
  );
}

export function CariOutlinedCarpan({
  etiket,
  deger,
  onDegistir,
  zorunlu,
  disabled = false,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
  disabled?: boolean;
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
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`.trim()}
    >
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
          disabled={disabled}
          title={disabled ? 'Ana birimde çarpan her zaman 1 olmalıdır' : undefined}
          value={focused && !disabled ? ham : sayiGoster(deger)}
          onFocus={() => {
            if (disabled) return;
            setFocused(true);
            setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
          }}
          onBlur={() => {
            if (disabled) return;
            setFocused(false);
            const n = sayiOku(ham);
            onDegistir(n !== null && n > 0 ? n : 1);
          }}
          onChange={(e) => {
            if (disabled) return;
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
