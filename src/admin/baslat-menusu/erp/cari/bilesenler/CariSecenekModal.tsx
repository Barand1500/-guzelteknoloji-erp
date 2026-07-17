import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SistemModal } from '@/admin/ortak/SistemModal';
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

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={baslik}
      altBaslik={aciklama}
      genislik="sm"
      baslikId="cari-secenek-modal-baslik"
      footer={
        <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={onKapat}>
          <ModalTusIcerik metin="Kapat" kisayol="Esc" />
        </button>
      }
    >
      <div className="cari-secenek-govde">
        <div className="cari-secenek-ekle">
          <input
            type="text"
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
          <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={ekle}>
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
    </SistemModal>,
    portalKok
  );
}
