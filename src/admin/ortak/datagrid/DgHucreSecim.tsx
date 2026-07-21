import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

type Secenek = { deger: string; etiket: string };

export function DgHucreSecim({
  deger,
  secenekler,
  onSec,
  onIptal,
}: {
  deger: string;
  secenekler: Secenek[];
  onSec: (deger: string) => void;
  onIptal: () => void;
}) {
  const listeId = useId();
  const kutuRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baslangicIdx = Math.max(
    0,
    secenekler.findIndex((s) => s.deger === deger)
  );
  const [odakIndex, setOdakIndex] = useState(baslangicIdx);
  const [stil, setStil] = useState<CSSProperties>({});

  const seciliEtiket = secenekler.find((s) => s.deger === deger)?.etiket ?? deger;

  useLayoutEffect(() => {
    const el = kutuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const genislik = Math.max(rect.width + 24, 120);
    let left = rect.left + rect.width / 2 - genislik / 2;
    if (left + genislik > window.innerWidth - 8) {
      left = window.innerWidth - genislik - 8;
    }
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    const tahminiH = Math.min(260, secenekler.length * 36 + 16);
    if (top + tahminiH > window.innerHeight - 8 && rect.top > tahminiH + 12) {
      top = rect.top - tahminiH - 6;
    }
    setStil({
      position: 'fixed',
      top,
      left,
      width: genislik,
      maxHeight: Math.min(260, window.innerHeight - top - 8),
      zIndex: 12050,
    });
  }, [secenekler.length]);

  useEffect(() => {
    kutuRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = document.getElementById(`${listeId}-oge-${odakIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [odakIndex, listeId]);

  useEffect(() => {
    function disTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (kutuRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      onIptal();
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [onIptal]);

  const sec = (s: Secenek) => onSec(s.deger);

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return (
    <>
      <button
        ref={kutuRef}
        type="button"
        className="dg-hucre-secim-tus"
        aria-haspopup="listbox"
        aria-expanded
        aria-controls={listeId}
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
        <span className="dg-hucre-secim-tus-metin">{seciliEtiket}</span>
        <span className="dg-hucre-secim-tus-ok" aria-hidden>
          ▾
        </span>
      </button>

      {createPortal(
        <div ref={panelRef} className="dg-hucre-secim-panel" style={stil} role="presentation">
          <ul id={listeId} className="dg-hucre-secim-liste" role="listbox">
            {secenekler.map((s, index) => (
              <li key={s.deger}>
                <button
                  type="button"
                  id={`${listeId}-oge-${index}`}
                  role="option"
                  aria-selected={index === odakIndex}
                  className={`dg-hucre-secim-oge${index === odakIndex ? ' dg-hucre-secim-oge--odak' : ''}${s.deger === deger ? ' dg-hucre-secim-oge--secili' : ''}`}
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
            ))}
          </ul>
        </div>,
        portalKok
      )}
    </>
  );
}
