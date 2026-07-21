import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

const KENAR_BOSLUK = 8;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function listeKonumuHesapla(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const genislik = rect.width;
  let left = rect.left;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  const ust = rect.bottom + 4;
  const maxHeight = Math.max(120, window.innerHeight - ust - KENAR_BOSLUK);
  return { top: ust, left, width: genislik, maxHeight };
}

function normalizeMetin(metin: string) {
  return metin.trim().toLocaleLowerCase('tr');
}

export function CariOutlinedAramaAcilir({
  etiket,
  deger,
  onChange,
  secenekler,
  zorunlu,
  disabled = false,
  onYonet,
  aramaPlaceholder = 'Ara…',
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  zorunlu?: boolean;
  disabled?: boolean;
  onYonet?: () => void;
  aramaPlaceholder?: string;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [focused, setFocused] = useState(false);
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState('');
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const secili = useMemo(
    () => secenekler.find((s) => s.value === deger) ?? null,
    [deger, secenekler]
  );

  const filtrelenmis = useMemo(() => {
    const q = normalizeMetin(arama);
    if (!q) return secenekler;
    return secenekler.filter((s) => normalizeMetin(s.label).includes(q));
  }, [arama, secenekler]);

  const konumGuncelle = useCallback(() => {
    if (!kapsayiciRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(kapsayiciRef.current);
    setListeStil({ position: 'fixed', top, left, width, maxHeight, zIndex: 10050 });
  }, []);

  useLayoutEffect(() => {
    if (!acik) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, konumGuncelle, filtrelenmis.length]);

  useEffect(() => {
    if (!acik) return;
    function disTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (kapsayiciRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
      setAcik(false);
      setArama('');
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik]);

  const sec = (value: string) => {
    onChange(value);
    setAcik(false);
    setArama('');
  };

  return (
    <div
      ref={kapsayiciRef}
      className={`cari-outlined-field cari-arama-acilir${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId}>
        {!disabled && onYonet ? (
          <button
            type="button"
            className="cari-secili-yonet"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onYonet();
            }}
            title={`${etiket} yönet`}
            aria-label={`${etiket} yönet`}
          >
            +
          </button>
        ) : null}
      </CariOutlinedEtiket>
      <div className="cari-outlined-cerceve cari-arama-acilir-cerceve">
        <button
          id={inputId}
          type="button"
          className="cari-arama-acilir-tus"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={acik}
          aria-controls={acik ? listeId : undefined}
          onClick={() => {
            if (disabled) return;
            setAcik((v) => !v);
            if (!acik) setArama('');
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <span className={secili ? 'cari-arama-acilir-deger' : 'cari-arama-acilir-placeholder'}>
            {secili?.label ?? 'Seçiniz…'}
          </span>
          <span className="cari-arama-acilir-ok" aria-hidden>
            ▾
          </span>
        </button>
      </div>

      {acik && !disabled
        ? createPortal(
            <div className="cari-arama-acilir-panel" style={listeStil}>
              <div className="cari-arama-acilir-ara">
                <input
                  type="search"
                  className="cari-arama-acilir-ara-girdi"
                  value={arama}
                  placeholder={aramaPlaceholder}
                  autoFocus
                  onChange={(e) => setArama(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filtrelenmis.length === 1) {
                      e.preventDefault();
                      sec(filtrelenmis[0].value);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setAcik(false);
                      setArama('');
                    }
                  }}
                />
              </div>
              <ul ref={listeRef} id={listeId} className="cari-arama-acilir-liste" role="listbox">
                {filtrelenmis.length === 0 ? (
                  <li className="cari-arama-acilir-bos">Sonuç bulunamadı</li>
                ) : (
                  filtrelenmis.map((s) => (
                    <li key={s.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={s.value === deger}
                        className={`cari-arama-acilir-oge${s.value === deger ? ' cari-arama-acilir-oge--secili' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => sec(s.value)}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
