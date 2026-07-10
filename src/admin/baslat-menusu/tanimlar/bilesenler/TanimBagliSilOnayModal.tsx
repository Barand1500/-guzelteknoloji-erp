import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
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
      }
    }

    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, kapat]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div className="ap-sil-onay-modal" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--bagli-sil">
        <div className="ap-sil-onay-kart ap-tanimlar-sil-kart">
          <div className="ap-tanimlar-sil-ust">
            <div className="ap-tanimlar-sil-ikon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5a5 5 0 0 1 5 5v1.25h.625a.625.625 0 1 1 0 1.25H4.375a.625.625 0 0 1 0-1.25H5V7.5a5 5 0 0 1 5-5Zm0 1.25A3.75 3.75 0 0 0 6.25 7.5v1.25h7.5V7.5A3.75 3.75 0 0 0 10 3.75ZM4.375 11.25h11.25l-.687 6.188a1.25 1.25 0 0 1-1.243 1.125H6.305a1.25 1.25 0 0 1-1.243-1.125l-.687-6.188Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="ap-tanimlar-sil-baslik-alan">
              <h3 className="ap-tanimlar-sil-baslik">Bağlı kayıtlar var</h3>
              <p className="ap-tanimlar-sil-hedef">{hedefMetin}</p>
            </div>
          </div>

          {bagliOzet.length > 0 && (
            <ul className="ap-tanimlar-sil-etiketler" aria-label="Bağlı kayıtlar">
              {bagliOzet.map((etiket) => (
                <li key={etiket}>{etiket}</li>
              ))}
            </ul>
          )}

          <p className="ap-tanimlar-sil-soru">Nasıl devam etmek istiyorsunuz?</p>

          <div className="ap-tanimlar-sil-secenekler" role="radiogroup" aria-label="Silme seçeneği">
            <label
              className={`ap-tanimlar-sil-secenek${mod === 'hepsi' ? ' ap-tanimlar-sil-secenek--secili ap-tanimlar-sil-secenek--tehlike' : ''}`}
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
                  Tüm bağlı kayıtlar kalıcı olarak silinir. Geri alınamaz.
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
                  Kayıtlar silinmez; seçilen ve bağlı kayıtlar pasif olur.
                </span>
              </span>
            </label>
          </div>

          <div className="ap-tanimlar-sil-aksiyonlar">
            <button type="button" className="ap-tanimlar-sil-tus ap-tanimlar-sil-tus--iptal" onClick={kapat}>
              Vazgeç
            </button>
            <button
              type="button"
              className={`ap-tanimlar-sil-tus ap-tanimlar-sil-tus--onay${mod === 'hepsi' ? ' ap-tanimlar-sil-tus--tehlike' : ''}`}
              onClick={() => onOnayla(mod)}
            >
              {mod === 'hepsi' ? 'Hepsini Sil' : 'Pasif Yap'}
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
