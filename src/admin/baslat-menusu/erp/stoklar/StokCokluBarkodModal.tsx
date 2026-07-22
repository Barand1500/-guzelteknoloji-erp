import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
import { barkodFiltrele } from './stokYeniBirimlerYardimci';
import {
  STOK_COKLU_BARKOD_ADET,
  stokCokluBarkodDegeri,
  stokCokluBarkodDoluMu,
  stokCokluBarkodEtiketi,
  stokCokluBarkodIlkBosSira,
  stokCokluBarkodPatch,
  stokCokluBarkodSiraGecerliMi,
  stokCokluBarkodTasi,
} from './stokCokluBarkodYardimci';

interface StokCokluBarkodModalProps {
  acik: boolean;
  satir: StokFiyatDuzenleSatir;
  onKaydet: (patch: Partial<StokFiyatDuzenleSatir>) => void;
  onKapat: () => void;
}

function siraHamFiltrele(ham: string): string {
  return ham.replace(/\D/g, '').slice(0, 1);
}

export function StokCokluBarkodModal({ acik, satir, onKaydet, onKapat }: StokCokluBarkodModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeniSira, setYeniSira] = useState('1');
  const [yeniBarkod, setYeniBarkod] = useState('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [satirSira, setSatirSira] = useState('');
  const [satirBarkod, setSatirBarkod] = useState('');

  useSekmeModalGovdeKilidi(acik, portalKok);

  const liste = useMemo(() => {
    const siralar: number[] = [];
    for (let sira = 1; sira <= STOK_COKLU_BARKOD_ADET; sira += 1) {
      if (stokCokluBarkodDoluMu(satir, sira)) siralar.push(sira);
    }
    return siralar.map((sira) => ({
      sira,
      etiket: stokCokluBarkodEtiketi(sira),
      deger: stokCokluBarkodDegeri(satir, sira),
    }));
  }, [satir]);

  const ilkBosSira = useMemo(() => stokCokluBarkodIlkBosSira(satir), [satir]);

  useEffect(() => {
    if (!acik) return;
    setYeniSira(String(ilkBosSira ?? 1));
    setYeniBarkod('');
    setHata('');
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirBarkod('');
  }, [acik, ilkBosSira, satir.id]);

  const ekle = useCallback(() => {
    const sira = Number(yeniSira);
    if (!stokCokluBarkodSiraGecerliMi(sira)) {
      setHata('Sıra numarası 1–6 arasında olmalı.');
      return;
    }
    const ham = barkodFiltrele(yeniBarkod.trim());
    if (!ham) {
      setHata('Barkod girin.');
      return;
    }
    onKaydet(stokCokluBarkodPatch(sira, ham));
    const sonrakiSatir = { ...satir, ...stokCokluBarkodPatch(sira, ham) };
    setYeniBarkod('');
    setYeniSira(String(stokCokluBarkodIlkBosSira(sonrakiSatir) ?? sira));
    setHata('');
  }, [onKaydet, satir, yeniBarkod, yeniSira]);

  const satirKaydet = useCallback(() => {
    if (satirDuzenle === null) return;
    const eskiSira = satirDuzenle;
    const yeniSiraNo = Number(satirSira);
    if (!stokCokluBarkodSiraGecerliMi(yeniSiraNo)) {
      setHata('Sıra numarası 1–6 arasında olmalı.');
      return;
    }
    if (yeniSiraNo !== eskiSira && stokCokluBarkodDoluMu(satir, yeniSiraNo)) {
      setHata(`${yeniSiraNo}. sıra zaten dolu.`);
      return;
    }
    const temiz = barkodFiltrele(satirBarkod.trim());
    if (!temiz) {
      onKaydet(stokCokluBarkodPatch(eskiSira, ''));
      setSatirDuzenle(null);
      setHata('');
      return;
    }
    if (yeniSiraNo !== eskiSira) {
      onKaydet(stokCokluBarkodTasi(eskiSira, yeniSiraNo, temiz));
    } else {
      onKaydet(stokCokluBarkodPatch(eskiSira, temiz));
    }
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirBarkod('');
    setHata('');
  }, [onKaydet, satir, satirBarkod, satirDuzenle, satirSira]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle !== null) {
          setSatirDuzenle(null);
          setSatirSira('');
          setSatirBarkod('');
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
      className="ap-sil-onay-modal cari-secenek-modal stok-coklu-fiyat-modal stok-coklu-barkod-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Barkodlar"
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
            <span className="cari-secenek-kapat-x" aria-hidden>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="cari-secenek-kapat-kisayol">Esc</span>
          </button>

          <div className="ap-sil-onay-ikon cari-secenek-ikon" aria-hidden>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden>
              <path
                d="M4 6v12M7 6v12M10 4v16M13 7v10M16 5v14M19 8v8M22 6v12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="ap-sil-onay-baslik cari-secenek-baslik">Barkodlar</h3>

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle stok-coklu-fiyat-ekle">
              <div className="stok-coklu-fiyat-input-grup">
                <input
                  type="text"
                  className="ap-input stok-coklu-fiyat-no"
                  value={yeniSira}
                  onChange={(e) => setYeniSira(siraHamFiltrele(e.target.value))}
                  inputMode="numeric"
                  aria-label="Sıra numarası"
                  title="Sıra numarası (1–6)"
                />
                <input
                  type="text"
                  className="ap-input stok-coklu-fiyat-ekle-input"
                  value={yeniBarkod}
                  onChange={(e) => setYeniBarkod(barkodFiltrele(e.target.value))}
                  placeholder="Barkod"
                  inputMode="numeric"
                  autoFocus
                  aria-label="Yeni barkod"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ekle();
                    }
                  }}
                />
                <button
                  type="button"
                  className="stok-coklu-fiyat-ekle-btn"
                  onClick={ekle}
                  disabled={liste.length >= STOK_COKLU_BARKOD_ADET && ilkBosSira === null}
                >
                  Ekle
                </button>
              </div>
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <ul className="cari-secenek-liste">
              {liste.length === 0 ? (
                <li className="stok-coklu-fiyat-bos">Henüz ek barkod yok.</li>
              ) : (
                liste.map((oge) => {
                  const duzenleniyor = satirDuzenle === oge.sira;
                  return (
                    <li
                      key={`${satir.id}-${oge.sira}`}
                      className={duzenleniyor ? 'cari-secenek-liste--duzenleniyor' : undefined}
                      onDoubleClick={() => {
                        setSatirDuzenle(oge.sira);
                        setSatirSira(String(oge.sira));
                        setSatirBarkod(oge.deger);
                        setHata('');
                      }}
                      title="Düzenlemek için çift tıklayın"
                    >
                      {duzenleniyor ? (
                        <div className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--satir stok-coklu-fiyat-input-grup--duzenle">
                          <input
                            type="text"
                            className="ap-input stok-coklu-fiyat-no cari-secenek-satir-input"
                            value={satirSira}
                            autoFocus
                            inputMode="numeric"
                            aria-label={`${oge.etiket} sıra numarası`}
                            onChange={(e) => setSatirSira(siraHamFiltrele(e.target.value))}
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
                                setSatirSira('');
                                setSatirBarkod('');
                                setHata('');
                              }
                            }}
                          />
                          <input
                            type="text"
                            className="ap-input cari-secenek-satir-input stok-coklu-fiyat-satir-input"
                            value={satirBarkod}
                            inputMode="numeric"
                            aria-label={`${oge.etiket} değeri`}
                            onChange={(e) => setSatirBarkod(barkodFiltrele(e.target.value))}
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
                                setSatirSira('');
                                setSatirBarkod('');
                                setHata('');
                              }
                            }}
                            onBlur={() => satirKaydet()}
                          />
                        </div>
                      ) : (
                        <span className="cari-secenek-liste-ad">
                          {oge.etiket}: {oge.deger || '—'}
                        </span>
                      )}
                      {!duzenleniyor ? (
                        <button
                          type="button"
                          className="cari-secenek-liste-sil"
                          onClick={() => onKaydet(stokCokluBarkodPatch(oge.sira, ''))}
                          aria-label={`${oge.etiket} sil`}
                        >
                          Sil
                        </button>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="cari-secenek-alt">
            <p className="cari-secenek-ipucu">Düzenlemek için çift tıklayınız.</p>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
