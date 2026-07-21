import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import type { AdminCari } from '../tipler';

const LISTE_LIMIT = 40;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function normalizeMetin(metin: string) {
  return metin.trim().toLocaleLowerCase('tr');
}

export function CariUstCariBaslikSecici({
  ustId,
  onChange,
  cariler,
  haricId,
  disabled = false,
}: {
  ustId: string;
  onChange: (ustId: string) => void;
  cariler: AdminCari[];
  haricId?: string | null;
  disabled?: boolean;
}) {
  const listeId = useId();
  const aramaRef = useRef<HTMLInputElement>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [arama, setArama] = useState('');
  const [odakIndex, setOdakIndex] = useState(0);

  const secili = useMemo(
    () => (ustId ? cariler.find((c) => c.id === ustId) ?? null : null),
    [cariler, ustId]
  );

  const adaylar = useMemo(() => {
    const q = normalizeMetin(arama);
    const taban = cariler.filter((c) => c.id !== haricId && c.aktif);
    if (!q) return taban.slice(0, LISTE_LIMIT);
    return taban
      .filter((c) => {
        const alanlar = [c.cariKodu, c.cariAdi, c.unvan];
        return alanlar.some((a) => normalizeMetin(a ?? '').includes(q));
      })
      .slice(0, LISTE_LIMIT);
  }, [arama, cariler, haricId]);

  const modalKapat = () => {
    setModalAcik(false);
    setArama('');
    setOdakIndex(0);
  };

  const sec = (c: AdminCari) => {
    onChange(c.id);
    modalKapat();
  };

  const temizle = () => {
    onChange('');
  };

  useEffect(() => {
    if (!modalAcik) return;
    setArama('');
    setOdakIndex(0);
    const t = window.setTimeout(() => aramaRef.current?.focus(), 30);
    document.body.style.overflow = 'hidden';

    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        modalKapat();
      }
    }
    document.addEventListener('keydown', tusHandler, true);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', tusHandler, true);
    };
  }, [modalAcik]);

  useEffect(() => {
    setOdakIndex(0);
  }, [arama]);

  useEffect(() => {
    if (!modalAcik) return;
    const el = document.getElementById(`${listeId}-oge-${odakIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [odakIndex, listeId, modalAcik, adaylar.length]);

  return (
    <div className={`cari-ust-baslik-secici${disabled ? ' cari-ust-baslik-secici--pasif' : ''}`}>
      <span className="cari-ust-baslik-etiket">Üst Cari</span>

      {secili ? (
        <div className="cari-ust-baslik-secili-kutu">
          <span className="cari-ust-baslik-secili">
            <span className="cari-ust-baslik-secili-kod">{secili.cariKodu}</span>
            <span className="cari-ust-baslik-secili-ad">{secili.cariAdi}</span>
          </span>
          {!disabled ? (
            <button
              type="button"
              className="cari-ust-baslik-temizle-x"
              onClick={temizle}
              aria-label="Üst cari seçimini kaldır"
              title="Seçimi kaldır"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="cari-ust-baslik-sec-tus"
          disabled={disabled}
          onClick={() => setModalAcik(true)}
        >
          Üst Cari Seçiniz
        </button>
      )}

      {modalAcik && !disabled
        ? createPortal(
            <div
              className="ap-sil-onay-modal cari-ust-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Üst cari seç"
            >
              <div className="ap-sil-onay-arka cari-ust-modal-arka" aria-hidden />
              <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
                <div className="ap-sil-onay-kart cari-ust-modal-kart">
                  <button
                    type="button"
                    className="cari-secenek-kapat"
                    onClick={modalKapat}
                    aria-label="Kapat (Esc)"
                    title="Kapat (Esc)"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
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
                  <h3 className="ap-sil-onay-baslik">Üst Cari Seç</h3>
                  <p className="ap-sil-onay-metin cari-secenek-ozet">
                    Üst cariyi arayıp listeden seçin.
                  </p>

                  <div className="cari-ust-modal-govde">
                    <label className="cari-ust-modal-ara-kutu">
                      <svg
                        className="cari-ust-modal-ara-ikon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        aria-hidden
                      >
                        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M16.5 16.5L20 20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        ref={aramaRef}
                        type="search"
                        className="cari-ust-modal-ara"
                        value={arama}
                        placeholder="Cari kodu, adı veya ünvan ara…"
                        aria-controls={listeId}
                        aria-activedescendant={
                          adaylar[odakIndex] ? `${listeId}-oge-${odakIndex}` : undefined
                        }
                        onChange={(e) => setArama(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (adaylar.length === 0) return;
                            setOdakIndex((i) => Math.min(i + 1, adaylar.length - 1));
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (adaylar.length === 0) return;
                            setOdakIndex((i) => Math.max(i - 1, 0));
                            return;
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const hedef = adaylar[odakIndex] ?? adaylar[0];
                            if (hedef) sec(hedef);
                            return;
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            modalKapat();
                          }
                        }}
                      />
                    </label>

                    <div className="cari-ust-modal-tablo">
                      <div className="cari-ust-modal-tablo-baslik" aria-hidden>
                        <span>Kod</span>
                        <span>Ad</span>
                      </div>

                      <ul id={listeId} className="cari-ust-modal-liste" role="listbox">
                        {adaylar.length === 0 ? (
                          <li className="cari-ust-modal-bos">Sonuç bulunamadı</li>
                        ) : (
                          adaylar.map((c, index) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                id={`${listeId}-oge-${index}`}
                                role="option"
                                aria-selected={index === odakIndex}
                                className={`cari-ust-modal-oge${index === odakIndex ? ' cari-ust-modal-oge--odak' : ''}`}
                                onMouseEnter={() => setOdakIndex(index)}
                                onClick={() => sec(c)}
                              >
                                <span className="cari-ust-modal-oge-kod">{c.cariKodu}</span>
                                <span className="cari-ust-modal-oge-ad">{c.cariAdi}</span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>

                      <div className="cari-ust-modal-alt">
                        <span>
                          {adaylar.length === 0
                            ? 'Kayıt yok'
                            : `${adaylar.length} sonuç`}
                        </span>
                        <span className="cari-ust-modal-alt-ipucu">↑↓ gez · Enter seç</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DonenAccentCerceve>
            </div>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
