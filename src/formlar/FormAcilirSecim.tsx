import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
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
  /** true ise liste portal yerine tetikleyicinin altında inline render edilir */
  listeInline?: boolean;
  /** Kapalıyken tetikleyicide gösterilecek metin (liste etiketinden farklı olabilir) */
  tusMetin?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const KENAR_BOSLUK = 8;

function acilirListeGorunurKaydir(
  trigger: HTMLElement,
  liste: HTMLElement,
  altBosluk = 16
) {
  let scrollParent: HTMLElement | null = trigger.parentElement;
  while (scrollParent) {
    const { overflowY } = getComputedStyle(scrollParent);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      scrollParent.scrollHeight > scrollParent.clientHeight + 1
    ) {
      break;
    }
    scrollParent = scrollParent.parentElement;
  }

  const listeRect = liste.getBoundingClientRect();
  if (scrollParent) {
    const containerRect = scrollParent.getBoundingClientRect();
    const delta = listeRect.bottom - containerRect.bottom + altBosluk;
    if (delta > 0) scrollParent.scrollBy({ top: delta, behavior: 'smooth' });
    return;
  }

  const delta = listeRect.bottom - window.innerHeight + altBosluk;
  if (delta > 0) window.scrollBy({ top: delta, behavior: 'smooth' });
}

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
  listeInline = false,
  tusMetin,
  disabled = false,
  'aria-label': ariaLabel,
}: FormAcilirSecimProps) {
  const listeId = useId();
  const tusRef = useRef<HTMLButtonElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});
  const [odakIndex, setOdakIndex] = useState(0);

  const secili = secenekler.find((s) => s.value === value) ?? secenekler[0];
  const inlineListe = listeInline;

  const seciliIndex = Math.max(
    0,
    secenekler.findIndex((s) => s.value === value)
  );

  const konumGuncelle = useCallback(() => {
    if (!tusRef.current || inlineListe) return;
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
  }, [inlineListe, listeMinGenislik, listeAnchor, listeDikeyBosluk]);

  const sekmeSonrasi = useCallback(() => {
    if (!acik || inlineListe) return;
    requestAnimationFrame(() => konumGuncelle());
  }, [acik, inlineListe, konumGuncelle]);

  useSekmeDegisinceYenile(sekmeSonrasi);

  useLayoutEffect(() => {
    if (!acik || inlineListe) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, inlineListe, konumGuncelle]);

  useEffect(() => {
    if (!acik || inlineListe) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (tusRef.current && listeRef.current) {
          acilirListeGorunurKaydir(tusRef.current, listeRef.current);
        }
      });
    });
  }, [acik, inlineListe]);

  useEffect(() => {
    if (!acik) return;
    setOdakIndex(seciliIndex);
  }, [acik, seciliIndex]);

  useEffect(() => {
    if (!acik) return;
    const el = document.getElementById(`${listeId}-oge-${odakIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [acik, odakIndex, listeId]);

  useEffect(() => {
    if (!acik) return;

    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (tusRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
      setAcik(false);
    }

    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik]);

  const sec = (yeni: string) => {
    onChange(yeni);
    setAcik(false);
    tusRef.current?.focus();
  };

  const acKapat = () => {
    if (disabled) return;
    setAcik((o) => {
      if (!o) setOdakIndex(seciliIndex);
      return !o;
    });
  };

  const tusTuslari = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!acik) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOdakIndex(seciliIndex);
        setAcik(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOdakIndex((i) => Math.min(i + 1, secenekler.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOdakIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const hedef = secenekler[odakIndex];
      if (hedef) sec(hedef.value);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setAcik(false);
      tusRef.current?.focus();
    }
  };

  const listeIcerik = (
    <ul
      ref={listeRef}
      id={listeId}
      className={`ap-form-acilir-secim-liste${listeSinifi ? ` ${listeSinifi}` : ''}${inlineListe ? ' ap-form-acilir-secim-liste--inline' : ''}`.trim()}
      role="listbox"
      aria-label={ariaLabel}
      style={inlineListe ? undefined : listeStil}
    >
      {secenekler.map((s, index) => {
        const seciliMi = s.value === value;
        const odakMi = index === odakIndex;
        return (
          <li key={s.value}>
            <button
              type="button"
              id={`${listeId}-oge-${index}`}
              role="option"
              aria-selected={seciliMi || odakMi}
              className={`ap-form-acilir-secim-oge${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}${odakMi ? ' ap-form-acilir-secim-oge-odak' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setOdakIndex(index)}
              onClick={() => sec(s.value)}
            >
              {s.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`ap-form-acilir-secim${inlineListe ? ' ap-form-acilir-secim--inline' : ''}`.trim()}>
      <button
        ref={tusRef}
        type="button"
        className={`${formSelectSinifi} ap-form-acilir-secim-tus ${className}`.trim()}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={acik}
        aria-controls={acik ? listeId : undefined}
        aria-activedescendant={acik ? `${listeId}-oge-${odakIndex}` : undefined}
        onClick={acKapat}
        onKeyDown={tusTuslari}
      >
        <span className="ap-form-acilir-secim-tus-metin">{tusMetin ?? secili?.label ?? value}</span>
        <span className="ap-form-acilir-secim-ok" aria-hidden>
          ▾
        </span>
      </button>

      {acik
        ? inlineListe
          ? listeIcerik
          : createPortal(listeIcerik, sekmePortalHedefi(tusRef.current))
        : null}
    </div>
  );
}
