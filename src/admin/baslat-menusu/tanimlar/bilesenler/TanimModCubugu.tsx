import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface TanimModSekme {
  id: string;
  ad: string;
  ikon?: string;
}

interface TanimModCubuguProps {
  sekmeler: readonly TanimModSekme[];
  aktif: string;
  onDegistir: (id: string) => void;
  ariaLabel?: string;
  kompakt?: boolean;
}

export function TanimModCubugu({
  sekmeler,
  aktif,
  onDegistir,
  ariaLabel = 'Sekme',
  kompakt = false,
}: TanimModCubuguProps) {
  const konteynerRef = useRef<HTMLDivElement>(null);
  const oncekiAktifRef = useRef(aktif);
  const [gosterge, setGosterge] = useState({ sol: 0, genislik: 0 });
  const [gostergeKayiyor, setGostergeKayiyor] = useState(false);
  const [yon, setYon] = useState<'ileri' | 'geri'>('ileri');

  const gostergeyiGuncelle = useCallback(() => {
    const kok = konteynerRef.current;
    if (!kok) return;
    const dugme = kok.querySelector<HTMLButtonElement>(`[data-tanim-mod-sekme="${aktif}"]`);
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

  useLayoutEffect(() => {
    if (oncekiAktifRef.current === aktif) return;
    setGostergeKayiyor(true);
    const dugme = konteynerRef.current?.querySelector<HTMLButtonElement>(`[data-tanim-mod-sekme="${aktif}"]`);
    dugme?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const zamanlayici = window.setTimeout(() => setGostergeKayiyor(false), 480);
    oncekiAktifRef.current = aktif;
    return () => window.clearTimeout(zamanlayici);
  }, [aktif]);

  const sekmeTikla = (id: string) => {
    if (id === aktif) return;
    const eski = sekmeler.findIndex((s) => s.id === aktif);
    const yeni = sekmeler.findIndex((s) => s.id === id);
    if (eski >= 0 && yeni >= 0) {
      setYon(yeni > eski ? 'ileri' : 'geri');
    }
    onDegistir(id);
  };

  return (
    <div className={`ap-tanimlar-mod-sarmal${kompakt ? ' ap-tanimlar-mod-sarmal--kompakt' : ''}`}>
      <div
        className="ap-tanimlar-mod-cubugu"
        ref={konteynerRef}
        role="tablist"
        aria-label={ariaLabel}
      >
        <span
          className={`ap-tanimlar-mod-gosterge ${gostergeKayiyor ? 'ap-tanimlar-mod-gosterge--kayma' : ''} ap-tanimlar-mod-gosterge--${yon}`}
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
              data-tanim-mod-sekme={s.id}
              aria-selected={secili}
              tabIndex={secili ? 0 : -1}
              onClick={() => sekmeTikla(s.id)}
              className={`ap-tanimlar-mod-sekme ${secili ? 'ap-tanimlar-mod-sekme--aktif' : ''}`}
            >
              {s.ikon && (
                <span className="ap-tanimlar-mod-ikon" aria-hidden>
                  {s.ikon}
                </span>
              )}
              <span className="ap-tanimlar-mod-metin">{s.ad}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
