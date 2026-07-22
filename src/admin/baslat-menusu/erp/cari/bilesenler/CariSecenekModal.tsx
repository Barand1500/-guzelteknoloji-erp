import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { ModalListeIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';

export interface CariSecenekSatir {
  value: string;
  label: string;
}

interface CariSecenekModalProps {
  acik: boolean;
  baslik: string;
  placeholder?: string;
  liste: CariSecenekSatir[];
  sabitDegerler?: string[];
  /** Silinmek istenen değeri kullanan cari adedi; >0 ise silme engellenir */
  kullanimSayisiAl?: (value: string) => number;
  /** Örn. "tipi" / "işletme türünü" */
  kullanimNesneAdi?: string;
  onEkle: (ad: string) => boolean;
  onGuncelle?: (value: string, yeniAd: string) => boolean;
  onSil: (value: string) => void;
  onKapat: () => void;
}

export function CariSecenekModal({
  acik,
  baslik,
  placeholder = 'Yeni seçenek adı…',
  liste,
  sabitDegerler: _sabitDegerler = [],
  kullanimSayisiAl,
  kullanimNesneAdi = 'tipi',
  onEkle,
  onGuncelle,
  onSil,
  onKapat,
}: CariSecenekModalProps) {
  const [yeniAd, setYeniAd] = useState('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<string | null>(null);
  const [satirAd, setSatirAd] = useState('');
  const [silUyari, setSilUyari] = useState<{ etiket: string; adet: number } | null>(null);
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik) return;
    setYeniAd('');
    setHata('');
    setSatirDuzenle(null);
    setSatirAd('');
    setSilUyari(null);
  }, [acik]);

  const silDene = useCallback(
    (value: string, etiket: string) => {
      const adet = kullanimSayisiAl?.(value) ?? 0;
      if (adet > 0) {
        setSilUyari({ etiket, adet });
        return;
      }
      onSil(value);
    },
    [kullanimSayisiAl, onSil]
  );

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
    if (!acik || !portalKok) return;

    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (silUyari) {
          setSilUyari(null);
          return;
        }
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
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, onKapat, satirDuzenle, silUyari, portalKok]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka cari-secenek-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon={<ModalListeIkon />} onKapat={onKapat} />

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
                      if (!onGuncelle) return;
                      setSatirDuzenle(t.value);
                      setSatirAd(t.label);
                      setHata('');
                    }}
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
                      <span
                        className="cari-secenek-liste-ad"
                        title={onGuncelle ? 'Düzenlemek için çift tıklayınız.' : undefined}
                      >
                        {t.label}
                      </span>
                    )}
                    <button
                      type="button"
                      className="cari-secenek-liste-sil"
                      onClick={() => silDene(t.value, t.label)}
                      aria-label={`${t.label} sil`}
                      title="Sil"
                    >
                      <DgIkon ad="sil" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </DonenAccentCerceve>

      {silUyari ? (
        <div className="cari-secenek-sil-uyari" role="alertdialog" aria-modal="true" aria-label="Silme uyarısı">
          <div className="cari-secenek-sil-uyari-arka" aria-hidden="true" onClick={() => setSilUyari(null)} />
          <div className="cari-secenek-sil-uyari-kart">
            <div className="cari-secenek-sil-uyari-ikon" aria-hidden>
              !
            </div>
            <h4 className="cari-secenek-sil-uyari-baslik">Silinemez</h4>
            <p className="cari-secenek-sil-uyari-metin">
              <strong>{silUyari.etiket}</strong> için dikkat:{' '}
              <strong>{silUyari.adet} adet cari</strong> bu {kullanimNesneAdi} kullanıyor.
            </p>
            <p className="cari-secenek-sil-uyari-alt">
              Önce ilgili cari kartlarında bu seçimi değiştirin, sonra silmeyi deneyin.
            </p>
            <button
              type="button"
              className="ap-sil-onay-tus ap-sil-onay-tus--iptal cari-secenek-sil-uyari-tamam"
              onClick={() => setSilUyari(null)}
              autoFocus
            >
              <ModalTusIcerik metin="Tamam" kisayol="Esc" />
            </button>
          </div>
        </div>
      ) : null}
    </div>,
    portalKok
  );
}
