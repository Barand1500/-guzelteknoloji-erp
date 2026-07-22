import { useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';

interface SilmeOnayModalProps {
  acik: boolean;
  onKapat: () => void;
  onOnayla: () => void;
  baslik?: string;
  hedefMetin: string;
  ariaLabel?: string;
  onayMetin?: string;
  iptalMetin?: string;
}

export function SilmeOnayModal({
  acik,
  onKapat,
  onOnayla,
  baslik = 'Bu kaydı silmek istiyor musunuz?',
  hedefMetin,
  ariaLabel = 'Silme onayı',
  onayMetin = 'Evet, Sil',
  iptalMetin = 'Vazgeç',
}: SilmeOnayModalProps) {
  const sekme = useAdminSekmeKabuk();
  const kapat = useCallback(() => onKapat(), [onKapat]);
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik || !portalKok) return;

    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onOnayla();
      }
    }

    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, kapat, onOnayla, portalKok]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div className="ap-sil-onay-modal" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil">
        <div className="ap-sil-onay-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon="!" onKapat={kapat} />
          <p className="ap-sil-onay-metin">
            <strong>{hedefMetin}</strong> kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </p>
          <div className="ap-sil-onay-aksiyonlar">
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={kapat}>
              <ModalTusIcerik metin={iptalMetin} kisayol="Esc" />
            </button>
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={onOnayla}>
              <ModalTusIcerik metin={onayMetin} kisayol="Enter" />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
