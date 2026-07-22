import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CariSecenekModal } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSecenekModal';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import {
  CariOutlinedEtiket,
  CariOutlinedGirdi,
  CariOutlinedSarmalayici,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { bosBirimFiyatSatiri } from './birimMap';
import type { StokBarkodTipi, StokFiyatDuzenleSatir, StokFiyatKdvTipi } from './fiyatDuzenleTipler';
import { STOK_FIYAT_PB_SECENEKLERI, stokPbSembolu } from './fiyatDuzenleTipler';
import {
  stokBirimAdiEkle,
  stokBirimAdiGuncelle,
  stokBirimAdiSil,
  stokBirimAdlariGetir,
  type StokBirimAdiSecenek,
} from './stokBirimAdlari';
import {
  stokFiyatAdiDegeri,
  stokFiyatAdiEkle,
  stokFiyatAdiEtiketi,
  stokFiyatAdiGuncelle,
  stokFiyatAdiSil,
  stokFiyatAdlariGetir,
  type StokFiyatAdiSecenek,
} from './stokFiyatAdlari';
import {
  barkodFiltrele,
  CariOutlinedBarkod,
  CariOutlinedCarpan,
  CariOutlinedSayi,
  CariToggleAlan,
  iskontoHamFiltrele,
  netFiyatHesapla,
} from './stokYeniBirimlerYardimci';
import { StokCokluBarkodModal } from './StokCokluBarkodModal';
import { StokCokluFiyatModal } from './StokCokluFiyatModal';

const KDV_TABAN = ['0', '1', '10', '20'];

function kdvSecenekleriOlustur(ekstra?: number | null): { value: string; label: string }[] {
  const degerler = new Set(KDV_TABAN);
  if (ekstra !== null && ekstra !== undefined && Number.isFinite(ekstra)) {
    degerler.add(String(ekstra));
  }
  return [...degerler]
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => ({ value: k, label: `% ${k}` }));
}

function CariOutlinedKdv({
  etiket,
  deger,
  onChange,
  tip,
  onTipChange,
  ekstraYuzde,
  zorunlu,
  listeYonu,
  listeDikeyBosluk,
}: {
  etiket: string;
  deger: number;
  onChange: (deger: number) => void;
  tip: StokFiyatKdvTipi;
  onTipChange: (tip: StokFiyatKdvTipi) => void;
  ekstraYuzde?: number | null;
  zorunlu?: boolean;
  listeYonu?: 'asagi' | 'yukari';
  listeDikeyBosluk?: number;
}) {
  const secenekler = useMemo(() => kdvSecenekleriOlustur(ekstraYuzde ?? deger), [ekstraYuzde, deger]);
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      className={`cari-outlined-acilir stok-yb-kdv-outlined stok-yb-kdv-outlined--dh${listeYonu === 'yukari' ? ' stok-yb-kdv-outlined--yukari' : ''}`.trim()}
    >
      <FormAcilirSecim
        value={String(deger)}
        onChange={(v) => onChange(Number(v) || 0)}
        secenekler={secenekler}
        aria-label={etiket}
        className="cari-outlined-acilir-tus stok-yb-kdv-outlined-tus"
        listeSinifi="stok-yb-kdv-outlined-liste"
        listeYonu={listeYonu}
        listeDikeyBosluk={listeDikeyBosluk}
      />
      <div className="stok-yb-kdv-dh" role="group" aria-label="KDV dahil / hariç">
        <button
          type="button"
          className={`stok-yb-kdv-dh-oge${tip === 'dahil' ? ' stok-yb-kdv-dh-oge--aktif' : ''}`}
          onClick={() => onTipChange('dahil')}
          title="Dahil"
          aria-pressed={tip === 'dahil'}
        >
          D
        </button>
        <button
          type="button"
          className={`stok-yb-kdv-dh-oge${tip === 'haric' ? ' stok-yb-kdv-dh-oge--aktif' : ''}`}
          onClick={() => onTipChange('haric')}
          title="Hariç"
          aria-pressed={tip === 'haric'}
        >
          H
        </button>
      </div>
    </CariOutlinedSarmalayici>
  );
}

function CariOutlinedIskonto({
  etiket,
  deger,
  onDegistir,
}: {
  etiket: string;
  deger: string;
  onDegistir: (deger: string) => void;
}) {
  const inputId = useId();
  return (
    <div className="cari-outlined-field">
      <CariOutlinedEtiket etiket={etiket} htmlFor={inputId} />
      <div className="cari-outlined-cerceve stok-yb-yuzde-cerceve">
        <div className="stok-yb-yuzde-grup">
          <span className="stok-yb-yuzde-onek" aria-hidden>
            %
          </span>
          <input
            id={inputId}
            className="cari-outlined-input stok-yb-yuzde-input cari-outlined-input--saga"
            inputMode="decimal"
            placeholder="20+20"
            value={deger}
            aria-label={etiket}
            onChange={(e) => onDegistir(iskontoHamFiltrele(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

const OLCU_SECENEKLERI: { value: 'hacim' | 'alan' | 'litre' | 'agirlik'; etiket: string }[] = [
  { value: 'hacim', etiket: 'Hacim' },
  { value: 'alan', etiket: 'Alan' },
  { value: 'litre', etiket: 'Litre' },
  { value: 'agirlik', etiket: 'Ağırlık' },
];

/** alan.hesaplama.net */
const ALAN_SEKILLERI = [
  { value: 'ucgen', etiket: 'Üçgen' },
  { value: 'kare', etiket: 'Kare' },
  { value: 'dikdortgen', etiket: 'Dikdörtgen' },
  { value: 'daire', etiket: 'Daire' },
] as const;

/** hacim.hesaplama.net */
const HACIM_SEKILLERI = [
  { value: 'prizma', etiket: 'Prizma' },
  { value: 'kup', etiket: 'Küp' },
  { value: 'kure', etiket: 'Küre' },
  { value: 'silindir', etiket: 'Silindir' },
  { value: 'koni', etiket: 'Koni' },
  { value: 'piramit', etiket: 'Kare Piramit' },
] as const;

type OlcuTur = 'hacim' | 'alan' | 'litre' | 'agirlik';

function yuvarlaOlcu(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** cm³ cinsinden hacim (hacim.hesaplama.net formülleri) */
function hacimCm3Hesapla(
  sekil: string,
  a: number | null | undefined,
  b: number | null | undefined,
  h: number | null | undefined,
  r: number | null | undefined
): number | null {
  if (sekil === 'kup') {
    if (a == null) return null;
    return yuvarlaOlcu(a * a * a);
  }
  if (sekil === 'prizma') {
    if (a == null || b == null || h == null) return null;
    return yuvarlaOlcu(a * b * h);
  }
  if (sekil === 'kure') {
    if (r == null) return null;
    return yuvarlaOlcu((4 / 3) * Math.PI * r * r * r);
  }
  if (sekil === 'silindir') {
    if (r == null || h == null) return null;
    return yuvarlaOlcu(Math.PI * r * r * h);
  }
  if (sekil === 'koni') {
    if (r == null || h == null) return null;
    return yuvarlaOlcu((1 / 3) * Math.PI * r * r * h);
  }
  if (sekil === 'piramit') {
    if (a == null || h == null) return null;
    return yuvarlaOlcu((1 / 3) * a * a * h);
  }
  return null;
}

/** alan.hesaplama.net formülleri */
function alanHesapla(
  sekil: string,
  a: number | null | undefined,
  h: number | null | undefined,
  r: number | null | undefined
): number | null {
  if (sekil === 'kare') {
    if (a == null) return null;
    return yuvarlaOlcu(a * a);
  }
  if (sekil === 'dikdortgen') {
    if (a == null || h == null) return null;
    return yuvarlaOlcu(a * h);
  }
  if (sekil === 'ucgen') {
    if (a == null || h == null) return null;
    return yuvarlaOlcu((a * h) / 2);
  }
  if (sekil === 'daire') {
    if (r == null) return null;
    return yuvarlaOlcu(Math.PI * r * r);
  }
  return null;
}

function olcuSonucHesapla(satir: StokFiyatDuzenleSatir): number | null {
  const tur = satir.olcuTuru ?? '';
  const sekil = satir.olcuSekil ?? '';
  const a = satir.olcuTaban;
  const b = satir.olcuGenislik;
  const h = satir.olcuYukseklik;
  const r = satir.olcuYaricap;
  const yogunluk = satir.olcuYogunluk;

  if (tur === 'alan') return alanHesapla(sekil, a, h, r);

  if (tur === 'hacim') return hacimCm3Hesapla(sekil, a, b, h, r);

  // Litre: cm ölçüleriyle hacim → litre (1 L = 1000 cm³)
  if (tur === 'litre') {
    const cm3 = hacimCm3Hesapla(sekil, a, b, h, r);
    return cm3 === null ? null : yuvarlaOlcu(cm3 / 1000);
  }

  // Ağırlık: hacim (L) × yoğunluk (kg/L) = kg
  if (tur === 'agirlik') {
    const cm3 = hacimCm3Hesapla(sekil, a, b, h, r);
    if (cm3 === null || yogunluk == null) return null;
    const litre = cm3 / 1000;
    return yuvarlaOlcu(litre * yogunluk);
  }

  return null;
}

function olcuPatch(tur: OlcuTur, deger: number | null): Partial<StokFiyatDuzenleSatir> {
  if (tur === 'hacim') return { hacim: deger };
  if (tur === 'alan') return { alan: deger };
  if (tur === 'litre') return { litre: deger };
  return { agirlikKg: deger === null ? '' : String(deger) };
}

function olcuSekilleri(tur: OlcuTur) {
  if (tur === 'alan') return ALAN_SEKILLERI;
  return HACIM_SEKILLERI;
}

function sonucBirimi(tur: OlcuTur): string {
  if (tur === 'alan') return '';
  if (tur === 'hacim') return 'cm³';
  if (tur === 'litre') return 'L';
  return 'kg';
}

function StokOlcuSecim({
  name,
  satir,
  onPatch,
}: {
  name: string;
  satir: StokFiyatDuzenleSatir;
  onPatch: (patch: Partial<StokFiyatDuzenleSatir>) => void;
}) {
  const kokRef = useRef<HTMLDivElement>(null);
  const [panelAcik, setPanelAcik] = useState(false);
  const tur = (satir.olcuTuru ?? '') as OlcuTur | '';
  const sekil = satir.olcuSekil ?? '';
  const sonuc = olcuSonucHesapla(satir);
  const sekiller = tur ? olcuSekilleri(tur) : [];

  useEffect(() => {
    if (!panelAcik) return;
    function disariTikla(e: MouseEvent) {
      const hedef = e.target as Node;
      if (kokRef.current?.contains(hedef)) return;
      setPanelAcik(false);
    }
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [panelAcik]);

  const yaz = (patch: Partial<StokFiyatDuzenleSatir>) => {
    const sonraki = { ...satir, ...patch };
    const hesap = olcuSonucHesapla(sonraki);
    const olcuYazisi = (sonraki.olcuTuru as OlcuTur | '')
      ? olcuPatch(sonraki.olcuTuru as OlcuTur, hesap)
      : {};
    onPatch({ ...patch, ...olcuYazisi });
  };

  const hacimAlanlari =
    tur === 'hacim' || tur === 'litre' || tur === 'agirlik'
      ? (
          <>
            {sekil === 'kup' ? (
              <CariOutlinedSayi
                etiket="Kenar (a)"
                deger={satir.olcuTaban}
                placeholder="cm"
                sagaHizali
                onDegistir={(olcuTaban) => yaz({ olcuTaban })}
              />
            ) : null}
            {sekil === 'prizma' ? (
              <>
                <CariOutlinedSayi
                  etiket="Uzunluk (a)"
                  deger={satir.olcuTaban}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuTaban) => yaz({ olcuTaban })}
                />
                <CariOutlinedSayi
                  etiket="Genişlik (b)"
                  deger={satir.olcuGenislik}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuGenislik) => yaz({ olcuGenislik })}
                />
                <CariOutlinedSayi
                  etiket="Yükseklik (h)"
                  deger={satir.olcuYukseklik}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuYukseklik) => yaz({ olcuYukseklik })}
                />
              </>
            ) : null}
            {sekil === 'kure' ? (
              <CariOutlinedSayi
                etiket="Yarıçap (r)"
                deger={satir.olcuYaricap}
                placeholder="cm"
                sagaHizali
                onDegistir={(olcuYaricap) => yaz({ olcuYaricap })}
              />
            ) : null}
            {sekil === 'silindir' || sekil === 'koni' ? (
              <>
                <CariOutlinedSayi
                  etiket="Yarıçap (r)"
                  deger={satir.olcuYaricap}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuYaricap) => yaz({ olcuYaricap })}
                />
                <CariOutlinedSayi
                  etiket="Yükseklik (h)"
                  deger={satir.olcuYukseklik}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuYukseklik) => yaz({ olcuYukseklik })}
                />
              </>
            ) : null}
            {sekil === 'piramit' ? (
              <>
                <CariOutlinedSayi
                  etiket="Taban kenar (a)"
                  deger={satir.olcuTaban}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuTaban) => yaz({ olcuTaban })}
                />
                <CariOutlinedSayi
                  etiket="Yükseklik (h)"
                  deger={satir.olcuYukseklik}
                  placeholder="cm"
                  sagaHizali
                  onDegistir={(olcuYukseklik) => yaz({ olcuYukseklik })}
                />
              </>
            ) : null}
            {tur === 'agirlik' && sekil ? (
              <CariOutlinedSayi
                etiket="Yoğunluk"
                deger={satir.olcuYogunluk}
                placeholder="kg/L"
                sagaHizali
                onDegistir={(olcuYogunluk) => yaz({ olcuYogunluk })}
              />
            ) : null}
          </>
        )
      : null;

  const alanAlanlari =
    tur === 'alan' ? (
      <>
        {sekil === 'kare' ? (
          <CariOutlinedSayi
            etiket="Kenar (a)"
            deger={satir.olcuTaban}
            placeholder="0"
            sagaHizali
            onDegistir={(olcuTaban) => yaz({ olcuTaban })}
          />
        ) : null}
        {sekil === 'dikdortgen' || sekil === 'ucgen' ? (
          <>
            <CariOutlinedSayi
              etiket="Taban (a)"
              deger={satir.olcuTaban}
              placeholder="0"
              sagaHizali
              onDegistir={(olcuTaban) => yaz({ olcuTaban })}
            />
            <CariOutlinedSayi
              etiket="Yükseklik (h)"
              deger={satir.olcuYukseklik}
              placeholder="0"
              sagaHizali
              onDegistir={(olcuYukseklik) => yaz({ olcuYukseklik })}
            />
          </>
        ) : null}
        {sekil === 'daire' ? (
          <CariOutlinedSayi
            etiket="Yarıçap (r)"
            deger={satir.olcuYaricap}
            placeholder="0"
            sagaHizali
            onDegistir={(olcuYaricap) => yaz({ olcuYaricap })}
          />
        ) : null}
      </>
    ) : null;

  return (
    <div className="stok-yb-olcu-sutun" ref={kokRef}>
      <CariOutlinedSarmalayici etiket="Ölçü" className="stok-yb-olcu-outlined">
        <div className="stok-yb-olcu-radyo-grup" role="radiogroup" aria-label="Ölçü türü">
          {OLCU_SECENEKLERI.map((o) => (
            <label
              key={o.value}
              className={`stok-yb-olcu-radyo${tur === o.value ? ' stok-yb-olcu-radyo--aktif' : ''}`}
            >
              <input
                type="radio"
                name={name}
                checked={tur === o.value}
                onClick={() => {
                  if (tur === o.value) {
                    setPanelAcik((a) => !a);
                    return;
                  }
                  setPanelAcik(true);
                  yaz({
                    olcuTuru: o.value,
                    olcuSekil: '',
                    olcuTaban: null,
                    olcuGenislik: null,
                    olcuYukseklik: null,
                    olcuYaricap: null,
                    olcuYogunluk: null,
                  });
                }}
                onChange={() => {
                  /* onClick ile yönetilir */
                }}
              />
              <span>{o.etiket}</span>
            </label>
          ))}
        </div>
      </CariOutlinedSarmalayici>

      {tur && panelAcik ? (
        <div className="stok-yb-olcu-hesap">
          <CariOutlinedSarmalayici etiket="Şekil" className="stok-yb-olcu-outlined stok-yb-olcu-sekil">
            <div className="stok-yb-olcu-radyo-grup" role="radiogroup" aria-label="Şekil">
              {sekiller.map((o) => (
                <label
                  key={o.value}
                  className={`stok-yb-olcu-radyo${sekil === o.value ? ' stok-yb-olcu-radyo--aktif' : ''}`}
                >
                  <input
                    type="radio"
                    name={`${name}-sekil`}
                    checked={sekil === o.value}
                    onChange={() =>
                      yaz({
                        olcuSekil: o.value,
                        olcuTaban: null,
                        olcuGenislik: null,
                        olcuYukseklik: null,
                        olcuYaricap: null,
                      })
                    }
                  />
                  <span>{o.etiket}</span>
                </label>
              ))}
            </div>
          </CariOutlinedSarmalayici>

          {alanAlanlari}
          {hacimAlanlari}

          {sekil ? (
            <div className="cari-outlined-field stok-yb-olcu-sonuc">
              <CariOutlinedEtiket etiket="Sonuç" />
              <div className="cari-outlined-cerceve">
                <span className="stok-yb-olcu-sonuc-deger">
                  {sonuc === null
                    ? '—'
                    : `${sonuc.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}${
                        sonucBirimi(tur) ? ` ${sonucBirimi(tur)}` : ''
                      }`}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function StokYeniBirimler({
  satirlar,
  onChange,
  kdvDepartmanYuzde = null,
}: {
  satirlar: StokFiyatDuzenleSatir[];
  onChange: (satirlar: StokFiyatDuzenleSatir[]) => void;
  /** Üstteki KDV departmanından gelen yüzde (ör. Yiyecek %12 → 12) */
  kdvDepartmanYuzde?: number | null;
}) {
  const satirlarRef = useRef(satirlar);
  satirlarRef.current = satirlar;

  const [fiyatAdlari, setFiyatAdlari] = useState<StokFiyatAdiSecenek[]>(() => stokFiyatAdlariGetir());
  const [seciliFiyatAdi, setSeciliFiyatAdi] = useState(() => stokFiyatAdiDegeri('FİYAT'));
  const [fiyatModalAcik, setFiyatModalAcik] = useState(false);
  const [birimAdlari, setBirimAdlari] = useState<StokBirimAdiSecenek[]>(() => stokBirimAdlariGetir());
  const [birimModalAcik, setBirimModalAcik] = useState(false);
  const [silinecekSatirId, setSilinecekSatirId] = useState<string | null>(null);
  const [cokluFiyatModal, setCokluFiyatModal] = useState<{
    satirId: string;
    tur: 'alis' | 'satis';
  } | null>(null);
  const [cokluBarkodModalSatirId, setCokluBarkodModalSatirId] = useState<string | null>(null);

  useEffect(() => {
    setFiyatAdlari(stokFiyatAdlariGetir());
  }, [fiyatModalAcik]);

  useEffect(() => {
    setBirimAdlari(stokBirimAdlariGetir());
  }, [birimModalAcik]);

  // Üst KDV departmanı seçilince alış/satış KDV'ye yüzdeyi yaz
  useEffect(() => {
    if (kdvDepartmanYuzde === null || kdvDepartmanYuzde === undefined || !Number.isFinite(kdvDepartmanYuzde)) {
      return;
    }
    const yuzde = kdvDepartmanYuzde;
    const mevcut = satirlarRef.current;
    if (mevcut.every((s) => s.kdv === yuzde && (s.alisKdv ?? s.kdv) === yuzde)) return;
    onChange(mevcut.map((s) => ({ ...s, kdv: yuzde, alisKdv: yuzde })));
  }, [kdvDepartmanYuzde, onChange]);

  const birimSecenekleri = useMemo(
    () => birimAdlari.map((b) => ({ value: b.label, label: b.label })),
    [birimAdlari]
  );

  const pbSecenekleri = useMemo(
    () => STOK_FIYAT_PB_SECENEKLERI.map((p) => ({ value: p.deger, label: p.etiket })),
    []
  );

  const gorunenSatirlar = useMemo(
    () => satirlar.filter((s) => stokFiyatAdiDegeri(s.fiyatAdi) === seciliFiyatAdi),
    [satirlar, seciliFiyatAdi]
  );

  const satirPatch = useCallback(
    (id: string, patch: Partial<StokFiyatDuzenleSatir>) => {
      onChange(
        satirlarRef.current.map((s) => {
          if (s.id !== id) return s;
          const guncel = { ...s, ...patch };
          if (guncel.anaBirimMi) guncel.carpan = 1;
          return guncel;
        })
      );
    },
    [onChange]
  );

  const tekilPatch = useCallback(
    (id: string, alan: 'anaBirimMi' | 'varsayilanMi', deger: boolean) => {
      onChange(
        satirlarRef.current.map((s) => {
          if (s.id === id) {
            const guncel = { ...s, [alan]: deger };
            if (alan === 'anaBirimMi' && deger) guncel.carpan = 1;
            return guncel;
          }
          return deger ? { ...s, [alan]: false } : s;
        })
      );
    },
    [onChange]
  );

  const fiyatEkle = useCallback(() => {
    onChange([
      ...satirlarRef.current,
      bosBirimFiyatSatiri({ fiyatAdi: seciliFiyatAdi, anaBirimMi: false, varsayilanMi: false }),
    ]);
  }, [onChange, seciliFiyatAdi]);

  const satirSil = useCallback(
    (id: string) => {
      const kalan = satirlarRef.current.filter((s) => s.id !== id);
      if (kalan.length > 0) {
        onChange(kalan);
        return;
      }
      onChange([
        bosBirimFiyatSatiri({
          fiyatAdi: seciliFiyatAdi,
          anaBirimMi: true,
          varsayilanMi: true,
        }),
      ]);
    },
    [onChange, seciliFiyatAdi]
  );

  const silinecekSatir = silinecekSatirId
    ? satirlar.find((s) => s.id === silinecekSatirId) ?? null
    : null;

  const cokluFiyatSatir = cokluFiyatModal
    ? satirlar.find((s) => s.id === cokluFiyatModal.satirId) ?? null
    : null;

  const cokluBarkodSatir = cokluBarkodModalSatirId
    ? satirlar.find((s) => s.id === cokluBarkodModalSatirId) ?? null
    : null;

  const digerFiyatlariHesapla = useCallback(() => {
    const liste = gorunenSatirlar;
    const baz =
      liste.find((s) => s.anaBirimMi && (s.satisFiyati1 !== null || s.alisFiyati !== null)) ??
      liste.find((s) => s.carpan === 1 && (s.satisFiyati1 !== null || s.alisFiyati !== null)) ??
      liste.find((s) => s.satisFiyati1 !== null || s.alisFiyati !== null);

    if (!baz || liste.length < 2) return;

    const bazCarpan = baz.carpan > 0 ? baz.carpan : 1;
    const carp = (deger: number | null, oran: number): number | null => {
      if (deger === null) return null;
      return Math.round(deger * oran * 10000) / 10000;
    };

    const guncellenenIdler = new Set(liste.map((s) => s.id));
    onChange(
      satirlarRef.current.map((s) => {
        if (!guncellenenIdler.has(s.id) || s.id === baz.id) return s;
        const hedefCarpan = s.carpan > 0 ? s.carpan : 0;
        if (!hedefCarpan) return s;
        const oran = hedefCarpan / bazCarpan;
        return {
          ...s,
          alisFiyati: carp(baz.alisFiyati, oran),
          satisFiyati1: carp(baz.satisFiyati1, oran),
          kdv: baz.kdv,
          alisKdv: baz.alisKdv ?? baz.kdv,
          kdvTipi: baz.kdvTipi,
          alisKdvTipi: baz.alisKdvTipi ?? baz.kdvTipi,
        };
      })
    );
  }, [gorunenSatirlar, onChange]);

  return (
    <div className="stok-yb-kabuk stok-karti-bolum-panel">
      <div className="cari-secili-alan stok-yb-fiyat-secim">
        <div className="stok-yb-fiyat-ust-icerik">
          <div className="stok-yb-fiyat-sol">
            <div className="cari-secili-etiket-satir">
              <span className="cari-secili-etiket">Fiyat Adı</span>
              <button
                type="button"
                className="cari-secili-yonet"
                onClick={() => setFiyatModalAcik(true)}
                title="Fiyat adı yönet"
                aria-label="Fiyat adı yönet"
              >
                +
              </button>
            </div>
            <div className="cari-secili-chip-grup" role="group" aria-label="Fiyat adı">
              {fiyatAdlari.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`cari-secili-chip${seciliFiyatAdi === f.label ? ' cari-secili-chip--aktif' : ''}`}
                  onClick={() => setSeciliFiyatAdi(f.label)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="stok-yb-fiyat-araclar">
            <button
              type="button"
              className="stok-yb-tus stok-yb-tus--ikon"
              onClick={digerFiyatlariHesapla}
              title="Diğer Fiyatları Hesapla"
              aria-label="Diğer Fiyatları Hesapla"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path strokeLinecap="round" d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4" />
              </svg>
            </button>
            <button
              type="button"
              className="stok-yb-tus stok-yb-tus--ikon"
              onClick={fiyatEkle}
              title="Birim Ekle"
              aria-label="Birim Ekle"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="stok-yb-liste">
        {gorunenSatirlar.length === 0 ? (
          <div className="stok-yb-bos">
            <p>
              <strong>{seciliFiyatAdi}</strong> için birim satırı yok. Birim Ekle ile ekleyin.
            </p>
          </div>
        ) : (
          gorunenSatirlar.map((satir) => {
            const alisKdvTipi = satir.alisKdvTipi ?? satir.kdvTipi ?? 'haric';
            const satisKdvTipi = satir.kdvTipi ?? 'haric';
            return (
              <article key={satir.id} className="stok-yb-kart-kabuk">
                <button
                  type="button"
                  className="stok-yb-kart-sil cari-iletisim-kart-sil"
                  title="Satırı sil"
                  aria-label="Satırı sil"
                  onClick={() => setSilinecekSatirId(satir.id)}
                >
                  <DgIkon ad="sil" />
                </button>
                <div className="stok-yb-kart">
                  <div className="stok-yb-kart-grup stok-yb-kart-grup--alis">
                    <CariOutlinedAcilir
                      etiket="Birim"
                      zorunlu
                      sinif="stok-yb-birim-kisa"
                      deger={satir.birim}
                      secenekler={birimSecenekleri}
                      onChange={(birim) => satirPatch(satir.id, { birim: birim || 'ADET' })}
                      onYonet={() => setBirimModalAcik(true)}
                      listeYonu="yukari"
                      listeDikeyBosluk={4}
                    />
                    <CariOutlinedCarpan
                      etiket="Çarpan"
                      zorunlu
                      disabled={Boolean(satir.anaBirimMi)}
                      deger={satir.anaBirimMi ? 1 : satir.carpan}
                      onDegistir={(carpan) => {
                        if (satir.anaBirimMi) {
                          satirPatch(satir.id, { carpan: 1 });
                          return;
                        }
                        satirPatch(satir.id, { carpan: carpan ?? 1 });
                      }}
                    />
                    <CariOutlinedSayi
                      etiket="Alış Fiyatı"
                      deger={satir.alisFiyati}
                      placeholder="0,00"
                      sagaHizali
                      formatli
                      onDegistir={(alisFiyati) =>
                        satirPatch(satir.id, {
                          alisFiyati,
                          alisNetFiyat: netFiyatHesapla(alisFiyati, satir.alisIskonto),
                        })
                      }
                      onUcNokta={() => setCokluFiyatModal({ satirId: satir.id, tur: 'alis' })}
                    />
                    <CariOutlinedAcilir
                      etiket="PB"
                      deger={satir.pb2}
                      secenekler={pbSecenekleri}
                      tusMetin={stokPbSembolu(satir.pb2)}
                      sinif="stok-yb-pb-acilir"
                      listeSinifi="stok-yb-pb-acilir-liste"
                      listeMinGenislik={76}
                      onChange={(pb2) =>
                        satirPatch(satir.id, {
                          pb2: pb2 === 'USD' || pb2 === 'EUR' ? pb2 : 'TL',
                        })
                      }
                    />
                    <CariOutlinedIskonto
                      etiket="İskonto"
                      deger={satir.alisIskonto == null ? '' : String(satir.alisIskonto)}
                      onDegistir={(alisIskonto) =>
                        satirPatch(satir.id, {
                          alisIskonto,
                          alisNetFiyat: netFiyatHesapla(satir.alisFiyati, alisIskonto),
                        })
                      }
                    />
                    <CariOutlinedSayi
                      etiket="Net Fiyat"
                      deger={satir.alisNetFiyat}
                      placeholder="0,00"
                      sagaHizali
                      formatli
                      onDegistir={(alisNetFiyat) => satirPatch(satir.id, { alisNetFiyat })}
                    />
                    <CariOutlinedKdv
                      etiket="Alış KDV"
                      deger={satir.alisKdv ?? satir.kdv}
                      tip={alisKdvTipi}
                      ekstraYuzde={kdvDepartmanYuzde}
                      onChange={(alisKdv) => satirPatch(satir.id, { alisKdv })}
                      onTipChange={(alisKdvTipi) => satirPatch(satir.id, { alisKdvTipi })}
                    />
                    <CariToggleAlan
                      etiket="Ana Birim"
                      acik={Boolean(satir.anaBirimMi)}
                      onChange={(v) => tekilPatch(satir.id, 'anaBirimMi', v)}
                    />
                    <StokOlcuSecim
                      name={`olcu-${satir.id}`}
                      satir={satir}
                      onPatch={(patch) => satirPatch(satir.id, patch)}
                    />
                  </div>
                  <div className="stok-yb-kart-grup stok-yb-kart-grup--satis">
                    <CariOutlinedBarkod
                      etiket="Barkod"
                      deger={satir.barkod}
                      tip={(satir.barkodTip ?? 'EAN13') as StokBarkodTipi}
                      onBarkodDegistir={(barkod) => satirPatch(satir.id, { barkod: barkodFiltrele(barkod) })}
                      onTipDegistir={(barkodTip) => satirPatch(satir.id, { barkodTip })}
                      onBarkodModal={() => setCokluBarkodModalSatirId(satir.id)}
                    />
                    <CariOutlinedSayi
                      etiket="Satış Fiyatı"
                      zorunlu
                      deger={satir.satisFiyati1}
                      placeholder="0,00"
                      sagaHizali
                      formatli
                      onDegistir={(satisFiyati1) =>
                        satirPatch(satir.id, {
                          satisFiyati1,
                          satisNetFiyat: netFiyatHesapla(satisFiyati1, satir.satisIskonto),
                        })
                      }
                      onUcNokta={() => setCokluFiyatModal({ satirId: satir.id, tur: 'satis' })}
                    />
                    <CariOutlinedAcilir
                      etiket="PB"
                      deger={satir.pb1}
                      secenekler={pbSecenekleri}
                      tusMetin={stokPbSembolu(satir.pb1)}
                      sinif="stok-yb-pb-acilir"
                      listeSinifi="stok-yb-pb-acilir-liste"
                      listeMinGenislik={76}
                      onChange={(pb1) =>
                        satirPatch(satir.id, {
                          pb1: pb1 === 'USD' || pb1 === 'EUR' ? pb1 : 'TL',
                        })
                      }
                    />
                    <CariOutlinedIskonto
                      etiket="İskonto"
                      deger={satir.satisIskonto == null ? '' : String(satir.satisIskonto)}
                      onDegistir={(satisIskonto) =>
                        satirPatch(satir.id, {
                          satisIskonto,
                          satisNetFiyat: netFiyatHesapla(satir.satisFiyati1, satisIskonto),
                        })
                      }
                    />
                    <CariOutlinedSayi
                      etiket="Net Fiyat"
                      deger={satir.satisNetFiyat}
                      placeholder="0,00"
                      sagaHizali
                      formatli
                      onDegistir={(satisNetFiyat) => satirPatch(satir.id, { satisNetFiyat })}
                    />
                    <CariOutlinedKdv
                      etiket="Satış KDV"
                      zorunlu
                      deger={satir.kdv}
                      tip={satisKdvTipi}
                      ekstraYuzde={kdvDepartmanYuzde}
                      onChange={(kdv) => satirPatch(satir.id, { kdv })}
                      onTipChange={(kdvTipi) => satirPatch(satir.id, { kdvTipi })}
                      listeYonu="yukari"
                      listeDikeyBosluk={4}
                    />
                    <CariToggleAlan
                      etiket="Varsayılan"
                      acik={Boolean(satir.varsayilanMi)}
                      onChange={(v) => tekilPatch(satir.id, 'varsayilanMi', v)}
                    />
                  </div>
                  <CariOutlinedGirdi
                    etiket="Birim Açıklama"
                    className="stok-yb-birim-aciklama"
                    deger={satir.birimAciklama ?? ''}
                    maxLength={120}
                    odakPlaceholder="Birim açıklaması"
                    onChange={(birimAciklama) => satirPatch(satir.id, { birimAciklama })}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>

      <CariSecenekModal
        acik={fiyatModalAcik}
        baslik="Fiyat Adı"
        placeholder="Yeni fiyat adı…"
        liste={fiyatAdlari.map((f) => ({ value: f.value, label: f.label }))}
        sabitDegerler={['FIYAT']}
        onEkle={(ad) => {
          const sonuc = stokFiyatAdiEkle(ad);
          if (sonuc) {
            setFiyatAdlari(stokFiyatAdlariGetir());
            setSeciliFiyatAdi(sonuc.label);
            return true;
          }
          return false;
        }}
        onGuncelle={(value, yeniAd) => {
          const ok = stokFiyatAdiGuncelle(value, yeniAd);
          if (ok) {
            setFiyatAdlari(stokFiyatAdlariGetir());
            setSeciliFiyatAdi(stokFiyatAdiEtiketi(value));
          }
          return ok;
        }}
        onSil={(value) => {
          stokFiyatAdiSil(value);
          setFiyatAdlari(stokFiyatAdlariGetir());
          const kalan = stokFiyatAdlariGetir();
          if (kalan.length > 0) setSeciliFiyatAdi(kalan[0].label);
        }}
        onKapat={() => setFiyatModalAcik(false)}
      />

      <CariSecenekModal
        acik={birimModalAcik}
        baslik="Birim"
        placeholder="Yeni birim adı…"
        liste={birimAdlari.map((b) => ({ value: b.value, label: b.label }))}
        sabitDegerler={['ADET']}
        onEkle={(ad) => {
          const sonuc = stokBirimAdiEkle(ad);
          if (sonuc) {
            setBirimAdlari(stokBirimAdlariGetir());
            return true;
          }
          return false;
        }}
        onGuncelle={(value, yeniAd) => {
          const ok = stokBirimAdiGuncelle(value, yeniAd);
          if (ok) setBirimAdlari(stokBirimAdlariGetir());
          return ok;
        }}
        onSil={(value) => {
          stokBirimAdiSil(value);
          setBirimAdlari(stokBirimAdlariGetir());
        }}
        onKapat={() => setBirimModalAcik(false)}
      />

      <SilmeOnayModal
        acik={!!silinecekSatir}
        onKapat={() => setSilinecekSatirId(null)}
        onOnayla={() => {
          if (!silinecekSatirId) return;
          satirSil(silinecekSatirId);
          setSilinecekSatirId(null);
        }}
        baslik="Silmek istediğinize emin misiniz?"
        hedefMetin={
          silinecekSatir
            ? `${silinecekSatir.birim || 'Birim'}${silinecekSatir.barkod ? ` (${silinecekSatir.barkod})` : ''}`
            : ''
        }
        ariaLabel="Birim satırı silme onayı"
      />

      {cokluFiyatModal && cokluFiyatSatir ? (
        <StokCokluFiyatModal
          acik
          tur={cokluFiyatModal.tur}
          satir={cokluFiyatSatir}
          onKaydet={(patch) => satirPatch(cokluFiyatSatir.id, patch)}
          onKapat={() => setCokluFiyatModal(null)}
        />
      ) : null}

      {cokluBarkodModalSatirId && cokluBarkodSatir ? (
        <StokCokluBarkodModal
          acik
          satir={cokluBarkodSatir}
          onKaydet={(patch) => satirPatch(cokluBarkodSatir.id, patch)}
          onKapat={() => setCokluBarkodModalSatirId(null)}
        />
      ) : null}
    </div>
  );
}
