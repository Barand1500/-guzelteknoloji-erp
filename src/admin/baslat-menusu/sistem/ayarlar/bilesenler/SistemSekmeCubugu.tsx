import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { SistemSekmeId } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { SISTEM_SEKMELER } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

interface SistemSekmeCubuguProps {
  aktif: SistemSekmeId;
  onDegistir: (id: SistemSekmeId) => void;
}

export function SistemSekmeCubugu({ aktif, onDegistir }: SistemSekmeCubuguProps) {
  const konteynerRef = useRef<HTMLDivElement>(null);
  const [gosterge, setGosterge] = useState({ sol: 0, genislik: 0 });

  const gostergeyiGuncelle = useCallback(() => {
    const kok = konteynerRef.current;
    if (!kok) return;
    const dugme = kok.querySelector<HTMLButtonElement>(`[data-ayarlar-sekme="${aktif}"]`);
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
    <div className="ap-ayarlar-tur-sarmal">
      <div className="ap-ayarlar-tur-cubugu" ref={konteynerRef} role="tablist" aria-label="Ayar sekmesi">
        <span
          className="ap-ayarlar-tur-gosterge"
          aria-hidden
          style={{ transform: `translateX(${gosterge.sol}px)`, width: gosterge.genislik }}
        />
        {SISTEM_SEKMELER.map((s) => {
          const secili = aktif === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              data-ayarlar-sekme={s.id}
              aria-selected={secili}
              tabIndex={secili ? 0 : -1}
              onClick={() => onDegistir(s.id)}
              className={`ap-ayarlar-tur-sekme ${secili ? 'ap-ayarlar-tur-sekme--aktif' : ''}`}
            >
              <span className="ap-ayarlar-tur-ikon" aria-hidden>
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

export function DurumAnahtari({
  etiket,
  aciklama,
  acik,
  onChange,
  renk = 'yesil',
  ikon,
  devreDisi = false,
  kompakt = false,
  sadeceToggle = false,
}: {
  etiket: string;
  aciklama?: string;
  acik: boolean;
  onChange: (v: boolean) => void;
  renk?: 'yesil' | 'turuncu' | 'mavi' | 'kirmizi';
  ikon?: string;
  devreDisi?: boolean;
  kompakt?: boolean;
  sadeceToggle?: boolean;
}) {
  if (sadeceToggle) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        aria-label={etiket}
        disabled={devreDisi}
        onClick={() => onChange(!acik)}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''} ${renk === 'turuncu' ? 'ap-toggle-turuncu' : ''} ${devreDisi ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    );
  }

  return (
    <div
      className={`ap-sistem-toggle ap-sistem-toggle-${renk} ${kompakt ? 'ap-sistem-toggle-kompakt' : ''} ${acik ? 'ap-sistem-toggle-aktif' : ''} ${devreDisi ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {ikon && <span className="ap-sistem-toggle-ikon">{ikon}</span>}
        <div>
          <span className="ap-heading block text-sm font-semibold">{etiket}</span>
          {aciklama && <span className="ap-muted mt-0.5 block text-xs leading-relaxed">{aciklama}</span>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        aria-label={etiket}
        disabled={devreDisi}
        onClick={() => onChange(!acik)}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''} ${renk === 'turuncu' ? 'ap-toggle-turuncu' : ''} ${devreDisi ? 'cursor-not-allowed' : ''}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    </div>
  );
}
