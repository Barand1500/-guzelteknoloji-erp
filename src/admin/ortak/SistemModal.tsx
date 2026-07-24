import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';

export type SistemModalGenislik = 'sm' | 'md' | 'lg';

const GENISLIK_SINIF: Record<SistemModalGenislik, string> = {
  sm: 'ap-sistem-modal-sm',
  md: '',
  lg: 'ap-sistem-modal-lg',
};

interface SistemModalProps {
  acik: boolean;
  onKapat: () => void;
  baslik: string;
  altBaslik?: string;
  ikon?: string;
  genislik?: SistemModalGenislik;
  kapatmaDevreDisi?: boolean;
  /** false ise arka plana tıklayınca kapanmaz (varsayılan: true) */
  disariTiklaKapat?: boolean;
  /** false ise Escape ile kapanmaz (varsayılan: true) */
  escapeIleKapat?: boolean;
  baslikId?: string;
  /** Varsayılan true — üstteki gradient çizgi */
  ustCizgi?: boolean;
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
  disariTiklaKapat = true,
  escapeIleKapat = true,
  baslikId,
  ustCizgi = true,
  children,
  footer,
}: SistemModalProps) {
  const sekme = useAdminSekmeKabuk();
  const kapat = useCallback(() => {
    if (!kapatmaDevreDisi) onKapat();
  }, [kapatmaDevreDisi, onKapat]);

  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik || !portalKok || !escapeIleKapat) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape' && !kapatmaDevreDisi) {
        e.preventDefault();
        kapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, portalKok, kapatmaDevreDisi, kapat, escapeIleKapat]);

  if (!acik || !portalKok) return null;

  const genislikSinifi = GENISLIK_SINIF[genislik];

  return createPortal(
    <div
      className="ap-sistem-modal-arka ap-sistem-modal-arka-sabit"
      role="dialog"
      aria-modal="true"
      aria-labelledby={baslikId}
    >
      {disariTiklaKapat ? (
        <button type="button" className="ap-sistem-modal-arka-tik" aria-label="Kapat" onClick={kapat} />
      ) : (
        <div className="ap-sistem-modal-arka-tik" aria-hidden />
      )}
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sistem">
        <div
          className={`ap-sistem-modal ap-sistem-modal-v2 ${genislikSinifi}`.trim()}
          onClick={(e) => e.stopPropagation()}
        >
          {ustCizgi ? <div className="ap-sistem-modal-v2-ust-cizgi" aria-hidden /> : null}
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
              onClick={kapat}
              disabled={kapatmaDevreDisi}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
          <div className="ap-sistem-modal-govde ap-sistem-modal-govde-v2">{children}</div>
          {footer && <div className="ap-sistem-modal-alt ap-sistem-modal-alt-v2">{footer}</div>}
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}

export function SistemModalAksiyonlar({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
