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
const ARAMA_GECIKME_MS = 80;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function normalizeMetin(metin: string): string {
  return metin.trim().toLocaleLowerCase('tr');
}

function secenekleriFiltrele(secenekler: string[], arama: string, minAramaUzunlugu: number): string[] {
  const q = normalizeMetin(arama);
  if (q.length < minAramaUzunlugu) return [];
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
  onSecildi?: (value: string) => void;
  secenekler?: readonly string[];
  secenekAra?: (arama: string) => Promise<string[]>;
  minAramaUzunlugu?: number;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function FormAramaSecim({
  value,
  onChange,
  onSecildi,
  secenekler = [],
  secenekAra,
  minAramaUzunlugu = 2,
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
  const [asyncSecenekler, setAsyncSecenekler] = useState<string[]>([]);
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);
  const aramaSurumuRef = useRef(0);

  const benzersizSecenekler = useMemo(
    () => [...new Set(secenekler.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr')),
    [secenekler]
  );

  useEffect(() => {
    if (!secenekAra) return;

    const q = value.trim();
    if (q.length < minAramaUzunlugu) {
      setAsyncSecenekler([]);
      setAramaYukleniyor(false);
      return;
    }

    let iptal = false;
    const surum = ++aramaSurumuRef.current;
    setAramaYukleniyor(true);
    const zamanlayici = window.setTimeout(() => {
      secenekAra(q)
        .then((liste) => {
          if (!iptal && surum === aramaSurumuRef.current) setAsyncSecenekler(liste);
        })
        .catch(() => {
          if (!iptal && surum === aramaSurumuRef.current) setAsyncSecenekler([]);
        })
        .finally(() => {
          if (!iptal && surum === aramaSurumuRef.current) setAramaYukleniyor(false);
        });
    }, ARAMA_GECIKME_MS);

    return () => {
      iptal = true;
      window.clearTimeout(zamanlayici);
    };
  }, [value, secenekAra, minAramaUzunlugu]);

  const filtrelenmis = useMemo(() => {
    if (secenekAra) return asyncSecenekler;
    return secenekleriFiltrele(benzersizSecenekler, value, minAramaUzunlugu);
  }, [secenekAra, asyncSecenekler, benzersizSecenekler, value, minAramaUzunlugu]);

  const oneriGoster = acik && value.trim().length >= minAramaUzunlugu && (aramaYukleniyor || filtrelenmis.length > 0);

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
    if (!oneriGoster) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [oneriGoster, konumGuncelle, filtrelenmis.length, aramaYukleniyor]);

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
    onSecildi?.(yeni);
    setAcik(false);
    inputRef.current?.focus();
  };

  const alanAc = () => {
    if (value.trim().length >= minAramaUzunlugu) setAcik(true);
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
        aria-expanded={oneriGoster}
        aria-controls={oneriGoster ? listeId : undefined}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length >= minAramaUzunlugu) setAcik(true);
          else setAcik(false);
        }}
        onFocus={alanAc}
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

      {oneriGoster
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className="ap-form-acilir-secim-liste ap-form-arama-secim-liste"
              role="listbox"
              aria-label={ariaLabel}
              style={listeStil}
            >
              {aramaYukleniyor ? (
                <li className="ap-form-arama-secim-bos">Aranıyor…</li>
              ) : (
                filtrelenmis.map((secenek) => {
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
                })
              )}
            </ul>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
