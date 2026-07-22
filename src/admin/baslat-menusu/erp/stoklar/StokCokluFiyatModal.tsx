import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
import { sayiGoster, sayiOku } from './stokYeniBirimlerYardimci';
import {
  STOK_COKLU_FIYAT_ADET,
  stokCokluFiyatDegeri,
  stokCokluFiyatEtiketi,
  stokCokluFiyatIlkBosSira,
  stokCokluFiyatPatch,
  stokCokluFiyatSiraGecerliMi,
  stokCokluFiyatTasi,
  type StokCokluFiyatTur,
} from './stokCokluFiyatYardimci';

interface StokCokluFiyatModalProps {
  acik: boolean;
  tur: StokCokluFiyatTur;
  satir: StokFiyatDuzenleSatir;
  onKaydet: (patch: Partial<StokFiyatDuzenleSatir>) => void;
  onKapat: () => void;
}

function fiyatHamFiltrele(ham: string): string {
  let sonuc = '';
  let virgulVar = false;
  for (const ch of ham) {
    if (ch >= '0' && ch <= '9') sonuc += ch;
    else if ((ch === ',' || ch === '.') && !virgulVar) {
      virgulVar = true;
      sonuc += ',';
    }
  }
  return sonuc;
}

function siraHamFiltrele(ham: string): string {
  return ham.replace(/\D/g, '').slice(0, 1);
}

export function StokCokluFiyatModal({ acik, tur, satir, onKaydet, onKapat }: StokCokluFiyatModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeniSira, setYeniSira] = useState('1');
  const [yeniFiyat, setYeniFiyat] = useState('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [satirSira, setSatirSira] = useState('');
  const [satirFiyat, setSatirFiyat] = useState('');

  useSekmeModalGovdeKilidi(acik, portalKok);

  const baslik = tur === 'alis' ? 'Alış Fiyatları' : 'Satış Fiyatları';

  const liste = useMemo(() => {
    const siralar: number[] = [];
    for (let sira = 1; sira <= STOK_COKLU_FIYAT_ADET; sira += 1) {
      if (stokCokluFiyatDegeri(satir, tur, sira) !== null) siralar.push(sira);
    }
    return siralar.map((sira) => ({
      sira,
      etiket: stokCokluFiyatEtiketi(tur, sira),
      deger: stokCokluFiyatDegeri(satir, tur, sira),
    }));
  }, [satir, tur]);

  const ilkBosSira = useMemo(() => stokCokluFiyatIlkBosSira(satir, tur), [satir, tur]);

  useEffect(() => {
    if (!acik) return;
    setYeniSira(String(ilkBosSira ?? 1));
    setYeniFiyat('');
    setHata('');
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirFiyat('');
  }, [acik, ilkBosSira, satir.id, tur]);

  const ekle = useCallback(() => {
    const sira = Number(yeniSira);
    if (!stokCokluFiyatSiraGecerliMi(sira)) {
      setHata('Sıra numarası 1–6 arasında olmalı.');
      return;
    }
    const ham = yeniFiyat.trim();
    if (!ham) {
      setHata('Fiyat girin.');
      return;
    }
    const deger = sayiOku(ham);
    if (deger === null) {
      setHata('Geçerli bir fiyat girin.');
      return;
    }
    onKaydet(stokCokluFiyatPatch(tur, sira, deger));
    setYeniFiyat('');
    setYeniSira(
      String(
        stokCokluFiyatIlkBosSira({ ...satir, ...stokCokluFiyatPatch(tur, sira, deger) }, tur) ?? sira
      )
    );
    setHata('');
  }, [onKaydet, satir, tur, yeniFiyat, yeniSira]);

  const satirKaydet = useCallback(() => {
    if (satirDuzenle === null) return;
    const eskiSira = satirDuzenle;
    const yeniSiraNo = Number(satirSira);
    if (!stokCokluFiyatSiraGecerliMi(yeniSiraNo)) {
      setHata('Sıra numarası 1–6 arasında olmalı.');
      return;
    }
    if (yeniSiraNo !== eskiSira && stokCokluFiyatDegeri(satir, tur, yeniSiraNo) !== null) {
      setHata(`${yeniSiraNo}. sıra zaten dolu.`);
      return;
    }
    const ham = satirFiyat.trim();
    if (!ham) {
      onKaydet(stokCokluFiyatPatch(tur, eskiSira, null));
      setSatirDuzenle(null);
      setHata('');
      return;
    }
    const deger = sayiOku(ham);
    if (deger === null) {
      setHata('Geçerli bir fiyat girin.');
      return;
    }
    if (yeniSiraNo !== eskiSira) {
      onKaydet(stokCokluFiyatTasi(tur, eskiSira, yeniSiraNo, deger));
    } else {
      onKaydet(stokCokluFiyatPatch(tur, eskiSira, deger));
    }
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirFiyat('');
    setHata('');
  }, [onKaydet, satir, satirDuzenle, satirFiyat, satirSira, tur]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle !== null) {
          setSatirDuzenle(null);
          setSatirSira('');
          setSatirFiyat('');
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
      className="ap-sil-onay-modal cari-secenek-modal stok-coklu-fiyat-modal"
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
          <h3 className="ap-sil-onay-baslik cari-secenek-baslik">{baslik}</h3>

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
                  value={yeniFiyat}
                  onChange={(e) => setYeniFiyat(fiyatHamFiltrele(e.target.value))}
                  placeholder="Fiyat"
                  inputMode="decimal"
                  autoFocus
                  aria-label="Yeni fiyat"
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
                  disabled={liste.length >= STOK_COKLU_FIYAT_ADET && ilkBosSira === null}
                >
                  Ekle
                </button>
              </div>
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <ul className="cari-secenek-liste">
              {liste.length === 0 ? (
                <li className="stok-coklu-fiyat-bos">Henüz ek fiyat yok.</li>
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
                        setSatirFiyat(
                          oge.deger !== null && oge.deger !== undefined ? sayiGoster(oge.deger) : ''
                        );
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
                                setSatirFiyat('');
                                setHata('');
                              }
                            }}
                          />
                          <input
                            type="text"
                            className="ap-input cari-secenek-satir-input stok-coklu-fiyat-satir-input"
                            value={satirFiyat}
                            inputMode="decimal"
                            aria-label={`${oge.etiket} tutarı`}
                            onChange={(e) => setSatirFiyat(fiyatHamFiltrele(e.target.value))}
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
                                setSatirFiyat('');
                                setHata('');
                              }
                            }}
                            onBlur={() => satirKaydet()}
                          />
                        </div>
                      ) : (
                        <span className="cari-secenek-liste-ad">
                          {oge.etiket}:{' '}
                          {oge.deger !== null && oge.deger !== undefined ? sayiGoster(oge.deger) : '—'}
                        </span>
                      )}
                      {!duzenleniyor ? (
                        <button
                          type="button"
                          className="cari-secenek-liste-sil"
                          onClick={() => onKaydet(stokCokluFiyatPatch(tur, oge.sira, null))}
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
