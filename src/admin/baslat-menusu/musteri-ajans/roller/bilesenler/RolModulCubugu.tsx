import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { tumSayfalarMi, type ModulTanimi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

interface RolModulCubuguProps {
  moduller: readonly ModulTanimi[];
  aktif: string;
  onDegistir: (prefix: string) => void;
  ariaLabel?: string;
}

export function RolModulCubugu({
  moduller,
  aktif,
  onDegistir,
  ariaLabel = 'Sayfa seçimi',
}: RolModulCubuguProps) {
  const konteynerRef = useRef<HTMLDivElement>(null);
  const [gosterge, setGosterge] = useState({ sol: 0, genislik: 0 });

  const gostergeyiGuncelle = useCallback(() => {
    const kok = konteynerRef.current;
    if (!kok) return;
    const dugme = kok.querySelector<HTMLButtonElement>(`[data-roller-modul="${aktif}"]`);
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
  }, [gostergeyiGuncelle, moduller.length]);

  useLayoutEffect(() => {
    const dugme = konteynerRef.current?.querySelector<HTMLButtonElement>(
      `[data-roller-modul="${aktif}"]`
    );
    dugme?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [aktif]);

  if (!moduller.length) return null;

  return (
    <div className="ap-roller-modul-sarmal">
      <div
        className="ap-roller-modul-cubugu"
        ref={konteynerRef}
        role="tablist"
        aria-label={ariaLabel}
      >
        <span
          className="ap-roller-modul-gosterge"
          aria-hidden
          style={{ transform: `translateX(${gosterge.sol}px)`, width: gosterge.genislik }}
        />
        {moduller.map((m) => {
          const secili = aktif === m.prefix;
          const toplu = tumSayfalarMi(m.prefix);
          return (
            <button
              key={m.prefix}
              type="button"
              role="tab"
              data-roller-modul={m.prefix}
              aria-selected={secili}
              tabIndex={secili ? 0 : -1}
              onClick={() => onDegistir(m.prefix)}
              className={`ap-roller-modul-sekme${secili ? ' ap-roller-modul-sekme--aktif' : ''}${toplu ? ' ap-roller-modul-sekme--toplu' : ''}`}
              title={
                toplu
                  ? 'Tüm sayfalara toplu yetki uygula'
                  : m.kategori
                    ? `${m.ad} · ${m.kategori}`
                    : m.ad
              }
            >
              {m.ikon && (
                <span className="ap-roller-modul-ikon" aria-hidden>
                  {m.ikon}
                </span>
              )}
              <span className="ap-roller-modul-metin">{m.ad}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
