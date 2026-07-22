import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalListeIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { StokFiyatDuzenleSatir, StokFiyatPb } from './fiyatDuzenleTipler';
import { STOK_FIYAT_PB_SECENEKLERI, stokPbSembolu } from './fiyatDuzenleTipler';
import { sayiGoster, sayiOku } from './stokYeniBirimlerYardimci';
import {
  STOK_COKLU_FIYAT_ADET,
  stokCokluFiyatDegeri,
  stokCokluFiyatEtiketi,
  stokCokluFiyatIlkBosSira,
  stokCokluFiyatKaydetPatch,
  stokCokluFiyatPbDegeri,
  stokCokluFiyatPatch,
  stokCokluFiyatSiraGecerliMi,
  stokCokluFiyatTasiKaydetPatch,
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

function pbNormalize(pb: string): StokFiyatPb {
  return pb === 'USD' || pb === 'EUR' ? pb : 'TL';
}

const PB_SECENEKLERI = STOK_FIYAT_PB_SECENEKLERI.map((p) => ({
  value: p.deger,
  label: p.etiket,
}));

function StokCokluFiyatPbSecim({
  deger,
  onChange,
  ariaLabel,
}: {
  deger: StokFiyatPb;
  onChange: (pb: StokFiyatPb) => void;
  ariaLabel: string;
}) {
  return (
    <div className="stok-coklu-fiyat-pb">
      <FormAcilirSecim
        value={deger}
        onChange={(v) => onChange(pbNormalize(v))}
        secenekler={PB_SECENEKLERI}
        aria-label={ariaLabel}
        className="stok-coklu-fiyat-pb-secim"
        listeSinifi="stok-coklu-fiyat-pb-liste"
        listeMinGenislik={76}
        tusMetin={stokPbSembolu(deger)}
      />
    </div>
  );
}

export function StokCokluFiyatModal({ acik, tur, satir, onKaydet, onKapat }: StokCokluFiyatModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeniSira, setYeniSira] = useState('1');
  const [yeniFiyat, setYeniFiyat] = useState('');
  const [yeniPb, setYeniPb] = useState<StokFiyatPb>('TL');
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [satirSira, setSatirSira] = useState('');
  const [satirFiyat, setSatirFiyat] = useState('');
  const [satirPb, setSatirPb] = useState<StokFiyatPb>('TL');
  const fiyatInputRef = useRef<HTMLInputElement>(null);
  const acilisAnahtarRef = useRef<string | null>(null);

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
      pb: stokCokluFiyatPbDegeri(satir, tur, sira),
    }));
  }, [satir, tur]);

  const ilkBosSira = useMemo(() => stokCokluFiyatIlkBosSira(satir, tur), [satir, tur]);

  useEffect(() => {
    if (!acik) {
      acilisAnahtarRef.current = null;
      return;
    }
    const anahtar = `${satir.id}-${tur}`;
    if (acilisAnahtarRef.current === anahtar) return;
    acilisAnahtarRef.current = anahtar;
    const sira = ilkBosSira ?? 1;
    setYeniSira(String(sira));
    setYeniFiyat('');
    setYeniPb(stokCokluFiyatPbDegeri(satir, tur, sira));
    setHata('');
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirFiyat('');
    setSatirPb('TL');
    requestAnimationFrame(() => fiyatInputRef.current?.focus());
  }, [acik, ilkBosSira, satir, tur]);

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
    onKaydet(stokCokluFiyatKaydetPatch(tur, sira, deger, yeniPb));
    const yeniSatir = { ...satir, ...stokCokluFiyatKaydetPatch(tur, sira, deger, yeniPb) };
    const sonrakiSira = stokCokluFiyatIlkBosSira(yeniSatir, tur) ?? sira;
    setYeniFiyat('');
    setYeniSira(String(sonrakiSira));
    setYeniPb(stokCokluFiyatPbDegeri(yeniSatir, tur, sonrakiSira));
    setHata('');
  }, [onKaydet, satir, tur, yeniFiyat, yeniPb, yeniSira]);

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
      onKaydet(stokCokluFiyatTasiKaydetPatch(tur, eskiSira, yeniSiraNo, deger, satirPb));
    } else {
      onKaydet(stokCokluFiyatKaydetPatch(tur, eskiSira, deger, satirPb));
    }
    setSatirDuzenle(null);
    setSatirSira('');
    setSatirFiyat('');
    setSatirPb('TL');
    setHata('');
  }, [onKaydet, satir, satirDuzenle, satirFiyat, satirPb, satirSira, tur]);

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
          setSatirPb('TL');
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
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon={<ModalListeIkon />} onKapat={onKapat} />

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle stok-coklu-fiyat-ekle">
              <div className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--ekle">
                <input
                  type="text"
                  className="ap-input stok-coklu-fiyat-no"
                  value={yeniSira}
                  onChange={(e) => {
                    const sira = siraHamFiltrele(e.target.value);
                    setYeniSira(sira);
                    const siraNo = Number(sira);
                    if (stokCokluFiyatSiraGecerliMi(siraNo)) {
                      setYeniPb(stokCokluFiyatPbDegeri(satir, tur, siraNo));
                    }
                  }}
                  inputMode="numeric"
                  aria-label="Sıra numarası"
                  title="Sıra numarası (1–6)"
                />
                <input
                  ref={fiyatInputRef}
                  type="text"
                  className="ap-input stok-coklu-fiyat-ekle-input"
                  value={yeniFiyat}
                  onChange={(e) => setYeniFiyat(fiyatHamFiltrele(e.target.value))}
                  placeholder="Fiyat"
                  inputMode="decimal"
                  aria-label="Yeni fiyat"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ekle();
                    }
                  }}
                />
                <StokCokluFiyatPbSecim
                  deger={yeniPb}
                  onChange={setYeniPb}
                  ariaLabel="Para birimi"
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

            <div className="stok-coklu-fiyat-tablo-wrap">
              <table className="stok-coklu-fiyat-tablo">
                <colgroup>
                  <col className="stok-coklu-fiyat-tablo-col-sira" />
                  <col className="stok-coklu-fiyat-tablo-col-adi" />
                  <col className="stok-coklu-fiyat-tablo-col-tutar" />
                  <col className="stok-coklu-fiyat-tablo-col-pb" />
                  <col className="stok-coklu-fiyat-tablo-col-islem" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Sırası</th>
                    <th>Adı</th>
                    <th>Fiyat</th>
                    <th>PB</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="stok-coklu-fiyat-tablo-bos">
                        Henüz ek fiyat yok.
                      </td>
                    </tr>
                  ) : (
                    liste.map((oge) => {
                      const duzenleniyor = satirDuzenle === oge.sira;
                      return (
                        <tr
                          key={`${satir.id}-${oge.sira}`}
                          className={duzenleniyor ? 'stok-coklu-fiyat-tablo-satir--duzenleniyor' : undefined}
                          onDoubleClick={() => {
                            if (duzenleniyor) return;
                            setSatirDuzenle(oge.sira);
                            setSatirSira(String(oge.sira));
                            setSatirFiyat(
                              oge.deger !== null && oge.deger !== undefined ? sayiGoster(oge.deger) : ''
                            );
                            setSatirPb(oge.pb);
                            setHata('');
                          }}
                          title="Düzenlemek için çift tıklayın"
                        >
                          {duzenleniyor ? (
                            <td colSpan={5} className="stok-coklu-fiyat-tablo-duzenle-hucre">
                              <div className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--satir stok-coklu-fiyat-input-grup--duzenle stok-coklu-fiyat-input-grup--ekle stok-coklu-fiyat-tablo-duzenle">
                                <input
                                  type="text"
                                  className="ap-input stok-coklu-fiyat-no cari-secenek-satir-input"
                                  value={satirSira}
                                  autoFocus
                                  inputMode="numeric"
                                  aria-label={`${oge.etiket} sıra numarası`}
                                  onChange={(e) => {
                                    const sira = siraHamFiltrele(e.target.value);
                                    setSatirSira(sira);
                                    const siraNo = Number(sira);
                                    if (stokCokluFiyatSiraGecerliMi(siraNo)) {
                                      setSatirPb(stokCokluFiyatPbDegeri(satir, tur, siraNo));
                                    }
                                  }}
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
                                      setSatirPb('TL');
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
                                      setSatirPb('TL');
                                      setHata('');
                                    }
                                  }}
                                  onBlur={() => satirKaydet()}
                                />
                                <StokCokluFiyatPbSecim
                                  deger={satirPb}
                                  onChange={setSatirPb}
                                  ariaLabel={`${oge.etiket} para birimi`}
                                />
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="stok-coklu-fiyat-tablo-sira">{oge.sira}</td>
                              <td className="stok-coklu-fiyat-tablo-adi">{oge.etiket}</td>
                              <td className="stok-coklu-fiyat-tablo-tutar">
                                {oge.deger !== null && oge.deger !== undefined ? sayiGoster(oge.deger) : '—'}
                              </td>
                              <td className="stok-coklu-fiyat-tablo-pb">{stokPbSembolu(oge.pb)}</td>
                              <td className="stok-coklu-fiyat-tablo-islem">
                                <button
                                  type="button"
                                  className="stok-coklu-fiyat-tablo-sil"
                                  onClick={() => onKaydet(stokCokluFiyatPatch(tur, oge.sira, null))}
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
