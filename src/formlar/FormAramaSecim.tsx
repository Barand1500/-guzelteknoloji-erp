import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { formInputSinifi } from '@/formlar/FormAlani';

const KENAR_BOSLUK = 8;
const LISTE_LIMIT = 80;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function normalizeMetin(metin: string): string {
  return metin.trim().toLocaleLowerCase('tr');
}

function secenekleriFiltrele(secenekler: string[], arama: string): string[] {
  const q = normalizeMetin(arama);
  if (!q) return secenekler.slice(0, LISTE_LIMIT);
  return secenekler
    .filter((s) => normalizeMetin(s).startsWith(q))
    .slice(0, LISTE_LIMIT);
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

interface FormAramaSecimProps {
  value: string;
  onChange: (value: string) => void;
  secenekler: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function FormAramaSecim({
  value,
  onChange,
  secenekler,
  placeholder,
  disabled = false,
  'aria-label': ariaLabel,
}: FormAramaSecimProps) {
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const benzersizSecenekler = useMemo(
    () => [...new Set(secenekler.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr')),
    [secenekler]
  );

  const filtrelenmis = useMemo(
    () => secenekleriFiltrele(benzersizSecenekler, value),
    [benzersizSecenekler, value]
  );

  const konumGuncelle = useCallback(() => {
    if (!kapsayiciRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(kapsayiciRef.current);
    setListeStil({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
      zIndex: 10050,
    });
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
    }

    function tusBas(e: KeyboardEvent) {
      if (e.key === 'Escape') setAcik(false);
    }

    document.addEventListener('mousedown', disTik);
    document.addEventListener('keydown', tusBas);
    return () => {
      document.removeEventListener('mousedown', disTik);
      document.removeEventListener('keydown', tusBas);
    };
  }, [acik]);

  const sec = (yeni: string) => {
    onChange(yeni);
    setAcik(false);
    inputRef.current?.focus();
  };

  return (
    <div className="ap-form-arama-secim" ref={kapsayiciRef}>
      <input
        ref={inputRef}
        type="text"
        className={formInputSinifi}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={acik}
        aria-controls={acik ? listeId : undefined}
        onChange={(e) => {
          onChange(e.target.value);
          setAcik(true);
        }}
        onFocus={() => setAcik(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && filtrelenmis.length > 0) {
            e.preventDefault();
            setAcik(true);
          }
          if (e.key === 'Enter' && filtrelenmis.length === 1) {
            e.preventDefault();
            sec(filtrelenmis[0]);
          }
        }}
      />

      {acik && filtrelenmis.length > 0
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className="ap-form-acilir-secim-liste ap-form-arama-secim-liste"
              role="listbox"
              aria-label={ariaLabel}
              style={listeStil}
            >
              {filtrelenmis.map((secenek) => {
                const seciliMi = secenek === value;
                return (
                  <li key={secenek}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={seciliMi}
                      className={`ap-form-acilir-secim-oge${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => sec(secenek)}
                    >
                      {secenek}
                    </button>
                  </li>
                );
              })}
            </ul>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
