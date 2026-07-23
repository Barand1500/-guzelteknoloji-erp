import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { formInputSinifi } from '@/formlar/FormAlani';
import { sekmeGecisTiklamasiMi, sekmePortalHedefi, useSekmeDegisinceYenile } from '@/araclar/sekmePortal';

const KENAR_BOSLUK = 8;
const LISTE_LIMIT_VARSAYILAN = 80;
const ARAMA_GECIKME_MS = 80;
const LISTE_Z_INDEX = 13000;

function normalizeMetin(metin: string): string {
  return metin.trim().toLocaleLowerCase('tr');
}

function secenekleriFiltrele(
  secenekler: string[],
  arama: string,
  minAramaUzunlugu: number,
  listeLimit: number
): string[] {
  const q = normalizeMetin(arama);
  if (q.length < minAramaUzunlugu) return [];
  return secenekler
    .filter((s) => (q ? normalizeMetin(s).includes(q) : true))
    .slice(0, listeLimit);
}

function anchorBul(trigger: HTMLElement): HTMLElement {
  return (
    (trigger.closest('.cari-outlined-cerceve') as HTMLElement | null) ??
    (trigger.closest('.ap-form-arama-secim') as HTMLElement | null) ??
    trigger
  );
}

/** Footer / düzenle panelinde sekme portalı listenin altında kalır.
 *  body değil admin-panel — tema CSS değişkenleri (--ap-surface) korunsun. */
function aramaPortalHedefi(trigger: HTMLElement | null): HTMLElement {
  if (
    trigger?.closest(
      '.ap-footer, .dg-duzenle, .dg-satir-panel-cubuk, .dg-satir-panel, .ap-tanimlar-duzenle'
    )
  ) {
    return (
      (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body
    );
  }
  return sekmePortalHedefi(trigger);
}

function listeKonumuHesapla(anchor: HTMLElement) {
  const rect = anchorBul(anchor).getBoundingClientRect();
  const genislik = rect.width;
  let left = rect.left;

  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;

  /* Her zaman aşağı aç — alan altta kalsa bile yukarı taşma yok */
  const asagiBosluk = window.innerHeight - rect.bottom - KENAR_BOSLUK;
  const maxHeight = Math.max(100, Math.min(280, Math.max(asagiBosluk, 100)));
  return { top: rect.bottom + 4, left, width: genislik, maxHeight };
}

interface FormAramaSecimProps {
  value: string;
  onChange: (value: string) => void;
  onSecildi?: (value: string) => void;
  secenekler?: readonly string[];
  secenekAra?: (arama: string) => Promise<string[]>;
  minAramaUzunlugu?: number;
  listeLimit?: number;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  /** Liste satırında özel içerik (ör. bayrak + ad). */
  ogeIcerik?: (secenek: string) => ReactNode;
}

export function FormAramaSecim({
  value,
  onChange,
  onSecildi,
  secenekler = [],
  secenekAra,
  minAramaUzunlugu = 2,
  listeLimit = LISTE_LIMIT_VARSAYILAN,
  placeholder,
  disabled = false,
  'aria-label': ariaLabel,
  ogeIcerik,
}: FormAramaSecimProps) {
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});
  const [asyncSecenekler, setAsyncSecenekler] = useState<string[]>([]);
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);
  const [odakIndex, setOdakIndex] = useState(0);
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
          if (!iptal && surum === aramaSurumuRef.current) {
            setAsyncSecenekler(liste.slice(0, listeLimit));
          }
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
  }, [value, secenekAra, minAramaUzunlugu, listeLimit]);

  const filtrelenmis = useMemo(() => {
    if (secenekAra) return asyncSecenekler;
    return secenekleriFiltrele(benzersizSecenekler, value, minAramaUzunlugu, listeLimit);
  }, [secenekAra, asyncSecenekler, benzersizSecenekler, value, minAramaUzunlugu, listeLimit]);

  useEffect(() => {
    setOdakIndex(0);
  }, [value, filtrelenmis.length]);

  const aramaYeterli = value.trim().length >= minAramaUzunlugu;
  const oneriGoster = acik && aramaYeterli;
  const kaydirildiRef = useRef(false);

  const konumGuncelle = useCallback((kaydir = false) => {
    if (!kapsayiciRef.current) return;

    const input = inputRef.current;
    if (kaydir && input && !kaydirildiRef.current) {
      const scrollParent = input.closest(
        '.dg-duzenle-govde, .ap-tanimlar-panel-govde, .ap-scroll'
      ) as HTMLElement | null;
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const inputRect = input.getBoundingClientRect();
        if (parentRect.bottom - inputRect.bottom < 160) {
          kaydirildiRef.current = true;
          input.scrollIntoView({ block: 'center', inline: 'nearest' });
        }
      }
    }

    const { top, left, width, maxHeight } = listeKonumuHesapla(kapsayiciRef.current);
    setListeStil({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
      zIndex: LISTE_Z_INDEX,
    });
  }, []);

  const sekmeSonrasi = useCallback(() => {
    if (!acik) return;
    requestAnimationFrame(() => konumGuncelle());
  }, [acik, konumGuncelle]);
  useSekmeDegisinceYenile(sekmeSonrasi);

  useLayoutEffect(() => {
    if (!oneriGoster) {
      kaydirildiRef.current = false;
      return;
    }
    konumGuncelle(true);
    const scrollIleGuncelle = () => konumGuncelle();
    window.addEventListener('resize', scrollIleGuncelle);
    window.addEventListener('scroll', scrollIleGuncelle, true);
    return () => {
      window.removeEventListener('resize', scrollIleGuncelle);
      window.removeEventListener('scroll', scrollIleGuncelle, true);
    };
  }, [oneriGoster, konumGuncelle, filtrelenmis.length, aramaYukleniyor]);

  useLayoutEffect(() => {
    if (!oneriGoster || !listeRef.current) return;
    const el = listeRef.current.querySelector<HTMLElement>(`[data-odak-index="${odakIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [odakIndex, oneriGoster, filtrelenmis]);

  useEffect(() => {
    if (!acik) return;

    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (kapsayiciRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
      setAcik(false);
    }

    function tusBas(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setAcik(false);
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
    if (aramaYeterli) setAcik(true);
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
        aria-activedescendant={
          oneriGoster && filtrelenmis[odakIndex] ? `${listeId}-oge-${odakIndex}` : undefined
        }
        role="combobox"
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        data-form-type="other"
        inputMode="search"
        name={`ap-arama-${listeId.replace(/:/g, '')}`}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length >= minAramaUzunlugu) setAcik(true);
          else setAcik(false);
        }}
        onFocus={alanAc}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!acik && aramaYeterli) {
              setAcik(true);
              setOdakIndex(0);
              return;
            }
            if (filtrelenmis.length === 0) return;
            setOdakIndex((i) => Math.min(i + 1, filtrelenmis.length - 1));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!acik && aramaYeterli) {
              setAcik(true);
              setOdakIndex(0);
              return;
            }
            if (filtrelenmis.length === 0) return;
            setOdakIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === 'Enter' && filtrelenmis.length > 0 && (acik || filtrelenmis.length === 1)) {
            e.preventDefault();
            e.stopPropagation();
            const secilecek = filtrelenmis[odakIndex] ?? filtrelenmis[0];
            if (secilecek) sec(secilecek);
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
              ) : filtrelenmis.length === 0 ? (
                <li className="ap-form-arama-secim-bos">Sonuç bulunamadı</li>
              ) : (
                filtrelenmis.map((secenek, index) => {
                  const seciliMi = normalizeMetin(secenek) === normalizeMetin(value);
                  const odakMi = index === odakIndex;
                  return (
                    <li key={`${secenek}-${index}`}>
                      <button
                        type="button"
                        id={`${listeId}-oge-${index}`}
                        data-odak-index={index}
                        role="option"
                        aria-selected={seciliMi || odakMi}
                        className={`ap-form-acilir-secim-oge${ogeIcerik ? ' ap-form-acilir-secim-oge-bayrakli' : ''}${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}${odakMi ? ' ap-form-acilir-secim-oge-odak' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setOdakIndex(index)}
                        onClick={() => sec(secenek)}
                      >
                        {ogeIcerik ? ogeIcerik(secenek) : secenek}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>,
            aramaPortalHedefi(kapsayiciRef.current)
          )
        : null}
    </div>
  );
}
