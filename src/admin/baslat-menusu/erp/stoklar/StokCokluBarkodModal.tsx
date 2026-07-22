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
  STOK_COKLU_BARKOD_MAX_SIRA,
  stokCokluBarkodEkle,
  stokCokluBarkodEtiketi,
  stokCokluBarkodGuncelle,
  stokCokluBarkodListesi,
  stokCokluBarkodSil,
} from './stokCokluBarkodYardimci';

interface StokCokluBarkodModalProps {
  acik: boolean;
  satir: StokFiyatDuzenleSatir;
  onKaydet: (patch: Partial<StokFiyatDuzenleSatir>) => void;
  onKapat: () => void;
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
  const [yeniBarkod, setYeniBarkod] = useState('');
  const [yeniTip, setYeniTip] = useState<StokBarkodTipi>('');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [satirBarkod, setSatirBarkod] = useState('');
  const [satirTip, setSatirTip] = useState<StokBarkodTipi>('');
  const barkodInputRef = useRef<HTMLInputElement>(null);
  const acilisAnahtarRef = useRef<string | null>(null);

  useSekmeModalGovdeKilidi(acik, portalKok);

  const liste = useMemo(
    () =>
      stokCokluBarkodListesi(satir).map((oge) => ({
        sira: oge.sira,
        etiket: stokCokluBarkodEtiketi(oge.sira),
        deger: oge.deger,
        tip: oge.tip,
      })),
    [satir]
  );

  useEffect(() => {
    if (!acik) {
      acilisAnahtarRef.current = null;
      return;
    }
    const anahtar = satir.id;
    if (acilisAnahtarRef.current === anahtar) return;
    acilisAnahtarRef.current = anahtar;
    setYeniBarkod('');
    setYeniTip('');
    setHata('');
    setSatirDuzenle(null);
    setSatirBarkod('');
    setSatirTip('');
    requestAnimationFrame(() => barkodInputRef.current?.focus());
  }, [acik, satir.id]);

  const ekle = useCallback(() => {
    if (liste.length >= STOK_COKLU_BARKOD_MAX_SIRA) {
      setHata(`En fazla ${STOK_COKLU_BARKOD_MAX_SIRA} barkod eklenebilir.`);
      return;
    }
    const ham = barkodFiltrele(yeniBarkod.trim());
    if (!ham) {
      setHata('Barkod girin.');
      return;
    }
    const patch = stokCokluBarkodEkle(ham, yeniTip, satir);
    onKaydet(patch);
    setYeniBarkod('');
    setYeniTip('');
    setHata('');
  }, [liste.length, onKaydet, satir, yeniBarkod, yeniTip]);

  const satirKaydet = useCallback(() => {
    if (satirDuzenle === null) return;
    const temiz = barkodFiltrele(satirBarkod.trim());
    const patch = !temiz
      ? stokCokluBarkodSil(satirDuzenle, satir)
      : stokCokluBarkodGuncelle(satirDuzenle, temiz, satirTip, satir);
    onKaydet(patch);
    setSatirDuzenle(null);
    setSatirBarkod('');
    setSatirTip('');
    setHata('');
  }, [onKaydet, satir, satirBarkod, satirDuzenle, satirTip]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle !== null) {
          setSatirDuzenle(null);
          setSatirBarkod('');
          setSatirTip('');
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
                <button type="button" className="stok-coklu-fiyat-ekle-btn" onClick={ekle}>
                  Ekle
                </button>
              </div>
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <div className="stok-coklu-barkod-tablo-wrap">
              <table
                className={`stok-coklu-barkod-tablo${satirDuzenle !== null ? ' stok-coklu-barkod-tablo--duzenle' : ''}`.trim()}
              >
                <colgroup>
                  <col className="stok-coklu-barkod-tablo-col-sira" />
                  <col className="stok-coklu-barkod-tablo-col-adi" />
                  <col className="stok-coklu-barkod-tablo-col-kodu" />
                  {satirDuzenle === null ? (
                    <col className="stok-coklu-barkod-tablo-col-islem" />
                  ) : null}
                </colgroup>
                <thead>
                  <tr>
                    <th>Sırası</th>
                    <th>Adı</th>
                    <th>Kodu</th>
                    {satirDuzenle === null ? <th>#</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {liste.length === 0 ? (
                    <tr>
                      <td
                        colSpan={satirDuzenle === null ? 4 : 3}
                        className="stok-coklu-barkod-tablo-bos"
                      >
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
                            if (duzenleniyor || satirDuzenle !== null) return;
                            setSatirDuzenle(oge.sira);
                            setSatirBarkod(oge.deger);
                            setSatirTip(oge.tip);
                            setHata('');
                          }}
                          title="Düzenlemek için çift tıklayınız."
                        >
                          {duzenleniyor ? (
                            <td colSpan={3} className="stok-coklu-barkod-tablo-duzenle-hucre">
                              <div className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--satir stok-coklu-fiyat-input-grup--duzenle stok-coklu-barkod-input-grup stok-coklu-barkod-tablo-duzenle">
                                <span className="stok-coklu-fiyat-no" aria-hidden="true">
                                  {oge.sira}
                                </span>
                                <input
                                  type="text"
                                  className="ap-input cari-secenek-satir-input stok-coklu-fiyat-satir-input"
                                  value={satirBarkod}
                                  autoFocus
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
                                      setSatirBarkod('');
                                      setSatirTip('');
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
                              <td className="stok-coklu-barkod-tablo-adi">{oge.deger || ''}</td>
                              <td className="stok-coklu-barkod-tablo-kodu">{oge.tip || 'Hiçbiri'}</td>
                              {satirDuzenle === null ? (
                                <td className="stok-coklu-barkod-tablo-islem">
                                  <button
                                    type="button"
                                    className="stok-coklu-barkod-tablo-sil"
                                    onClick={() => {
                                      onKaydet(stokCokluBarkodSil(oge.sira, satir));
                                    }}
                                    aria-label={`${oge.etiket} sil`}
                                  >
                                    Sil
                                  </button>
                                </td>
                              ) : null}
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
