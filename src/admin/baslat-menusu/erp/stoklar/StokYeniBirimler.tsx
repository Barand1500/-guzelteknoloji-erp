import { useCallback, useRef } from 'react';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formInputSinifi } from '@/formlar/FormAlani';
import { bosBirimFiyatSatiri } from './birimMap';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

/** f001birimler — birim_adi */
const BIRIM_SECENEKLERI = ['ADET', 'PAKET', 'KOLİ', 'KUTU', 'SET', 'KG', 'LT'].map((b) => ({
  value: b,
  label: b,
}));

/** f001birimler — fiyat_adi */
const FIYAT_ADI_SECENEKLERI = ['FİYAT', 'PERAKENDE', 'TOPTAN'].map((f) => ({
  value: f,
  label: f,
}));

/** f001birimler — alis_kdv / satis_kdv (% öneki input içinde) */
const KDV_SECENEKLERI = ['0', '1', '10', '20'].map((k) => ({ value: k, label: k }));

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
 * F001 birimler kartı — alanlar f001birimler tablosuna göre:
 * birim_adi, barkod, carpan, fiyat_adi, alis_fiyati, satis_fiyati,
 * alis_kdv, satis_kdv, kdv_dahil, durum (+ ürün ana/varsayılan işaretleri)
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
    onChange([...satirlarRef.current, bosBirimFiyatSatiri()]);
  }, [onChange]);

  const satirSil = useCallback(
    (id: string) => {
      const kalan = satirlarRef.current.filter((s) => s.id !== id);
      onChange(kalan.length > 0 ? kalan : [bosBirimFiyatSatiri({ anaBirimMi: true, varsayilanMi: true })]);
    },
    [onChange]
  );

  /**
   * Ana birim fiyatlarını çarpan oranına göre diğer birimlere uygular.
   * Örn: ADET×1 satış=265 → KOLİ×12 satış=3180
   */
  const digerFiyatlariHesapla = useCallback(() => {
    const liste = satirlarRef.current;
    const baz =
      liste.find(
        (s) => s.anaBirimMi && (s.satisFiyati1 !== null || s.alisFiyati !== null)
      ) ??
      liste.find(
        (s) => s.carpan === 1 && (s.satisFiyati1 !== null || s.alisFiyati !== null)
      ) ??
      liste.find((s) => s.satisFiyati1 !== null || s.alisFiyati !== null);

    if (!baz) return;
    if (liste.length < 2) return;

    const bazCarpan = baz.carpan > 0 ? baz.carpan : 1;
    const carp = (deger: number | null, oran: number): number | null => {
      if (deger === null) return null;
      return Math.round(deger * oran * 10000) / 10000;
    };

    onChange(
      liste.map((s) => {
        if (s.id === baz.id) return s;
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
  }, [onChange]);

  return (
    <div className="stok-yb-kabuk">
      <div className="stok-yb-araclar">
        <button
          type="button"
          className="stok-yb-tus stok-yb-tus--hesapla"
          onClick={digerFiyatlariHesapla}
          title="Ana birim fiyatını çarpan oranına göre diğer birimlere uygular (ADET / KOLİ / PAKET)"
        >
          Diğer Fiyatları Hesapla
        </button>
        <button type="button" className="stok-yb-tus stok-yb-tus--ekle" onClick={fiyatEkle}>
          Fiyat Ekle
        </button>
      </div>

      <div className="stok-yb-tablo stok-yb-tablo--f001" role="table" aria-label="F001 birimler">
        <div className="stok-yb-baslik-satir" role="row">
          <div className="stok-yb-baslik" role="columnheader">
            <span>* Birim</span>
            <span>Barkod</span>
            <span>* Çarpan</span>
          </div>
          <div className="stok-yb-baslik" role="columnheader">
            <span>* Fiyat Adı</span>
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

        {satirlar.map((satir) => (
          <div key={satir.id} className="stok-yb-satir" role="row">
            <div className="stok-yb-hucre">
              <FormAcilirSecim
                value={satir.birim}
                onChange={(birim) => satirPatch(satir.id, { birim: birim || 'ADET' })}
                secenekler={BIRIM_SECENEKLERI.map((x) => ({ ...x }))}
                aria-label="Birim adı"
              />
              <input
                className={`${formInputSinifi} stok-yb-girdi`}
                placeholder="Barkod"
                value={satir.barkod}
                onChange={(e) => satirPatch(satir.id, { barkod: e.target.value })}
                aria-label="Barkod"
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

            <div className="stok-yb-hucre">
              <FormAcilirSecim
                value={satir.fiyatAdi || 'FİYAT'}
                onChange={(fiyatAdi) => satirPatch(satir.id, { fiyatAdi: fiyatAdi || 'FİYAT' })}
                secenekler={FIYAT_ADI_SECENEKLERI.map((x) => ({ ...x }))}
                aria-label="Fiyat adı"
              />
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
        ))}
      </div>
    </div>
  );
}
