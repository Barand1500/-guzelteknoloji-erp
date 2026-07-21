import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { sekmePortalHedefi } from '@/araclar/sekmePortal';

interface EtiketParca {
  metin: string;
  renk: string;
}

export function EtiketHucre({ etiketler }: { etiketler: EtiketParca[] }) {
  const [acik, setAcik] = useState(false);
  const [konum, setKonum] = useState({ top: 0, left: 0 });
  const tetikRef = useRef<HTMLSpanElement>(null);
  const zamanRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const konumGuncelle = useCallback(() => {
    const rect = tetikRef.current?.getBoundingClientRect();
    if (!rect) return;
    setKonum({ top: rect.bottom + 6, left: Math.max(8, rect.left) });
  }, []);

  const ac = useCallback(() => {
    if (zamanRef.current) clearTimeout(zamanRef.current);
    konumGuncelle();
    setAcik(true);
  }, [konumGuncelle]);

  const kapatGecikmeli = useCallback(() => {
    zamanRef.current = setTimeout(() => setAcik(false), 120);
  }, []);

  const kapatIptal = useCallback(() => {
    if (zamanRef.current) clearTimeout(zamanRef.current);
  }, []);

  const adet = etiketler.length;
  if (!adet) {
    return <span className="dg-etiket-sayac dg-etiket-sayac--bos">—</span>;
  }

  const portalKok = sekmePortalHedefi(tetikRef.current);

  return (
    <>
      <span
        ref={tetikRef}
        className="dg-etiket-sayac"
        onMouseEnter={ac}
        onMouseLeave={kapatGecikmeli}
        onFocus={ac}
        onBlur={kapatGecikmeli}
        tabIndex={0}
        role="button"
        aria-label={`${adet} etiket — detay için üzerine gelin`}
      >
        {adet} etiket
      </span>
      {acik &&
        createPortal(
          <div
            className="dg-etiket-popover"
            style={{ top: konum.top, left: konum.left }}
            onMouseEnter={kapatIptal}
            onMouseLeave={kapatGecikmeli}
            role="tooltip"
          >
            <div className="dg-etiket-popover-baslik">{adet} etiket</div>
            <div className="dg-etiket-popover-liste">
              {etiketler.map((e, i) => (
                <span key={i} className={`dg-etiket dg-etiket--${e.renk}`}>
                  {e.metin}
                </span>
              ))}
            </div>
          </div>,
          portalKok
        )}
    </>
  );
}
