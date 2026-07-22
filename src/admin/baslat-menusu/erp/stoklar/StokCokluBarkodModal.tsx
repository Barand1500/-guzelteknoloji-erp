import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalBarkodIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { StokBarkodTipi, StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
import { STOK_BARKOD_TIP_SECENEKLERI } from './fiyatDuzenleTipler';
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
  stokCokluBarkodTipi,
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

const BARKOD_TIP_SECENEKLERI = STOK_BARKOD_TIP_SECENEKLERI.map((s) => ({
  value: s.deger,
  label: s.etiket,
}));

function BarkodTipSecim({
  value,
  onChange,
  ariaLabel,
}: {
  value: StokBarkodTipi;
  onChange: (tip: StokBarkodTipi) => void;
  ariaLabel: string;
}) {
  return (
    <div className="stok-coklu-barkod-tip ap-form-acilir-secim-liste-anchor">
      <FormAcilirSecim
        value={value}
        onChange={(v) => onChange(v as StokBarkodTipi)}
        secenekler={BARKOD_TIP_SECENEKLERI}
        aria-label={ariaLabel}
        className="stok-coklu-barkod-tip-secim"
        listeSinifi="stok-coklu-barkod-tip-liste"
        listeMinGenislik={92}
        listeAnchor="self"
        listeYonu="asagi"
        listeDikeyBosluk={4}
      />
    </div>
  );
}

export function StokCokluBarkodModal({ acik, satir, onKaydet, onKapat }: StokCokluBarkodModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeniSira, setYeniSira] = useState('1');
  const [yeniBarkod, setYeniBarkod] = useState('');
  const [yeniTip, setYeniTip] = useState<StokBarkodTipi>('EAN13');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [satirSira, setSatirSira] = useState('');
  const [satirBarkod, setSatirBarkod] = useState('');
  const [satirTip, setSatirTip] = useState<StokBarkodTipi>('EAN13');
  const barkodInputRef = useRef<HTMLInputElement>(null);
  const acilisAnahtarRef = useRef<string | null>(null);

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
      tip: stokCokluBarkodTipi(satir, sira),
    }));
  }, [satir]);

  const ilkBosSira = useMemo(() => stokCokluBarkodIlkBosSira(satir), [satir]);

  useEffect(() => {
    if (!acik) {
      acilisAnahtarRef.current = null;
      return;
    }
    const anahtar = satir.id;
    if (acilisAnahtarRef.current === anahtar) return;
    acilisAnahtarRef.current = anahtar;
    setYeniSira(String(ilkBosSira ?? 1));
    setYeniBarkod('');
    setYeniTip('EAN13');
    setHata('');
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirBarkod('');
    setSatirTip('EAN13');
    requestAnimationFrame(() => barkodInputRef.current?.focus());
  }, [acik, ilkBosSira, satir.id]);

  const ustSiraGuncelle = useCallback((sonrakiSatir: StokFiyatDuzenleSatir) => {
    const bos = stokCokluBarkodIlkBosSira(sonrakiSatir);
    setYeniSira(String(bos ?? 1));
  }, []);

  const ekle = useCallback(() => {
    const sira = Number(yeniSira);
    if (!stokCokluBarkodSiraGecerliMi(sira)) {
      setHata('Sıra numarası 1–6 arasında olmalı.');
      return;
    }
    if (stokCokluBarkodDoluMu(satir, sira)) {
      setHata(`${sira}. sıra zaten var.`);
      return;
    }
    const ham = barkodFiltrele(yeniBarkod.trim());
    if (!ham) {
      setHata('Barkod girin.');
      return;
    }
    onKaydet(stokCokluBarkodPatch(sira, ham, yeniTip));
    const sonrakiSatir = { ...satir, ...stokCokluBarkodPatch(sira, ham, yeniTip) };
    setYeniBarkod('');
    setYeniTip('EAN13');
    ustSiraGuncelle(sonrakiSatir);
    setHata('');
  }, [onKaydet, satir, ustSiraGuncelle, yeniBarkod, yeniSira, yeniTip]);

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
    let patch: Partial<StokFiyatDuzenleSatir>;
    if (!temiz) {
      patch = stokCokluBarkodPatch(eskiSira, '');
    } else if (yeniSiraNo !== eskiSira) {
      patch = stokCokluBarkodTasi(eskiSira, yeniSiraNo, temiz, satirTip);
    } else {
      patch = stokCokluBarkodPatch(eskiSira, temiz, satirTip);
    }
    onKaydet(patch);
    ustSiraGuncelle({ ...satir, ...patch });
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirBarkod('');
    setSatirTip('EAN13');
    setHata('');
  }, [onKaydet, satir, satirBarkod, satirDuzenle, satirSira, satirTip, ustSiraGuncelle]);

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
          setSatirTip('EAN13');
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
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik="Barkodlar" ikon={<ModalBarkodIkon />} onKapat={onKapat} />

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle stok-coklu-fiyat-ekle">
              <div className="stok-coklu-fiyat-input-grup stok-coklu-barkod-input-grup">
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
                  ref={barkodInputRef}
                  type="text"
                  className="ap-input stok-coklu-fiyat-ekle-input"
                  value={yeniBarkod}
                  onChange={(e) => setYeniBarkod(barkodFiltrele(e.target.value))}
                  placeholder="Barkod"
                  inputMode="numeric"
                  aria-label="Yeni barkod"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ekle();
                    }
                  }}
                />
                <BarkodTipSecim
                  value={yeniTip}
                  onChange={setYeniTip}
                  ariaLabel="Barkod tipi"
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

            <div className="stok-coklu-barkod-tablo-wrap">
              <table className="stok-coklu-barkod-tablo">
                <colgroup>
                  <col className="stok-coklu-barkod-tablo-col-sira" />
                  <col className="stok-coklu-barkod-tablo-col-adi" />
                  <col className="stok-coklu-barkod-tablo-col-kodu" />
                  <col className="stok-coklu-barkod-tablo-col-islem" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Sırası</th>
                    <th>Adı</th>
                    <th>Kodu</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="stok-coklu-barkod-tablo-bos">
                        Henüz ek barkod yok.
                      </td>
                    </tr>
                  ) : (
                    liste.map((oge) => {
                      const duzenleniyor = satirDuzenle === oge.sira;
                      return (
                        <tr
                          key={`${satir.id}-${oge.sira}`}
                          className={duzenleniyor ? 'stok-coklu-barkod-tablo-satir--duzenleniyor' : undefined}
                          onDoubleClick={() => {
                            if (duzenleniyor) return;
                            setSatirDuzenle(oge.sira);
                            setSatirSira(String(oge.sira));
                            setSatirBarkod(oge.deger);
                            setSatirTip(oge.tip);
                            setHata('');
                          }}
                          title="Düzenlemek için çift tıklayın"
                        >
                          {duzenleniyor ? (
                            <td colSpan={4} className="stok-coklu-barkod-tablo-duzenle-hucre">
                              <div className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--satir stok-coklu-fiyat-input-grup--duzenle stok-coklu-barkod-input-grup stok-coklu-barkod-tablo-duzenle">
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
                                      setSatirTip('EAN13');
                                      setHata('');
                                    }
                                  }}
                                />
                                <input
                                  type="text"
                                  className="ap-input cari-secenek-satir-input stok-coklu-fiyat-satir-input"
                                  value={satirBarkod}
                                  inputMode="numeric"
                                  aria-label={`${oge.etiket} adı`}
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
                                      setSatirTip('EAN13');
                                      setHata('');
                                    }
                                  }}
                                  onBlur={() => satirKaydet()}
                                />
                                <BarkodTipSecim
                                  value={satirTip}
                                  onChange={setSatirTip}
                                  ariaLabel={`${oge.etiket} kodu`}
                                />
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="stok-coklu-barkod-tablo-sira">{oge.sira}</td>
                              <td className="stok-coklu-barkod-tablo-adi">{oge.deger || '—'}</td>
                              <td className="stok-coklu-barkod-tablo-kodu">{oge.tip}</td>
                              <td className="stok-coklu-barkod-tablo-islem">
                                <button
                                  type="button"
                                  className="stok-coklu-barkod-tablo-sil"
                                  onClick={() => {
                                    const patch = stokCokluBarkodPatch(oge.sira, '');
                                    onKaydet(patch);
                                    ustSiraGuncelle({ ...satir, ...patch });
                                  }}
                                  aria-label={`${oge.etiket} sil`}
                                >
                                  Sil
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

          <div className="cari-secenek-alt">
            <p className="cari-secenek-ipucu">Düzenlemek için çift tıklayınız.</p>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
