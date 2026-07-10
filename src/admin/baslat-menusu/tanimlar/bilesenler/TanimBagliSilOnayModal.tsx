import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import type { TanimSilModu } from '@/admin/baslat-menusu/tanimlar/api';

interface TanimBagliSilOnayModalProps {
  acik: boolean;
  onKapat: () => void;
  onOnayla: (mod: TanimSilModu) => void;
  hedefMetin: string;
  bagliOzet: string[];
  ariaLabel?: string;
}

export function TanimBagliSilOnayModal({
  acik,
  onKapat,
  onOnayla,
  hedefMetin,
  bagliOzet,
  ariaLabel = 'Silme onayı',
}: TanimBagliSilOnayModalProps) {
  const [mod, setMod] = useState<TanimSilModu>('hepsi');
  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    if (acik) setMod('hepsi');
  }, [acik]);

  useEffect(() => {
    if (!acik) return;

    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const hedef = e.target as HTMLElement | null;
        if (hedef?.closest('.ap-tanimlar-sil-secenekler')) return;
        e.preventDefault();
        onOnayla(mod);
      }
    }

    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, kapat, onOnayla, mod]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;
  const bagliMetin = bagliOzet.join(', ');

  return createPortal(
    <div className="ap-sil-onay-modal" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil">
        <div className="ap-sil-onay-kart ap-sil-onay-kart--bagli">
          <div className="ap-sil-onay-ikon" aria-hidden>
            !
          </div>
          <h3 className="ap-sil-onay-baslik">Bağlı kayıtlar bulundu</h3>
          <p className="ap-sil-onay-metin">
            <strong>{hedefMetin}</strong> kaydına bağlı <strong>{bagliMetin}</strong> var. Nasıl
            devam etmek istiyorsunuz?
          </p>

          <div className="ap-tanimlar-sil-secenekler" role="radiogroup" aria-label="Silme seçeneği">
            <label
              className={`ap-tanimlar-sil-secenek${mod === 'hepsi' ? ' ap-tanimlar-sil-secenek--secili' : ''}`}
            >
              <input
                type="radio"
                name="tanim-sil-mod"
                value="hepsi"
                checked={mod === 'hepsi'}
                onChange={() => setMod('hepsi')}
              />
              <span className="ap-tanimlar-sil-secenek-isaret" aria-hidden />
              <span className="ap-tanimlar-sil-secenek-metin">
                <span className="ap-tanimlar-sil-secenek-baslik">Bağlı kayıtlarla birlikte sil</span>
                <span className="ap-tanimlar-sil-secenek-aciklama">
                  Kalıcı olarak silinir. Geri alınamaz.
                </span>
              </span>
            </label>

            <label
              className={`ap-tanimlar-sil-secenek${mod === 'pasif' ? ' ap-tanimlar-sil-secenek--secili' : ''}`}
            >
              <input
                type="radio"
                name="tanim-sil-mod"
                value="pasif"
                checked={mod === 'pasif'}
                onChange={() => setMod('pasif')}
              />
              <span className="ap-tanimlar-sil-secenek-isaret" aria-hidden />
              <span className="ap-tanimlar-sil-secenek-metin">
                <span className="ap-tanimlar-sil-secenek-baslik">Pasif yap</span>
                <span className="ap-tanimlar-sil-secenek-aciklama">
                  Kayıtlar silinmez; hepsi pasif duruma alınır.
                </span>
              </span>
            </label>
          </div>

          <div className="ap-sil-onay-aksiyonlar">
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={kapat}>
              <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
            </button>
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={() => onOnayla(mod)}>
              <ModalTusIcerik
                metin={mod === 'hepsi' ? 'Evet, Hepsini Sil' : 'Pasif Yap'}
                kisayol="Enter"
              />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
