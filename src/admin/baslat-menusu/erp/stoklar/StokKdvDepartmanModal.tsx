import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { ModalListeIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import {
  kdvYuzdeFiltrele,
  type StokKdvDepartmaniSecenek,
} from './stokKdvDepartmanlari';

interface StokKdvDepartmanModalProps {
  acik: boolean;
  liste: StokKdvDepartmaniSecenek[];
  onEkle: (ad: string, yuzde: string) => boolean;
  onGuncelle: (value: string, ad: string, yuzde: string) => boolean;
  onSil: (value: string) => void;
  onKapat: () => void;
}

function yuzdeGoster(yuzde: string): string {
  const temiz = yuzde.trim();
  if (!temiz) return '—';
  return temiz.replace('.', ',');
}

export function StokKdvDepartmanModal({
  acik,
  liste,
  onEkle,
  onGuncelle,
  onSil,
  onKapat,
}: StokKdvDepartmanModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeniAd, setYeniAd] = useState('');
  const [yeniYuzde, setYeniYuzde] = useState('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<string | null>(null);
  const [satirAd, setSatirAd] = useState('');
  const [satirYuzde, setSatirYuzde] = useState('');
  const adInputRef = useRef<HTMLInputElement>(null);

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik) return;
    setYeniAd('');
    setYeniYuzde('');
    setHata('');
    setSatirDuzenle(null);
    setSatirAd('');
    setSatirYuzde('');
    requestAnimationFrame(() => adInputRef.current?.focus());
  }, [acik]);

  const ekle = useCallback(() => {
    if (!onEkle(yeniAd, yeniYuzde)) {
      setHata('Geçerli ve benzersiz bir ad ile KDV yüzdesi girin.');
      return;
    }
    setYeniAd('');
    setYeniYuzde('');
    setHata('');
  }, [onEkle, yeniAd, yeniYuzde]);

  const satirKaydet = useCallback(() => {
    if (!satirDuzenle) return;
    if (!onGuncelle(satirDuzenle, satirAd, satirYuzde)) {
      setHata('Geçerli ve benzersiz bir ad ile KDV yüzdesi girin.');
      return;
    }
    setSatirDuzenle(null);
    setSatirAd('');
    setSatirYuzde('');
    setHata('');
  }, [onGuncelle, satirAd, satirDuzenle, satirYuzde]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle !== null) {
          setSatirDuzenle(null);
          setSatirAd('');
          setSatirYuzde('');
          setHata('');
          return;
        }
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, onKapat, portalKok, satirDuzenle]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal stok-coklu-fiyat-modal stok-kdv-departman-modal"
      role="dialog"
      aria-modal="true"
      aria-label="KDV Departmanı"
    >
      <div className="ap-sil-onay-arka cari-secenek-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik="KDV Departmanı" ikon={<ModalListeIkon />} onKapat={onKapat} />

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle stok-coklu-fiyat-ekle">
              <div className="stok-coklu-fiyat-input-grup stok-kdv-departman-input-grup">
                <input
                  ref={adInputRef}
                  type="text"
                  className="ap-input stok-coklu-fiyat-ekle-input"
                  value={yeniAd}
                  onChange={(e) => setYeniAd(e.target.value)}
                  placeholder="KDV departmanı adı"
                  aria-label="KDV departmanı adı"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ekle();
                    }
                  }}
                />
                <input
                  type="text"
                  className="ap-input stok-kdv-departman-yuzde"
                  value={yeniYuzde}
                  onChange={(e) => setYeniYuzde(kdvYuzdeFiltrele(e.target.value))}
                  placeholder="Oran"
                  inputMode="decimal"
                  aria-label="KDV oranı"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ekle();
                    }
                  }}
                />
                <button type="button" className="stok-coklu-fiyat-ekle-btn" onClick={ekle}>
                  Ekle
                </button>
              </div>
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <div className="stok-coklu-barkod-tablo-wrap">
              <table className="stok-coklu-barkod-tablo stok-kdv-departman-tablo">
                <colgroup>
                  <col className="stok-kdv-departman-tablo-col-adi" />
                  <col className="stok-kdv-departman-tablo-col-yuzde" />
                  <col className="stok-kdv-departman-tablo-col-islem" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Adı</th>
                    <th>Oran</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="stok-coklu-barkod-tablo-bos">
                        Henüz KDV departmanı yok.
                      </td>
                    </tr>
                  ) : (
                    liste.map((oge) => {
                      const duzenleniyor = satirDuzenle === oge.value;
                      return (
                        <tr
                          key={oge.value}
                          className={duzenleniyor ? 'stok-coklu-barkod-tablo-satir--duzenleniyor' : undefined}
                          onDoubleClick={() => {
                            if (duzenleniyor) return;
                            setSatirDuzenle(oge.value);
                            setSatirAd(oge.label);
                            setSatirYuzde(oge.yuzde);
                            setHata('');
                          }}
                        >
                          {duzenleniyor ? (
                            <>
                              <td className="stok-kdv-departman-tablo-duzenle-hucre stok-kdv-departman-tablo-duzenle-adi">
                                <input
                                  type="text"
                                  className="stok-kdv-departman-tablo-input"
                                  value={satirAd}
                                  autoFocus
                                  aria-label={`${oge.label} adı`}
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
                                      setSatirYuzde('');
                                      setHata('');
                                    }
                                  }}
                                />
                              </td>
                              <td className="stok-kdv-departman-tablo-duzenle-hucre stok-kdv-departman-tablo-duzenle-yuzde">
                                <input
                                  type="text"
                                  className="stok-kdv-departman-tablo-input stok-kdv-departman-tablo-input--yuzde"
                                  value={satirYuzde}
                                  inputMode="decimal"
                                  aria-label={`${oge.label} yüzdesi`}
                                  placeholder="Oran"
                                  onChange={(e) => setSatirYuzde(kdvYuzdeFiltrele(e.target.value))}
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
                                      setSatirYuzde('');
                                      setHata('');
                                    }
                                  }}
                                />
                              </td>
                              <td className="stok-coklu-barkod-tablo-islem" aria-hidden />
                            </>
                          ) : (
                            <>
                              <td
                                className="stok-coklu-barkod-tablo-adi"
                                title="Düzenlemek için çift tıklayınız."
                              >
                                {oge.label || '—'}
                              </td>
                              <td className="stok-coklu-barkod-tablo-kodu stok-kdv-departman-tablo-yuzde">
                                {yuzdeGoster(oge.yuzde)}
                              </td>
                              <td className="stok-coklu-barkod-tablo-islem">
                                <button
                                  type="button"
                                  className="stok-coklu-barkod-tablo-sil"
                                  onClick={() => onSil(oge.value)}
                                  aria-label={`${oge.label} sil`}
                                  title="Sil"
                                >
                                  <DgIkon ad="sil" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
