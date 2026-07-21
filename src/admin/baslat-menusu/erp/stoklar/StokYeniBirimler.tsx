import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CariSecenekModal } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSecenekModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formInputSinifi } from '@/formlar/FormAlani';
import { bosBirimFiyatSatiri } from './birimMap';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
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

/** f001birimler — alis_kdv / satis_kdv (% öneki input içinde) */
const KDV_SECENEKLERI = ['0', '1', '10', '20'].map((k) => ({ value: k, label: k }));

function barkodFiltrele(ham: string): string {
  return ham.replace(/[^a-zA-Z0-9]/g, '').slice(0, 64);
}

function sayiOku(ham: string): number | null {
  const t = ham.trim();
  if (!t) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function sayiGoster(deger: number | null | undefined): string {
  if (deger === null || deger === undefined) return '';
  return String(deger).replace('.', ',');
}

function MiniToggle({
  acik,
  etiket,
  onChange,
}: {
  acik: boolean;
  etiket: string;
  onChange: (acik: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={acik}
      aria-label={etiket}
      title={etiket}
      onClick={() => onChange(!acik)}
      className={`ap-tanimlar-toggle stok-yb-toggle ${acik ? 'ap-tanimlar-toggle--acik' : ''}`}
    >
      <span className="ap-tanimlar-toggle-dugme" aria-hidden />
    </button>
  );
}

function SayiInput({
  deger,
  onDegistir,
  placeholder,
  onek,
  ariaLabel,
}: {
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  placeholder?: string;
  onek?: string;
  ariaLabel: string;
}) {
  const girdi = (
    <input
      className={`${formInputSinifi} stok-yb-girdi${onek ? ' stok-yb-girdi--onekli' : ''}`}
      inputMode="decimal"
      placeholder={placeholder}
      value={sayiGoster(deger)}
      onChange={(e) => {
        const ham = e.target.value;
        if (!ham.trim()) {
          onDegistir(null);
          return;
        }
        const n = sayiOku(ham);
        if (n !== null) onDegistir(n);
      }}
      aria-label={ariaLabel}
    />
  );

  if (!onek) return girdi;

  return (
    <div className="stok-yb-onekli">
      <span className="stok-yb-onek" aria-hidden>
        {onek}
      </span>
      {girdi}
    </div>
  );
}

/**
 * Birimler ve fiyatlar — üstte fiyat adı seçimi (B2B stok listesi mantığı),
 * altta seçili fiyat adına göre birim satırları.
 */
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

  const gorunenSatirlar = useMemo(
    () => satirlar.filter((s) => stokFiyatAdiDegeri(s.fiyatAdi) === seciliFiyatAdi),
    [satirlar, seciliFiyatAdi]
  );

  const satirPatch = useCallback(
    (id: string, patch: Partial<StokFiyatDuzenleSatir>) => {
      onChange(satirlarRef.current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
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

  const digerFiyatlariHesapla = useCallback(() => {
    const liste = gorunenSatirlar;
    const baz =
      liste.find(
        (s) => s.anaBirimMi && (s.satisFiyati1 !== null || s.alisFiyati !== null)
      ) ??
      liste.find(
        (s) => s.carpan === 1 && (s.satisFiyati1 !== null || s.alisFiyati !== null)
      ) ??
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
        };
      })
    );
  }, [gorunenSatirlar, onChange]);

  return (
    <div className="stok-yb-kabuk">
      <div className="stok-yb-fiyat-ust">
        <div className="cari-secili-alan stok-yb-fiyat-secim">
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
      </div>

      <div className="stok-yb-araclar">
        <button
          type="button"
          className="stok-yb-tus stok-yb-tus--hesapla"
          onClick={digerFiyatlariHesapla}
          title="Ana birim fiyatını çarpan oranına göre diğer birimlere uygular"
        >
          Diğer Fiyatları Hesapla
        </button>
        <button type="button" className="stok-yb-tus stok-yb-tus--ekle" onClick={fiyatEkle}>
          Birim Ekle
        </button>
      </div>

      <div className="stok-yb-tablo stok-yb-tablo--birimler" role="table" aria-label="Birimler ve fiyatlar">
        <div className="stok-yb-baslik-satir" role="row">
          <div className="stok-yb-baslik" role="columnheader">
            <span className="stok-yb-baslik-birim">
              * Birim
              <button
                type="button"
                className="cari-secili-yonet stok-yb-birim-ekle"
                onClick={() => setBirimModalAcik(true)}
                title="Birim yönet"
                aria-label="Birim yönet"
              >
                +
              </button>
            </span>
            <span>Barkod</span>
            <span>* Çarpan</span>
          </div>
          <div className="stok-yb-baslik" role="columnheader">
            <span>Alış Fiyatı</span>
            <span>* Satış Fiyatı</span>
          </div>
          <div className="stok-yb-baslik" role="columnheader">
            <span>Alış KDV</span>
            <span>* Satış KDV</span>
            <span>* KDV Dahil</span>
          </div>
          <div className="stok-yb-baslik" role="columnheader">
            <span>* Ana Birim</span>
            <span>* Varsayılan</span>
            <span>* Aktif</span>
          </div>
        </div>

        {gorunenSatirlar.length === 0 ? (
          <div className="stok-yb-bos" role="row">
            <p>
              <strong>{seciliFiyatAdi}</strong> için birim satırı yok. Birim Ekle ile ekleyin.
            </p>
          </div>
        ) : (
          gorunenSatirlar.map((satir) => (
            <div key={satir.id} className="stok-yb-satir" role="row">
              <div className="stok-yb-hucre">
                <FormAcilirSecim
                  value={satir.birim}
                  onChange={(birim) => satirPatch(satir.id, { birim: birim || 'ADET' })}
                  secenekler={birimSecenekleri}
                  aria-label="Birim adı"
                />
                <input
                  className={`${formInputSinifi} stok-yb-girdi`}
                  placeholder="Barkod"
                  value={satir.barkod}
                  onChange={(e) => satirPatch(satir.id, { barkod: barkodFiltrele(e.target.value) })}
                  aria-label="Barkod"
                  inputMode="text"
                  autoComplete="off"
                />
                <SayiInput
                  deger={satir.carpan}
                  onek="×"
                  placeholder="1"
                  ariaLabel="Çarpan"
                  onDegistir={(carpan) =>
                    satirPatch(satir.id, { carpan: carpan !== null && carpan > 0 ? carpan : 1 })
                  }
                />
              </div>

              <div className="stok-yb-hucre stok-yb-hucre--fiyat">
                <SayiInput
                  deger={satir.alisFiyati}
                  placeholder="Alış fiyatı"
                  ariaLabel="Alış fiyatı"
                  onDegistir={(alisFiyati) => satirPatch(satir.id, { alisFiyati })}
                />
                <SayiInput
                  deger={satir.satisFiyati1}
                  placeholder="Satış fiyatı"
                  ariaLabel="Satış fiyatı"
                  onDegistir={(satisFiyati1) => satirPatch(satir.id, { satisFiyati1 })}
                />
              </div>

              <div className="stok-yb-hucre">
                <div className="stok-yb-onekli">
                  <span className="stok-yb-onek" aria-hidden>
                    %
                  </span>
                  <FormAcilirSecim
                    value={String(satir.alisKdv ?? satir.kdv)}
                    onChange={(v) => satirPatch(satir.id, { alisKdv: Number(v) || 0 })}
                    secenekler={KDV_SECENEKLERI.map((x) => ({ ...x }))}
                    aria-label="Alış KDV"
                  />
                </div>
                <div className="stok-yb-onekli">
                  <span className="stok-yb-onek" aria-hidden>
                    %
                  </span>
                  <FormAcilirSecim
                    value={String(satir.kdv)}
                    onChange={(v) => satirPatch(satir.id, { kdv: Number(v) || 0 })}
                    secenekler={KDV_SECENEKLERI.map((x) => ({ ...x }))}
                    aria-label="Satış KDV"
                  />
                </div>
                <div className="stok-yb-kdv-satir">
                  <button
                    type="button"
                    className="stok-yb-kdv-tip stok-yb-kdv-tip--genis"
                    title={satir.kdvTipi === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'}
                    onClick={() =>
                      satirPatch(satir.id, {
                        kdvTipi: satir.kdvTipi === 'dahil' ? 'haric' : 'dahil',
                      })
                    }
                  >
                    <span className={satir.kdvTipi === 'haric' ? 'stok-yb-kdv-tip--secili' : ''}>H</span>
                    <span className={satir.kdvTipi === 'dahil' ? 'stok-yb-kdv-tip--secili' : ''}>D</span>
                    <em>{satir.kdvTipi === 'dahil' ? 'Dahil' : 'Hariç'}</em>
                  </button>
                </div>
              </div>

              <div className="stok-yb-hucre stok-yb-hucre--islem">
                <MiniToggle
                  acik={Boolean(satir.anaBirimMi)}
                  etiket="Ana birim"
                  onChange={(v) => tekilPatch(satir.id, 'anaBirimMi', v)}
                />
                <MiniToggle
                  acik={Boolean(satir.varsayilanMi)}
                  etiket="Varsayılan birim"
                  onChange={(v) => tekilPatch(satir.id, 'varsayilanMi', v)}
                />
                <MiniToggle
                  acik={satir.aktif !== false}
                  etiket="Aktif"
                  onChange={(v) => satirPatch(satir.id, { aktif: v })}
                />
                <button
                  type="button"
                  className="stok-yb-sil"
                  title="Satırı sil"
                  aria-label="Satırı sil"
                  onClick={() => satirSil(satir.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path
                      strokeLinecap="round"
                      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CariSecenekModal
        acik={fiyatModalAcik}
        baslik="Fiyat Adı"
        aciklama="Yeni fiyat adı ekleyin. Listede düzenlemek için çift tıklayın."
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
        aciklama="Yeni birim ekleyin. Listede düzenlemek için çift tıklayın."
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
    </div>
  );
}
