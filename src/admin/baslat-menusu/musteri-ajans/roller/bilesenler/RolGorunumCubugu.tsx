import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface RolGorunumSekme {
  id: string;
  ad: string;
  ikon?: string;
}

interface RolGorunumCubuguProps {
  sekmeler: readonly RolGorunumSekme[];
  aktif: string;
  onDegistir: (id: string) => void;
  ariaLabel?: string;
}

export function RolGorunumCubugu({
  sekmeler,
  aktif,
  onDegistir,
  ariaLabel = 'Görünüm',
}: RolGorunumCubuguProps) {
  const konteynerRef = useRef<HTMLDivElement>(null);
  const [gosterge, setGosterge] = useState({ sol: 0, genislik: 0 });

  const gostergeyiGuncelle = useCallback(() => {
    const kok = konteynerRef.current;
    if (!kok) return;
    const dugme = kok.querySelector<HTMLButtonElement>(`[data-roller-gorunum="${aktif}"]`);
    if (!dugme) return;
    setGosterge({ sol: dugme.offsetLeft, genislik: dugme.offsetWidth });
  }, [aktif]);

  useLayoutEffect(() => {
    gostergeyiGuncelle();
    const kok = konteynerRef.current;
    if (!kok || typeof ResizeObserver === 'undefined') return;
    const gozlemci = new ResizeObserver(() => gostergeyiGuncelle());
    gozlemci.observe(kok);
    return () => gozlemci.disconnect();
  }, [gostergeyiGuncelle]);

  const sekmeTikla = (id: string) => {
    if (id !== aktif) onDegistir(id);
  };

  return (
    <div className="ap-roller-gorunum-sarmal">
      <div className="ap-roller-gorunum-cubugu" ref={konteynerRef} role="tablist" aria-label={ariaLabel}>
        <span
          className="ap-roller-gorunum-gosterge"
          aria-hidden
          style={{ transform: `translateX(${gosterge.sol}px)`, width: gosterge.genislik }}
        />
        {sekmeler.map((s) => {
          const secili = aktif === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              data-roller-gorunum={s.id}
              aria-selected={secili}
              tabIndex={secili ? 0 : -1}
              onClick={() => sekmeTikla(s.id)}
              className={`ap-roller-gorunum-sekme ${secili ? 'ap-roller-gorunum-sekme--aktif' : ''}`}
            >
              {s.ikon && (
                <span className="ap-roller-gorunum-ikon" aria-hidden>
                  {s.ikon}
                </span>
              )}
              {s.ad}
            </button>
          );
        })}
      </div>
    </div>
  );
}
