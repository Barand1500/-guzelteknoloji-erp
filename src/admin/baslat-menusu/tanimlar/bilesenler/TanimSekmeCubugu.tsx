import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { TanimSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TANIM_SEKMELER } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimSekmeCubuguProps {
  aktif: TanimSekmeId;
  onDegistir: (id: TanimSekmeId) => void;
}

export function TanimSekmeCubugu({ aktif, onDegistir }: TanimSekmeCubuguProps) {
  const konteynerRef = useRef<HTMLDivElement>(null);
  const [gosterge, setGosterge] = useState({ sol: 0, genislik: 0 });

  const gostergeyiGuncelle = useCallback(() => {
    const kok = konteynerRef.current;
    if (!kok) return;
    const dugme = kok.querySelector<HTMLButtonElement>(`[data-tanim-sekme="${aktif}"]`);
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

  return (
    <div className="ap-tanimlar-tur-sarmal">
      <div className="ap-tanimlar-tur-cubugu" ref={konteynerRef} role="tablist" aria-label="Tanım türü">
        <span
          className="ap-tanimlar-tur-gosterge"
          aria-hidden
          style={{ transform: `translateX(${gosterge.sol}px)`, width: gosterge.genislik }}
        />
        {TANIM_SEKMELER.map((s) => {
          const secili = aktif === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              data-tanim-sekme={s.id}
              aria-selected={secili}
              tabIndex={secili ? 0 : -1}
              onClick={() => onDegistir(s.id)}
              className={`ap-tanimlar-tur-sekme ${secili ? 'ap-tanimlar-tur-sekme--aktif' : ''}`}
            >
              <span className="ap-tanimlar-tur-ikon" aria-hidden>
                {s.ikon}
              </span>
              <span>{s.ad}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
