import { type ReactNode } from 'react';

interface DonenMaviCerceveProps {
  children: ReactNode;
  className?: string;
  /** Kare yerine yuvarlak cerceve (sosyal ikonlar icin) */
  yuvarlak?: boolean;
  /** Hover disinda da hafif parlama */
  surekli?: boolean;
}

export function DonenMaviCerceve({
  children,
  className = '',
  yuvarlak = false,
  surekli = false,
}: DonenMaviCerceveProps) {
  return (
    <div
      className={[
        'erp-donen-cerceve',
        yuvarlak ? 'erp-donen-cerceve-yuvarlak' : '',
        surekli ? 'erp-donen-cerceve-surekli' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="erp-donen-cerceve-iz" aria-hidden />
      <div className="erp-donen-cerceve-icerik">{children}</div>
    </div>
  );
}
