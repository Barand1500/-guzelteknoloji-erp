import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';

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
  onGuncelle?: (value: string, yeniAd: string) => boolean;
  onSil: (value: string) => void;
  onKapat: () => void;
}

export function CariSecenekModal({
  acik,
  baslik,
  aciklama = 'Yeni seçenek ekleyin. Listede düzenlemek için çift tıklayın.',
  placeholder = 'Yeni seçenek adı…',
  liste,
  sabitDegerler = [],
  onEkle,
  onGuncelle,
  onSil,
  onKapat,
}: CariSecenekModalProps) {
  const [yeniAd, setYeniAd] = useState('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<string | null>(null);
  const [satirAd, setSatirAd] = useState('');
  const sabit = new Set(sabitDegerler);

  useEffect(() => {
    if (!acik) return;
    setYeniAd('');
    setHata('');
    setSatirDuzenle(null);
    setSatirAd('');
  }, [acik]);

  const ekle = useCallback(() => {
    if (!onEkle(yeniAd)) {
      setHata('Geçerli ve benzersiz bir ad girin.');
      return;
    }
    setYeniAd('');
    setHata('');
  }, [onEkle, yeniAd]);

  const satirKaydet = useCallback(() => {
    if (!satirDuzenle || !onGuncelle) return;
    if (!onGuncelle(satirDuzenle, satirAd)) {
      setHata('Geçerli ve benzersiz bir ad girin.');
      return;
    }
    setSatirDuzenle(null);
    setSatirAd('');
    setHata('');
  }, [onGuncelle, satirAd, satirDuzenle]);

  useEffect(() => {
    if (!acik) return;

    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle) {
          setSatirDuzenle(null);
          setSatirAd('');
          setHata('');
          return;
        }
        onKapat();
      }
    }

    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat, satirDuzenle]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka cari-secenek-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart">
          <button
            type="button"
            className="cari-secenek-kapat"
            onClick={onKapat}
            aria-label="Kapat (Esc)"
            title="Kapat (Esc)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span>Esc</span>
          </button>

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
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <ul className="cari-secenek-liste">
              {liste.map((t) => {
                const duzenleniyor = satirDuzenle === t.value;
                return (
                  <li
                    key={t.value}
                    className={duzenleniyor ? 'cari-secenek-liste--duzenleniyor' : undefined}
                    onDoubleClick={() => {
                      if (!onGuncelle || sabit.has(t.value)) return;
                      setSatirDuzenle(t.value);
                      setSatirAd(t.label);
                      setHata('');
                    }}
                    title={onGuncelle && !sabit.has(t.value) ? 'Düzenlemek için çift tıklayın' : undefined}
                  >
                    {duzenleniyor ? (
                      <input
                        type="text"
                        className="cari-secenek-satir-input"
                        value={satirAd}
                        autoFocus
                        onChange={(e) => setSatirAd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            satirKaydet();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setSatirDuzenle(null);
                            setSatirAd('');
                            setHata('');
                          }
                        }}
                        onBlur={() => satirKaydet()}
                      />
                    ) : (
                      <span className="cari-secenek-liste-ad">{t.label}</span>
                    )}
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
                );
              })}
            </ul>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
