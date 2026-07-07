import { useEffect, type ReactNode } from 'react';

export type SistemModalGenislik = 'sm' | 'md' | 'bayi' | 'firma';

const GENISLIK_SINIF: Record<SistemModalGenislik, string> = {
  sm: 'ap-master-modul-modal',
  md: '',
  bayi: 'ap-master-bayi-modal',
  firma: 'ap-master-firma-modal',
};

interface SistemModalProps {
  acik: boolean;
  onKapat: () => void;
  baslik: string;
  altBaslik?: string;
  ikon?: string;
  genislik?: SistemModalGenislik;
  kapatmaDevreDisi?: boolean;
  baslikId?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SistemModal({
  acik,
  onKapat,
  baslik,
  altBaslik,
  ikon,
  genislik = 'md',
  kapatmaDevreDisi,
  baslikId,
  children,
  footer,
}: SistemModalProps) {
  useEffect(() => {
    if (!acik) return;
    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape' && !kapatmaDevreDisi) {
        e.preventDefault();
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat, kapatmaDevreDisi]);

  if (!acik) return null;

  const genislikSinifi = GENISLIK_SINIF[genislik];

  return (
    <div className="ap-sistem-modal-arka ap-sistem-modal-arka-sabit" role="dialog" aria-modal="true" aria-labelledby={baslikId}>
      <div
        className={`ap-sistem-modal ap-sistem-modal-v2 ap-master-modal ${genislikSinifi}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ap-sistem-modal-v2-ust-cizgi" aria-hidden />
        <div className="ap-sistem-modal-baslik ap-sistem-modal-baslik-v2">
          {ikon && <span className="ap-sistem-modal-ikon">{ikon}</span>}
          <div className="min-w-0 flex-1">
            <h2 id={baslikId} className="ap-heading text-base font-bold leading-tight">
              {baslik}
            </h2>
            {altBaslik && <p className="ap-muted mt-1 text-sm leading-snug">{altBaslik}</p>}
          </div>
          <button
            type="button"
            className="ap-sistem-modal-kapat ap-sistem-modal-kapat-v2"
            onClick={onKapat}
            disabled={kapatmaDevreDisi}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="ap-sistem-modal-govde ap-sistem-modal-govde-v2">{children}</div>
        {footer && <div className="ap-sistem-modal-alt ap-sistem-modal-alt-v2 ap-master-modal-aksiyonlar">{footer}</div>}
      </div>
    </div>
  );
}

export function SistemModalAksiyonlar({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
