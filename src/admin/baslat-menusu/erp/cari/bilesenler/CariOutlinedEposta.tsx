import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { epostaOnerileri } from '../cariFormatYardimci';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

const KENAR_BOSLUK = 8;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function listeKonumuHesapla(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const genislik = rect.width;
  let left = rect.left;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) left = window.innerWidth - genislik - KENAR_BOSLUK;
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  const ust = rect.bottom + 4;
  const maxHeight = Math.max(120, window.innerHeight - ust - KENAR_BOSLUK);
  return { top: ust, left, width: genislik, maxHeight };
}

export function CariOutlinedEposta({
  deger,
  onChange,
  disabled = false,
}: {
  deger: string;
  onChange: (deger: string) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [focused, setFocused] = useState(false);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const oneriler = useMemo(() => epostaOnerileri(deger), [deger]);
  const oneriGoster = acik && focused && oneriler.length > 0 && !disabled;

  const konumGuncelle = useCallback(() => {
    if (!kapsayiciRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(kapsayiciRef.current);
    setListeStil({ position: 'fixed', top, left, width, maxHeight, zIndex: 10050 });
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
  }, [oneriGoster, konumGuncelle, oneriler.length]);

  useEffect(() => {
    if (!acik) return;
    function disTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (kapsayiciRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
      setAcik(false);
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik]);

  const sec = (eposta: string) => {
    onChange(eposta);
    setAcik(false);
  };

  return (
    <div
      ref={kapsayiciRef}
      className={`cari-outlined-field cari-eposta-alan${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
    >
      <CariOutlinedEtiket etiket="E-Posta" htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <input
          id={inputId}
          type="email"
          className="cari-outlined-input"
          value={deger}
          disabled={disabled}
          autoComplete="off"
          onFocus={() => {
            setFocused(true);
            setAcik(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={focused ? 'ornek@mail.com' : undefined}
          onChange={(e) => {
            onChange(e.target.value.slice(0, 120));
            setAcik(true);
          }}
        />
      </div>

      {oneriGoster
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className="ap-form-acilir-secim-liste ap-form-arama-secim-liste"
              role="listbox"
              aria-label="E-posta önerileri"
              style={listeStil}
            >
              {oneriler.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    className="ap-form-acilir-secim-oge"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => sec(o)}
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
