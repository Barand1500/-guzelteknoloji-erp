import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { AdminCari } from '../tipler';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

const KENAR_BOSLUK = 8;
const LISTE_LIMIT = 12;
const MIN_ARAMA = 1;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function normalizeMetin(metin: string) {
  return metin.trim().toLocaleLowerCase('tr');
}

function cariEtiketi(c: AdminCari) {
  return `${c.cariAdi} (${c.cariKodu})`;
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

export function CariUstCariSecici({
  ustId,
  onChange,
  cariler,
  haricId,
  disabled = false,
}: {
  ustId: string;
  onChange: (ustId: string) => void;
  cariler: AdminCari[];
  haricId?: string | null;
  disabled?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [metin, setMetin] = useState('');
  const [focused, setFocused] = useState(false);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const secili = useMemo(
    () => (ustId ? cariler.find((c) => c.id === ustId) ?? null : null),
    [cariler, ustId]
  );

  useEffect(() => {
    if (secili) setMetin(cariEtiketi(secili));
    else if (!ustId) setMetin('');
  }, [secili, ustId]);

  const adaylar = useMemo(() => {
    const q = normalizeMetin(metin);
    const taban = cariler.filter((c) => c.id !== haricId && c.aktif);
    if (!q) return taban.slice(0, LISTE_LIMIT);
    return taban
      .filter((c) => {
        const alanlar = [c.cariKodu, c.cariAdi, c.unvan, c.yetkili];
        return alanlar.some((a) => normalizeMetin(a ?? '').includes(q));
      })
      .slice(0, LISTE_LIMIT);
  }, [cariler, haricId, metin]);

  const oneriGoster = acik && metin.trim().length >= MIN_ARAMA && adaylar.length > 0;

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
  }, [oneriGoster, konumGuncelle, adaylar.length]);

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

  const sec = (c: AdminCari) => {
    onChange(c.id);
    setMetin(cariEtiketi(c));
    setAcik(false);
  };

  const metinDegistir = (yeni: string) => {
    setMetin(yeni);
    if (secili && yeni !== cariEtiketi(secili)) onChange('');
    if (yeni.trim().length >= MIN_ARAMA) setAcik(true);
    else setAcik(false);
  };

  return (
    <div
      className={`cari-outlined-field cari-ust-cari-secici${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`}
      ref={kapsayiciRef}
    >
      <CariOutlinedEtiket etiket="Üst Cari" htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          className="cari-outlined-input"
          value={metin}
          disabled={disabled}
          placeholder={focused ? 'Cari adı veya kodu yazın…' : undefined}
          aria-label="Üst cari ara"
          aria-autocomplete="list"
          aria-expanded={oneriGoster}
          aria-controls={oneriGoster ? listeId : undefined}
          onChange={(e) => metinDegistir(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (metin.trim().length >= MIN_ARAMA) setAcik(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && adaylar.length === 1) {
              e.preventDefault();
              sec(adaylar[0]);
            }
          }}
        />
      </div>

      {oneriGoster
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className="ap-form-acilir-secim-liste ap-form-arama-secim-liste cari-ust-cari-liste"
              role="listbox"
              aria-label="Üst cari sonuçları"
              style={listeStil}
            >
              {adaylar.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.id === ustId}
                    className={`ap-form-acilir-secim-oge cari-ust-cari-oge${c.id === ustId ? ' ap-form-acilir-secim-oge-secili' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => sec(c)}
                  >
                    <span className="cari-ust-cari-oge-ad">{c.cariAdi}</span>
                    <span className="cari-ust-cari-oge-kod">{c.cariKodu}</span>
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
