import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { StokBarkodTipi, StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
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
  KdvTipSegment,
} from './stokYeniBirimlerYardimci';
import { StokCokluBarkodModal } from './StokCokluBarkodModal';
import { StokCokluFiyatModal } from './StokCokluFiyatModal';

const KDV_SECENEKLERI = ['0', '1', '10', '20'].map((k) => ({ value: k, label: `% ${k}` }));

function CariOutlinedKdv({
  etiket,
  deger,
  onChange,
  zorunlu,
}: {
  etiket: string;
  deger: number;
  onChange: (deger: number) => void;
  zorunlu?: boolean;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      className="cari-outlined-acilir stok-yb-kdv-outlined"
    >
      <FormAcilirSecim
        value={String(deger)}
        onChange={(v) => onChange(Number(v) || 0)}
        secenekler={KDV_SECENEKLERI.map((x) => ({ ...x }))}
        aria-label={etiket}
        className="cari-outlined-acilir-tus"
        listeSinifi="stok-yb-kdv-outlined-liste"
      />
    </CariOutlinedSarmalayici>
  );
}

function CariOutlinedBirim({
  deger,
  onChange,
  secenekler,
  onYonet,
  sinif,
}: {
  deger: string;
  onChange: (deger: string) => void;
  secenekler: { value: string; label: string }[];
  onYonet: () => void;
  sinif?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field cari-outlined-acilir stok-yb-birim-alan${sinif ? ` ${sinif}` : ''}${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <CariOutlinedEtiket etiket="Birim" zorunlu>
        <button
          type="button"
          className="cari-secili-yonet stok-yb-birim-ekle"
          onClick={onYonet}
          title="Birim yönet"
          aria-label="Birim yönet"
        >
          +
        </button>
      </CariOutlinedEtiket>
      <div className="cari-outlined-cerceve cari-outlined-cerceve--icerik">
        <div className="cari-outlined-icerik">
          <FormAcilirSecim
            value={deger}
            onChange={onChange}
            secenekler={secenekler}
            aria-label="Birim adı"
            className="cari-outlined-acilir-tus"
          />
        </div>
      </div>
    </div>
  );
}

export function StokYeniBirimler({
  satirlar,
  onChange,
}: {
  satirlar: StokFiyatDuzenleSatir[];
  onChange: (satirlar: StokFiyatDuzenleSatir[]) => void;
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
                    <CariOutlinedBirim
                      sinif="stok-yb-birim-kisa"
                      deger={satir.birim}
                      secenekler={birimSecenekleri}
                      onChange={(birim) => satirPatch(satir.id, { birim: birim || 'ADET' })}
                      onYonet={() => setBirimModalAcik(true)}
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
                      onDegistir={(alisFiyati) => satirPatch(satir.id, { alisFiyati })}
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
                    <CariOutlinedKdv
                      etiket="Alış KDV"
                      deger={satir.alisKdv ?? satir.kdv}
                      onChange={(alisKdv) => satirPatch(satir.id, { alisKdv })}
                    />
                    <KdvTipSegment
                      tip={alisKdvTipi}
                      onChange={(alisKdvTipi) => satirPatch(satir.id, { alisKdvTipi })}
                    />
                    <CariToggleAlan
                      etiket="Ana Birim"
                      acik={Boolean(satir.anaBirimMi)}
                      onChange={(v) => tekilPatch(satir.id, 'anaBirimMi', v)}
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
                      onDegistir={(satisFiyati1) => satirPatch(satir.id, { satisFiyati1 })}
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
                    <CariOutlinedKdv
                      etiket="Satış KDV"
                      zorunlu
                      deger={satir.kdv}
                      onChange={(kdv) => satirPatch(satir.id, { kdv })}
                    />
                    <KdvTipSegment
                      tip={satisKdvTipi}
                      onChange={(kdvTipi) => satirPatch(satir.id, { kdvTipi })}
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
