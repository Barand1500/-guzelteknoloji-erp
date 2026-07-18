import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';

export interface CariSecenekSatir {
  value: string;
  label: string;
}

interface CariSecenekModalProps {
  acik: boolean;
  baslik: string;
  aciklama?: string;
  placeholder?: string;
  liste: CariSecenekSatir[];
  sabitDegerler?: string[];
  onEkle: (ad: string) => boolean;
  onSil: (value: string) => void;
  onKapat: () => void;
}

export function CariSecenekModal({
  acik,
  baslik,
  aciklama = 'Yeni seçenek ekleyin veya listeden yönetin.',
  placeholder = 'Yeni seçenek adı…',
  liste,
  sabitDegerler = [],
  onEkle,
  onSil,
  onKapat,
}: CariSecenekModalProps) {
  const [yeniAd, setYeniAd] = useState('');
  const [hata, setHata] = useState('');
  const sabit = new Set(sabitDegerler);

  useEffect(() => {
    if (!acik) return;
    setYeniAd('');
    setHata('');
  }, [acik]);

  const ekle = useCallback(() => {
    if (!onEkle(yeniAd)) {
      setHata('Geçerli ve benzersiz bir ad girin.');
      return;
    }
    setYeniAd('');
    setHata('');
  }, [onEkle, yeniAd]);

  useEffect(() => {
    if (!acik) return;

    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const hedef = e.target as HTMLElement | null;
        if (hedef?.tagName === 'INPUT') return;
        e.preventDefault();
        ekle();
      }
    }

    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat, ekle]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart">
          <div className="ap-sil-onay-ikon cari-secenek-ikon" aria-hidden>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden>
              <path
                d="M8 7h11M8 12h11M8 17h11"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
              <path
                d="M5 7h.01M5 12h.01M5 17h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="ap-sil-onay-baslik">{baslik}</h3>
          <p className="ap-sil-onay-metin cari-secenek-ozet">{aciklama}</p>

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle">
              <input
                type="text"
                className="ap-input"
                value={yeniAd}
                onChange={(e) => setYeniAd(e.target.value)}
                placeholder={placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ekle();
                  }
                }}
              />
              <button type="button" className="cari-secenek-ekle-tus" onClick={ekle}>
                Ekle
              </button>
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <ul className="cari-secenek-liste">
              {liste.map((t) => (
                <li key={t.value}>
                  <span className="cari-secenek-liste-ad">{t.label}</span>
                  {sabit.has(t.value) ? (
                    <em className="cari-secenek-liste-sabit">sabit</em>
                  ) : (
                    <button
                      type="button"
                      className="cari-secenek-liste-sil"
                      onClick={() => onSil(t.value)}
                      aria-label={`${t.label} sil`}
                    >
                      Sil
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="ap-sil-onay-aksiyonlar cari-secenek-aksiyonlar">
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={onKapat}>
              <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
            </button>
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={ekle}>
              <ModalTusIcerik metin="Ekle" kisayol="Enter" />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
