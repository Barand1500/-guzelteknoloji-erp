import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AP_SEKME_DEGISTI,
  sekmeGecisTiklamasiMi,
  sekmePortalHedefi,
} from '@/araclar/sekmePortal';

type Secenek = { deger: string; etiket: string };

export function DgHucreSecim({
  baslik,
  deger,
  secenekler,
  gosterilen,
  onSec,
  onIptal,
}: {
  baslik: string;
  deger: string;
  secenekler: Secenek[];
  /** Hücrede düzenleme sırasında değişmeyen görünüm (kaymayı önler) */
  gosterilen: ReactNode;
  onSec: (deger: string) => void;
  onIptal: () => void;
}) {
  const listeId = useId();
  const kokRef = useRef<HTMLSpanElement>(null);
  const odakRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const baslangicIdx = Math.max(
    0,
    secenekler.findIndex((s) => s.deger === deger)
  );
  const [odakIndex, setOdakIndex] = useState(baslangicIdx);
  const [stil, setStil] = useState<CSSProperties>({});
  const [usteAc, setUsteAc] = useState(false);

  const konumGuncelle = useCallback(() => {
    const tus = odakRef.current;
    if (!tus) return;
    const rect = tus.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    // Dar kolonlarda (PB) liste biraz genişlesin; metin tek satırda kalsın
    const genislik = Math.max(rect.width, 76);
    let left = rect.left + rect.width / 2 - genislik / 2;
    if (left + genislik > window.innerWidth - 8) {
      left = window.innerWidth - genislik - 8;
    }
    if (left < 8) left = 8;

    const listeH = Math.min(148, secenekler.length * 24 + 8);
    const altaSigar = rect.bottom + listeH <= window.innerHeight - 8;
    const usteAcik = !altaSigar && rect.top > listeH + 8;
    setUsteAc(usteAcik);

    const top = usteAcik ? rect.top - listeH + 1.5 : rect.bottom - 1.5;
    setStil({
      position: 'fixed',
      top,
      left,
      width: genislik,
      maxHeight: listeH,
      zIndex: 12050,
    });
  }, [secenekler.length]);

  useLayoutEffect(() => {
    konumGuncelle();
  }, [konumGuncelle]);

  useEffect(() => {
    function yenile() {
      requestAnimationFrame(() => konumGuncelle());
    }
    window.addEventListener(AP_SEKME_DEGISTI, yenile);
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener(AP_SEKME_DEGISTI, yenile);
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [konumGuncelle]);

  useEffect(() => {
    odakRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = document.getElementById(`${listeId}-oge-${odakIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [odakIndex, listeId]);

  useEffect(() => {
    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (kokRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      onIptal();
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [onIptal]);

  const sec = (s: Secenek) => onSec(s.deger);

  const portalKok = sekmePortalHedefi(kokRef.current);

  return (
    <>
      <span
        ref={kokRef}
        className={`dg-hucre-secim-kok${usteAc ? ' dg-hucre-secim-kok--uste' : ''}`}
      >
        <button
          ref={odakRef}
          type="button"
          className="dg-hucre-secim-tus"
          aria-haspopup="listbox"
          aria-expanded
          aria-controls={listeId}
          aria-label={`${baslik} seç`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              e.stopPropagation();
              setOdakIndex((i) => Math.min(i + 1, secenekler.length - 1));
              return;
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              e.stopPropagation();
              setOdakIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              const hedef = secenekler[odakIndex];
              if (hedef) sec(hedef);
              return;
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onIptal();
              return;
            }
            if (e.key === 'Tab') {
              e.preventDefault();
              const hedef = secenekler[odakIndex];
              if (hedef) sec(hedef);
            }
          }}
        >
          <span className="dg-hucre-secim-tus-metin">{gosterilen}</span>
          <span className="dg-hucre-secim-tus-ok" aria-hidden>
            ▾
          </span>
        </button>
      </span>

      {createPortal(
        <ul
          ref={panelRef}
          id={listeId}
          className={`ap-form-acilir-secim-liste dg-hucre-secim-liste${usteAc ? ' dg-hucre-secim-liste--uste' : ''}`}
          role="listbox"
          aria-label={baslik}
          style={stil}
        >
          {secenekler.map((s, index) => {
            const seciliMi = s.deger === deger;
            const odakMi = index === odakIndex;
            return (
              <li key={s.deger}>
                <button
                  type="button"
                  id={`${listeId}-oge-${index}`}
                  role="option"
                  aria-selected={seciliMi}
                  className={`ap-form-acilir-secim-oge${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}${odakMi ? ' ap-form-acilir-secim-oge-odak' : ''}`}
                  onMouseEnter={() => setOdakIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    sec(s);
                  }}
                >
                  {s.etiket}
                </button>
              </li>
            );
          })}
        </ul>,
        portalKok
      )}
    </>
  );
}
