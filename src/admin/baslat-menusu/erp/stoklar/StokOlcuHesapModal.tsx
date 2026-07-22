import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalListeIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import { sayiGoster, sayiOku } from './stokYeniBirimlerYardimci';

export type StokOlcuTur = 'agirlik' | 'hacim';
export type StokOlcuBirim = 'g' | 'kg' | 'desi';

interface StokOlcuHesapModalProps {
  acik: boolean;
  tur: StokOlcuTur;
  birim: StokOlcuBirim;
  onUygula: (deger: number) => void;
  onKapat: () => void;
}

type AgirlikSekil = 'prizma' | 'kup' | 'silindir';

const AGIRLIK_SEKILLERI: { value: AgirlikSekil; etiket: string }[] = [
  { value: 'prizma', etiket: 'Prizma' },
  { value: 'kup', etiket: 'Küp' },
  { value: 'silindir', etiket: 'Silindir' },
];

function yuvarla(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function hacimCm3(
  sekil: AgirlikSekil,
  a: number | null,
  b: number | null,
  h: number | null,
  r: number | null
): number | null {
  if (sekil === 'kup') {
    if (a == null) return null;
    return yuvarla(a * a * a);
  }
  if (sekil === 'prizma') {
    if (a == null || b == null || h == null) return null;
    return yuvarla(a * b * h);
  }
  if (sekil === 'silindir') {
    if (r == null || h == null) return null;
    return yuvarla(Math.PI * r * r * h);
  }
  return null;
}

function MiniSayi({
  etiket,
  deger,
  birim,
  onDegistir,
}: {
  etiket: string;
  deger: number | null;
  birim?: string;
  onDegistir: (v: number | null) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [ham, setHam] = useState('');

  useEffect(() => {
    if (!focused) setHam(deger !== null ? sayiGoster(deger) : '');
  }, [deger, focused]);

  return (
    <label className="stok-olcu-hesap-mini">
      <span className="stok-olcu-hesap-mini-etiket">{etiket}</span>
      <input
        className="stok-olcu-hesap-mini-input"
        inputMode="decimal"
        value={focused ? ham : sayiGoster(deger)}
        placeholder="0"
        onFocus={() => {
          setFocused(true);
          setHam(deger !== null ? sayiGoster(deger) : '');
        }}
        onBlur={() => {
          setFocused(false);
          if (!ham.trim()) {
            onDegistir(null);
            return;
          }
          onDegistir(sayiOku(ham));
        }}
        onChange={(e) => {
          const sonraki = e.target.value.replace(/[^\d.,]/g, '');
          setHam(sonraki);
          onDegistir(sayiOku(sonraki));
        }}
      />
      {birim ? <span className="stok-olcu-hesap-mini-birim">{birim}</span> : null}
    </label>
  );
}

export function StokOlcuHesapModal({ acik, tur, birim, onUygula, onKapat }: StokOlcuHesapModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  const [sekil, setSekil] = useState<AgirlikSekil>('prizma');
  const [en, setEn] = useState<number | null>(null);
  const [boy, setBoy] = useState<number | null>(null);
  const [yukseklik, setYukseklik] = useState<number | null>(null);
  const [yaricap, setYaricap] = useState<number | null>(null);
  const [yogunluk, setYogunluk] = useState<number | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);
  const kopyaZamanRef = useRef<number | null>(null);
  const acilisRef = useRef(false);

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik) {
      acilisRef.current = false;
      return;
    }
    if (acilisRef.current) return;
    acilisRef.current = true;
    setSekil('prizma');
    setEn(null);
    setBoy(null);
    setYukseklik(null);
    setYaricap(null);
    setYogunluk(null);
    setKopyalandi(false);
  }, [acik]);

  useEffect(
    () => () => {
      if (kopyaZamanRef.current != null) window.clearTimeout(kopyaZamanRef.current);
    },
    []
  );

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, onKapat, portalKok]);

  const sonuc = useMemo(() => {
    if (tur === 'hacim') {
      if (en == null || boy == null || yukseklik == null) return null;
      return yuvarla((en * boy * yukseklik) / 3000);
    }
    const cm3 = hacimCm3(sekil, en, boy, yukseklik, yaricap);
    if (cm3 == null || yogunluk == null) return null;
    const gram = yuvarla(cm3 * yogunluk);
    if (birim === 'kg') return yuvarla(gram / 1000);
    return gram;
  }, [tur, birim, sekil, en, boy, yukseklik, yaricap, yogunluk]);

  const sonucMetin =
    sonuc === null
      ? ''
      : `${sonuc.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} ${birim}`.trim();

  const sonucuKopyala = async () => {
    if (!sonucMetin) return;
    try {
      await navigator.clipboard.writeText(sonucMetin);
      setKopyalandi(true);
      if (kopyaZamanRef.current != null) window.clearTimeout(kopyaZamanRef.current);
      kopyaZamanRef.current = window.setTimeout(() => setKopyalandi(false), 1400);
    } catch {
      /* pano reddedildi */
    }
  };

  if (!acik || !portalKok) return null;

  const baslik = tur === 'hacim' ? 'Desi Hesapla' : 'Ağırlık Hesapla';

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal stok-olcu-hesap-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka cari-secenek-arka" aria-hidden="true" onClick={onKapat} />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon={<ModalListeIkon />} onKapat={onKapat} />

          <div className="cari-secenek-govde stok-olcu-hesap-govde">
            {tur === 'agirlik' ? (
              <div className="stok-olcu-hesap-sekil-grup" role="radiogroup" aria-label="Şekil">
                {AGIRLIK_SEKILLERI.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={`stok-olcu-hesap-sekil${sekil === o.value ? ' stok-olcu-hesap-sekil--aktif' : ''}`}
                    onClick={() => {
                      setSekil(o.value);
                      setEn(null);
                      setBoy(null);
                      setYukseklik(null);
                      setYaricap(null);
                    }}
                  >
                    {o.etiket}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="stok-olcu-hesap-mini-satir">
              {tur === 'hacim' || sekil === 'prizma' ? (
                <>
                  <MiniSayi etiket="En" deger={en} birim="cm" onDegistir={setEn} />
                  <MiniSayi etiket="Boy" deger={boy} birim="cm" onDegistir={setBoy} />
                  <MiniSayi etiket="Yükseklik" deger={yukseklik} birim="cm" onDegistir={setYukseklik} />
                </>
              ) : null}
              {tur === 'agirlik' && sekil === 'kup' ? (
                <MiniSayi etiket="Kenar" deger={en} birim="cm" onDegistir={setEn} />
              ) : null}
              {tur === 'agirlik' && sekil === 'silindir' ? (
                <>
                  <MiniSayi etiket="Yarıçap" deger={yaricap} birim="cm" onDegistir={setYaricap} />
                  <MiniSayi etiket="Yükseklik" deger={yukseklik} birim="cm" onDegistir={setYukseklik} />
                </>
              ) : null}
              {tur === 'agirlik' ? (
                <MiniSayi
                  etiket="Yoğunluk"
                  deger={yogunluk}
                  birim="g/cm³"
                  onDegistir={setYogunluk}
                />
              ) : null}
            </div>

            {tur === 'hacim' ? (
              <p className="stok-olcu-hesap-ipucu">Desi = (En × Boy × Yükseklik) ÷ 3000</p>
            ) : (
              <p className="stok-olcu-hesap-ipucu">Ağırlık = hacim (cm³) × yoğunluk (g/cm³)</p>
            )}

            <div className="stok-olcu-hesap-sonuc-satir">
              <div className="stok-olcu-hesap-sonuc">
                <span className="stok-olcu-hesap-sonuc-etiket">Sonuç</span>
                <span
                  className={`stok-olcu-hesap-sonuc-deger${kopyalandi ? ' stok-olcu-hesap-sonuc-deger--kopyalandi' : ''}`}
                >
                  {kopyalandi ? 'Kopyalandı' : sonucMetin || '—'}
                </span>
              </div>
              <div className="stok-olcu-hesap-aksiyonlar">
                <button
                  type="button"
                  className="stok-olcu-hesap-kopyala"
                  disabled={!sonucMetin}
                  onClick={() => void sonucuKopyala()}
                >
                  Kopyala
                </button>
                <button
                  type="button"
                  className="stok-olcu-hesap-uygula"
                  disabled={sonuc === null}
                  onClick={() => {
                    if (sonuc === null) return;
                    onUygula(sonuc);
                    onKapat();
                  }}
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
