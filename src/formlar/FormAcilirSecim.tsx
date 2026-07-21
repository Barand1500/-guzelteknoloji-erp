import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { formSelectSinifi } from '@/formlar/FormAlani';
import {
  sekmeGecisTiklamasiMi,
  sekmePortalHedefi,
  useSekmeDegisinceYenile,
} from '@/araclar/sekmePortal';

export interface FormAcilirSecimSecenek {
  value: string;
  label: string;
}

interface FormAcilirSecimProps {
  value: string;
  onChange: (value: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  className?: string;
  listeSinifi?: string;
  listeMinGenislik?: number;
  listeAnchor?: 'self' | 'cerceve';
  /** Tetikleyici ile liste arası dikey boşluk (px). 0 = bitişik */
  listeDikeyBosluk?: number;
  disabled?: boolean;
  'aria-label'?: string;
}

const KENAR_BOSLUK = 8;

function anchorBul(trigger: HTMLElement, listeAnchor: 'self' | 'cerceve'): HTMLElement {
  if (listeAnchor === 'self') {
    return (
      (trigger.closest('.ap-form-acilir-secim-liste-anchor') as HTMLElement | null) ??
      (trigger.closest('.ap-form-acilir-secim') as HTMLElement | null) ??
      trigger
    );
  }

  return (
    (trigger.closest('.cari-outlined-cerceve') as HTMLElement | null) ??
    (trigger.closest('.ap-form-acilir-secim') as HTMLElement | null) ??
    trigger
  );
}

function listeKonumuHesapla(
  trigger: HTMLButtonElement,
  minGenislik = 0,
  listeAnchor: 'self' | 'cerceve' = 'cerceve',
  dikeyBosluk = 4
) {
  const rect = anchorBul(trigger, listeAnchor).getBoundingClientRect();
  const genislik = listeAnchor === 'self' ? rect.width : Math.max(rect.width, minGenislik);
  let left = rect.left;

  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;

  const ust = rect.bottom + dikeyBosluk;
  const maxHeight = Math.max(120, window.innerHeight - ust - KENAR_BOSLUK);

  return { top: ust, left, width: genislik, maxHeight };
}

export function FormAcilirSecim({
  value,
  onChange,
  secenekler,
  className = '',
  listeSinifi = '',
  listeMinGenislik = 0,
  listeAnchor = 'cerceve',
  listeDikeyBosluk = 4,
  disabled = false,
  'aria-label': ariaLabel,
}: FormAcilirSecimProps) {
  const listeId = useId();
  const tusRef = useRef<HTMLButtonElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const secili = secenekler.find((s) => s.value === value) ?? secenekler[0];

  const konumGuncelle = useCallback(() => {
    if (!tusRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(
      tusRef.current,
      listeMinGenislik,
      listeAnchor,
      listeDikeyBosluk
    );
    setListeStil({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
      zIndex: 10300,
    });
  }, [listeMinGenislik, listeAnchor, listeDikeyBosluk]);

  const sekmeSonrasi = useCallback(() => {
    if (!acik) return;
    // Gizli sekmede getBoundingClientRect 0 döner; görünür olunca yenile
    requestAnimationFrame(() => konumGuncelle());
  }, [acik, konumGuncelle]);

  useSekmeDegisinceYenile(sekmeSonrasi);

  useLayoutEffect(() => {
    if (!acik) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, konumGuncelle]);

  useEffect(() => {
    if (!acik) return;

    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (tusRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
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
    tusRef.current?.focus();
  };

  return (
    <div className="ap-form-acilir-secim">
      <button
        ref={tusRef}
        type="button"
        className={`${formSelectSinifi} ap-form-acilir-secim-tus ${className}`.trim()}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={acik}
        aria-controls={acik ? listeId : undefined}
        onClick={() => {
          if (disabled) return;
          setAcik((o) => !o);
        }}
      >
        <span className="ap-form-acilir-secim-tus-metin">{secili?.label ?? value}</span>
        <span className="ap-form-acilir-secim-ok" aria-hidden>
          ▾
        </span>
      </button>

      {acik
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className={`ap-form-acilir-secim-liste${listeSinifi ? ` ${listeSinifi}` : ''}`.trim()}
              role="listbox"
              aria-label={ariaLabel}
              style={listeStil}
            >
              {secenekler.map((s) => {
                const seciliMi = s.value === value;
                return (
                  <li key={s.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={seciliMi}
                      className={`ap-form-acilir-secim-oge${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => sec(s.value)}
                    >
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>,
            sekmePortalHedefi(tusRef.current)
          )
        : null}
    </div>
  );
}
