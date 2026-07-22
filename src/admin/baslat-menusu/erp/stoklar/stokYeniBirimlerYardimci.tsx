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

/**
 * Canlı/formatlı fiyattan ham değere çevirir.
 * TR formatta `.` binlik, `,` ondalıktır. Formatlı metindeki noktalar
 * ondalık sayılmaz; kullanıcı ondalık için `,` (veya sonda `.`) yazar.
 */
function fiyatHamFiltrele(ham: string): string {
  let t = ham;
  if (!t.includes(',') && t.endsWith('.')) {
    // "564." → kullanıcı ondalık noktası yazmış
    t = `${t.slice(0, -1).replace(/\./g, '')},`;
  } else {
    // Binlik noktalarını at (canlı format veya yapıştırma)
    t = t.replace(/\./g, '');
  }

  let sonuc = '';
  let virgulVar = false;
  for (const ch of t) {
    if (ch >= '0' && ch <= '9') {
      sonuc += ch;
    } else if (ch === ',' && !virgulVar) {
      virgulVar = true;
      sonuc += ',';
    }
  }
  return sonuc;
}

export { fiyatHamFiltrele };

export function sayiGosterCanli(ham: string): string {
  const filtre = fiyatHamFiltrele(ham);
  if (!filtre) return '';

  const virgulIdx = filtre.indexOf(',');
  let tamKisim = virgulIdx >= 0 ? filtre.slice(0, virgulIdx) : filtre;
  const ondalikKisim = virgulIdx >= 0 ? filtre.slice(virgulIdx + 1) : '';

  if (tamKisim.length > 1) {
    tamKisim = tamKisim.replace(/^0+/, '') || '0';
  }

  const formatliTam =
    tamKisim === ''
      ? '0'
      : Number(tamKisim).toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  if (virgulIdx < 0) return formatliTam;
  if (filtre.endsWith(',')) return `${formatliTam},`;
  return `${formatliTam},${ondalikKisim}`;
}

export function fiyatImlecSolRakamSayisi(metin: string, konum: number): number {
  let n = 0;
  const sinir = Math.min(konum, metin.length);
  for (let i = 0; i < sinir; i += 1) {
    const ch = metin[i];
    if (ch >= '0' && ch <= '9') n += 1;
  }
  return n;
}

export function fiyatImlecKonumu(metin: string, solRakamSayisi: number): number {
  if (solRakamSayisi <= 0) return 0;
  let rakam = 0;
  for (let i = 0; i < metin.length; i += 1) {
    const ch = metin[i];
    if (ch >= '0' && ch <= '9') {
      rakam += 1;
      if (rakam >= solRakamSayisi) return i + 1;
    }
  }
  return metin.length;
}

/** "20+20+10" gibi bileşik iskonto; sadece rakam, virgül/nokta ve + */
export function iskontoHamFiltrele(ham: string): string {
  let sonuc = '';
  let sonArtı = true;
  let virgulVar = false;
  for (const ch of ham) {
    if (ch >= '0' && ch <= '9') {
      sonuc += ch;
      sonArtı = false;
    } else if ((ch === ',' || ch === '.') && !virgulVar && !sonArtı) {
      sonuc += ',';
      virgulVar = true;
      sonArtı = false;
    } else if (ch === '+' && !sonArtı) {
      sonuc += '+';
      sonArtı = true;
      virgulVar = false;
    }
  }
  return sonuc;
}

function iskontoOranlari(ham: string | null | undefined): number[] {
  if (!ham?.trim()) return [];
  return ham
    .split('+')
    .map((p) => Number(p.trim().replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

/** Bileşik iskonto: 100, "20+20" → 64 (önce %20, sonra kalan üzerinden %20) */
export function netFiyatHesapla(
  fiyat: number | null | undefined,
  iskonto: string | number | null | undefined
): number | null {
  if (fiyat === null || fiyat === undefined) return null;
  const oranlar =
    typeof iskonto === 'number'
      ? Number.isFinite(iskonto) && iskonto >= 0
        ? [iskonto]
        : []
      : iskontoOranlari(iskonto);
  let n = fiyat;
  for (const oran of oranlar) {
    n *= 1 - oran / 100;
  }
  return Math.round(n * 10000) / 10000;
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

export function CariOutlinedOlcu({
  tur,
  birim,
  deger,
  onBirimDegistir,
  onDegerDegistir,
  onHesapModal,
}: {
  /** Üst satır: ağırlık — Alt satır: hacim (sabit) */
  tur: 'agirlik' | 'hacim';
  birim: 'g' | 'kg' | 'desi' | '';
  deger: number | null | undefined;
  onBirimDegistir: (birim: 'g' | 'kg' | 'desi') => void;
  onDegerDegistir: (deger: number | null) => void;
  onHesapModal: () => void;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const [ham, setHam] = useState('');

  const etiket = tur === 'hacim' ? 'Hacim' : 'Ağırlık';
  const aktifBirim = tur === 'hacim' ? 'desi' : birim === 'g' ? 'g' : 'kg';

  useEffect(() => {
    if (!focused) setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
  }, [deger, focused]);

  const alanOdakIci = (hedef: EventTarget | null) => {
    const kok = hedef as HTMLElement | null;
    return Boolean(kok?.closest?.('.stok-yb-olcu-birim-liste'));
  };

  return (
    <div
      className={`cari-outlined-field stok-yb-olcu-alan${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        const sonraki = e.relatedTarget as Node | null;
        if (sonraki && e.currentTarget.contains(sonraki)) return;
        if (alanOdakIci(sonraki)) return;
        setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket={etiket} htmlFor={inputId} />
      <div className="cari-outlined-cerceve stok-yb-olcu-cerceve">
        <button
          type="button"
          className="stok-yb-olcu-hesap-btn"
          onClick={onHesapModal}
          title="Hesapla"
          aria-label={`${etiket} hesapla`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
            <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 8h8M8 12h8M8 16h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <input
          id={inputId}
          className="cari-outlined-input stok-yb-olcu-input cari-outlined-input--saga"
          inputMode="decimal"
          value={focused ? ham : sayiGoster(deger)}
          placeholder={focused ? '0' : undefined}
          onFocus={() => {
            setFocused(true);
            setHam(deger !== null && deger !== undefined ? sayiGoster(deger) : '');
          }}
          onBlur={() => {
            setFocused(false);
            if (!ham.trim()) {
              onDegerDegistir(null);
              return;
            }
            onDegerDegistir(sayiOku(ham));
          }}
          onChange={(e) => {
            const sonraki = e.target.value.replace(/[^\d.,]/g, '');
            setHam(sonraki);
            if (!sonraki.trim()) {
              onDegerDegistir(null);
              return;
            }
            onDegerDegistir(sayiOku(sonraki));
          }}
          aria-label={etiket}
        />
        <div className="stok-yb-olcu-birim ap-form-acilir-secim-liste-anchor">
          {tur === 'hacim' ? (
            <span className="stok-yb-olcu-birim-sabit" aria-label="Birim desi">
              desi
            </span>
          ) : (
            <FormAcilirSecim
              value={aktifBirim}
              onChange={(v) => onBirimDegistir(v === 'g' ? 'g' : 'kg')}
              secenekler={[
                { value: 'kg', label: 'kg' },
                { value: 'g', label: 'g' },
              ]}
              aria-label="Ağırlık birimi"
              className="stok-yb-olcu-birim-secim"
              listeSinifi="stok-yb-olcu-birim-liste"
              listeAnchor="self"
              listeYonu="yukari"
              listeDikeyBosluk={4}
              listeMinGenislik={56}
              tusMetin={aktifBirim}
            />
          )}
        </div>
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
        className={`stok-yb-kdv-tip-segment-oge${tip === 'haric' ? ' stok-yb-kdv-tip-segment-oge--aktif stok-yb-kdv-tip-segment-oge--haric' : ''}`}
        onClick={() => onChange('haric')}
      >
        Hariç
      </button>
      <button
        type="button"
        className={`stok-yb-kdv-tip-segment-oge${tip === 'dahil' ? ' stok-yb-kdv-tip-segment-oge--aktif stok-yb-kdv-tip-segment-oge--dahil' : ''}`}
        onClick={() => onChange('dahil')}
      >
        Dahil
      </button>
    </div>
  );
}
