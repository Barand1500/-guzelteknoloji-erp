import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import type { GorevKayitGirdi, YapilacakGorev } from './yapilacaklarDepo';

interface GorevModalProps {
  acik: boolean;
  baslik: string;
  gorev?: YapilacakGorev | null;
  onKaydet: (deger: GorevKayitGirdi) => void;
  onKapat: () => void;
}

export function GorevModal({ acik, baslik, gorev, onKaydet, onKapat }: GorevModalProps) {
  const [metin, setMetin] = useState('');
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [onemli, setOnemli] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    setMetin(gorev?.baslik ?? '');
    setBaslangic(gorev?.tarih ?? '');
    setBitis(gorev?.bitisTarih ?? gorev?.tarih ?? '');
    setOnemli(gorev?.onemli ?? false);
    setHata('');
  }, [acik, gorev]);

  const kaydet = useCallback(() => {
    const temiz = metin.trim();
    if (!temiz) {
      setHata('Görev metni gerekli.');
      return;
    }
    if (baslangic && bitis && bitis < baslangic) {
      setHata('Bitiş tarihi başlangıçtan önce olamaz.');
      return;
    }
    if (!baslangic && bitis) {
      setHata('Bitiş için önce başlangıç tarihi seçin.');
      return;
    }
    onKaydet({
      baslik: temiz,
      tarih: baslangic.trim() || null,
      bitisTarih: bitis.trim() || baslangic.trim() || null,
      onemli,
    });
  }, [metin, baslangic, bitis, onemli, onKaydet]);

  useEffect(() => {
    if (!acik) return;
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const hedef = e.target as HTMLElement | null;
        if (hedef?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        kaydet();
      }
    }
    document.addEventListener('keydown', tus);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tus);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat, kaydet]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div className="ap-sil-onay-modal yap-gorev-modal" role="dialog" aria-modal="true" aria-label={baslik}>
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--yap-gorev">
        <div className="ap-sil-onay-kart yap-gorev-kart">
          <div className="ap-sil-onay-ikon yap-gorev-ikon" aria-hidden>
            ✓
          </div>
          <h3 className="ap-sil-onay-baslik">{baslik}</h3>
          <p className="ap-sil-onay-metin yap-gorev-ozet">
            Tarih yoksa <strong>tarihsiz görevler</strong> arasında görünür.
          </p>

          <div className="yap-gorev-govde">
            <label className="yap-gorev-alan">
              <span>Görev</span>
              <input
                type="text"
                className="ap-input yap-gorev-input"
                value={metin}
                onChange={(e) => setMetin(e.target.value)}
                placeholder="Ne yapılacak?"
                autoFocus
                maxLength={200}
              />
            </label>

            <div className="yap-gorev-tarih-grid">
              <label className="yap-gorev-alan">
                <span>Başlangıç</span>
                <input
                  type="date"
                  className="ap-input yap-gorev-input"
                  value={baslangic}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBaslangic(v);
                    if (v && bitis && bitis < v) setBitis(v);
                    if (!v) setBitis('');
                  }}
                />
              </label>
              <label className="yap-gorev-alan">
                <span>Bitiş</span>
                <input
                  type="date"
                  className="ap-input yap-gorev-input"
                  value={bitis}
                  min={baslangic || undefined}
                  disabled={!baslangic}
                  onChange={(e) => setBitis(e.target.value)}
                />
              </label>
            </div>

            <label className={`yap-gorev-onemli${onemli ? ' yap-gorev-onemli--acik' : ''}`}>
              <input type="checkbox" checked={onemli} onChange={(e) => setOnemli(e.target.checked)} />
              <span className="yap-gorev-onemli-yildiz" aria-hidden>
                ★
              </span>
              <span>Önemli</span>
            </label>

            {hata ? <p className="yap-gorev-hata">{hata}</p> : null}
          </div>

          <div className="ap-sil-onay-aksiyonlar">
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={onKapat}>
              <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
            </button>
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={kaydet}>
              <ModalTusIcerik metin="Kaydet" kisayol="Enter" />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
