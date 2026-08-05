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
  ikon?: ReactNode;
  /** İkon kutusunu gölgesiz / düz göster */
  ikonFlat?: boolean;
  genislik?: SistemModalGenislik;
  kapatmaDevreDisi?: boolean;
  /** false ise arka plana tıklayınca kapanmaz (varsayılan: true) */
  disariTiklaKapat?: boolean;
  /** false ise Escape ile kapanmaz (varsayılan: true) */
  escapeIleKapat?: boolean;
  /** Escape için özel aksiyon (verilirse onKapat yerine bu çağrılır) */
  onEscape?: () => void;
  /** Enter tuşu (Shift olmadan) */
  onEnter?: () => void;
  baslikId?: string;
  /** Varsayılan true — üstteki gradient çizgi */
  ustCizgi?: boolean;
  /** Kapat butonu metni (ör. ✕ ESC) */
  kapatEtiket?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Modal kartının sağına ek panel (yardım vb.) */
  yanIcerik?: ReactNode;
}

export function SistemModal({
  acik,
  onKapat,
  baslik,
  altBaslik,
  ikon,
  ikonFlat = false,
  genislik = 'md',
  kapatmaDevreDisi,
  disariTiklaKapat = true,
  escapeIleKapat = true,
  onEscape,
  onEnter,
  baslikId,
  ustCizgi = true,
  kapatEtiket = '✕',
  children,
  footer,
  yanIcerik,
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
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape' && escapeIleKapat && !kapatmaDevreDisi) {
        e.preventDefault();
        if (onEscape) onEscape();
        else kapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && onEnter && !kapatmaDevreDisi) {
        e.preventDefault();
        onEnter();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, portalKok, kapatmaDevreDisi, kapat, escapeIleKapat, onEscape, onEnter]);

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
      <div className={`ap-sistem-modal-sira${yanIcerik ? ' ap-sistem-modal-sira--yan' : ''}`}>
        <DonenAccentCerceve
          className={`ap-accent-donen-cerceve--sistem${genislik !== 'md' ? ` ap-accent-donen-cerceve--sistem-${genislik}` : ''}`}
        >
          <div
            className={`ap-sistem-modal ap-sistem-modal-v2 ${genislikSinifi}`.trim()}
            onClick={(e) => e.stopPropagation()}
          >
            {ustCizgi ? <div className="ap-sistem-modal-v2-ust-cizgi" aria-hidden /> : null}
            <div className="ap-sistem-modal-baslik ap-sistem-modal-baslik-v2">
              {ikon ? (
                <span
                  className={`ap-sistem-modal-ikon${ikonFlat ? ' ap-sistem-modal-ikon--flat' : ''}`}
                >
                  {ikon}
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 id={baslikId} className="ap-heading text-base font-bold leading-tight">
                  {baslik}
                </h2>
                {altBaslik && <p className="ap-muted mt-1 text-sm leading-snug">{altBaslik}</p>}
              </div>
              <button
                type="button"
                className="ap-sistem-modal-kapat ap-sistem-modal-kapat-v2 ap-modal-kapat-pil"
                onClick={kapat}
                disabled={kapatmaDevreDisi}
                aria-label="Kapat (Esc)"
                title="Kapat (Esc)"
              >
                {kapatEtiket === '✕ ESC' || kapatEtiket === '✕ Esc' ? (
                  <>
                    ✕ <span className="ap-modal-kapat-pil-kisayol">ESC</span>
                  </>
                ) : (
                  kapatEtiket
                )}
              </button>
            </div>
            <div className="ap-sistem-modal-govde ap-sistem-modal-govde-v2">{children}</div>
            {footer && <div className="ap-sistem-modal-alt ap-sistem-modal-alt-v2">{footer}</div>}
          </div>
        </DonenAccentCerceve>
        {yanIcerik}
      </div>
    </div>,
    portalKok
  );
}

export function SistemModalAksiyonlar({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
