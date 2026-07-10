import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';

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
  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    if (!acik) return;

    function tusHandler(e: KeyboardEvent) {
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
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, kapat, onOnayla]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div className="ap-sil-onay-modal" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil">
        <div className="ap-sil-onay-kart">
          <div className="ap-sil-onay-ikon" aria-hidden>
            !
          </div>
          <h3 className="ap-sil-onay-baslik">{baslik}</h3>
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
