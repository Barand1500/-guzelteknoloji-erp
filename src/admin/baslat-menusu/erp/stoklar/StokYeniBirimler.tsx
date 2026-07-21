import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CariSecenekModal } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSecenekModal';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import {
  CariOutlinedEtiket,
  CariOutlinedGirdi,
  CariOutlinedSarmalayici,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { bosBirimFiyatSatiri } from './birimMap';
import type { StokFiyatDuzenleSatir, StokFiyatKdvTipi } from './fiyatDuzenleTipler';
import { STOK_FIYAT_PB_SECENEKLERI } from './fiyatDuzenleTipler';
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

const KDV_SECENEKLERI = ['0', '1', '10', '20'].map((k) => ({ value: k, label: `${k} %` }));

type EkVergiTipi = 'oiv' | 'alisOtv' | 'satisOtv' | 'konaklama';

const DIGER_VERGI_SECENEKLERI: { value: EkVergiTipi; label: string }[] = [
  { value: 'oiv', label: 'ÖİV' },
  { value: 'alisOtv', label: 'Alış ÖTV' },
  { value: 'satisOtv', label: 'Satış ÖTV' },
  { value: 'konaklama', label: 'Konaklama Vergisi' },
];

function barkodFiltrele(ham: string): string {
  return ham.replace(/\D/g, '').slice(0, 64);
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

function CariToggleAlan({
  etiket,
  acik,
  onChange,
}: {
  etiket: string;
  acik: boolean;
  onChange: (acik: boolean) => void;
}) {
  return (
    <div className="cari-durum-alan stok-yb-toggle-alan">
      <span className="cari-secili-etiket">{etiket}</span>
      <div className="cari-durum-icerik">
        <MiniToggle acik={acik} etiket={etiket} onChange={onChange} />
      </div>
    </div>
  );
}

function KdvTipToggle({
  tip,
  onChange,
}: {
  tip: StokFiyatKdvTipi;
  onChange: (tip: StokFiyatKdvTipi) => void;
}) {
  return (
    <button
      type="button"
      className="stok-yb-kdv-tip stok-yb-kdv-tip--kucuk"
      title={tip === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'}
      aria-label={tip === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'}
      onClick={() => onChange(tip === 'dahil' ? 'haric' : 'dahil')}
    >
      <span className={tip === 'haric' ? 'stok-yb-kdv-tip--secili' : ''}>H</span>
      <span className={tip === 'dahil' ? 'stok-yb-kdv-tip--secili' : ''}>D</span>
    </button>
  );
}

function CariOutlinedSayi({
  etiket,
  deger,
  onDegistir,
  zorunlu,
  onek,
  placeholder,
}: {
  etiket: string;
  deger: number | null | undefined;
  onDegistir: (deger: number | null) => void;
  zorunlu?: boolean;
  onek?: string;
  placeholder?: string;
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        {onek ? (
          <span className="stok-yb-outlined-onek" aria-hidden>
            {onek}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`cari-outlined-input${onek ? ' stok-yb-outlined-input--onekli' : ''}`}
          inputMode="decimal"
          placeholder={placeholder}
          value={sayiGoster(deger)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const ham = e.target.value;
            if (!ham.trim()) {
              onDegistir(null);
              return;
            }
            const n = sayiOku(ham);
            if (n !== null) onDegistir(n);
          }}
          aria-label={etiket}
        />
      </div>
    </div>
  );
}

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
      />
    </CariOutlinedSarmalayici>
  );
}

function CariOutlinedBirim({
  deger,
  onChange,
  secenekler,
  onYonet,
}: {
  deger: string;
  onChange: (deger: string) => void;
  secenekler: { value: string; label: string }[];
  onYonet: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`cari-outlined-field cari-outlined-acilir stok-yb-birim-alan${focused ? ' cari-outlined-field--focus' : ''}`.trim()}
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

function DigerVergiBlok() {
  const [menuAcik, setMenuAcik] = useState(false);
  const [liste, setListe] = useState<{ tip: EkVergiTipi; deger: number | null }[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAcik) return;
    const kapat = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAcik(false);
    };
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, [menuAcik]);

  const eklenebilir = DIGER_VERGI_SECENEKLERI.filter((o) => !liste.some((e) => e.tip === o.value));

  return (
    <div className="stok-yb-diger-vergi" ref={menuRef}>
      <div className="stok-yb-diger-vergi-tus-wrap">
        <button
          type="button"
          className="stok-yb-diger-vergi-tus"
          onClick={() => setMenuAcik((a) => !a)}
          disabled={eklenebilir.length === 0 && liste.length === 0}
        >
          Diğer Vergi Ekle
          <span className="stok-yb-diger-vergi-ok" aria-hidden>
            ▾
          </span>
        </button>
        {menuAcik && eklenebilir.length > 0 ? (
          <div className="stok-yb-diger-vergi-menu" role="menu">
            {eklenebilir.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                className="stok-yb-diger-vergi-menu-oge"
                onClick={() => {
                  setListe((l) => [...l, { tip: opt.value, deger: null }]);
                  setMenuAcik(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {liste.map((ev, idx) => {
        const etiket = DIGER_VERGI_SECENEKLERI.find((o) => o.value === ev.tip)?.label ?? ev.tip;
        return (
          <div key={`${ev.tip}-${idx}`} className="stok-yb-ek-vergi-satir">
            <CariOutlinedSayi
              etiket={etiket}
              deger={ev.deger}
              placeholder="0,00"
              onDegistir={(deger) =>
                setListe((l) => l.map((x, i) => (i === idx ? { ...x, deger } : x)))
              }
            />
            <button
              type="button"
              className="stok-yb-ek-vergi-sil"
              title={`${etiket} kaldır`}
              aria-label={`${etiket} kaldır`}
              onClick={() => setListe((l) => l.filter((_, i) => i !== idx))}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Birimler ve fiyatlar — ana tanımlar tarzı kart düzeni.
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
          className="stok-yb-tus stok-yb-tus--ikon stok-yb-tus--hesapla"
          onClick={digerFiyatlariHesapla}
          title="Diğer Fiyatları Hesapla"
          aria-label="Diğer Fiyatları Hesapla — ana birim fiyatını çarpan oranına göre diğer birimlere uygular"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path strokeLinecap="round" d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4" />
          </svg>
        </button>
        <button
          type="button"
          className="stok-yb-tus stok-yb-tus--ikon stok-yb-tus--ekle"
          onClick={fiyatEkle}
          title="Birim Ekle"
          aria-label="Birim Ekle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
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
            const alisKdvTipi = satir.alisKdvTipi ?? satir.kdvTipi;
            return (
              <div key={satir.id} className="stok-yb-kart">
                <div className="stok-yb-kart-govde">
                  <div className="stok-yb-kart-sol">
                    <div className="stok-yb-kart-ust-satir">
                      <CariOutlinedBirim
                        deger={satir.birim}
                        secenekler={birimSecenekleri}
                        onChange={(birim) => satirPatch(satir.id, { birim: birim || 'ADET' })}
                        onYonet={() => setBirimModalAcik(true)}
                      />
                      <CariOutlinedSayi
                        etiket="Çarpan"
                        zorunlu
                        onek="×"
                        placeholder="1"
                        deger={satir.carpan}
                        onDegistir={(carpan) =>
                          satirPatch(satir.id, {
                            carpan: carpan !== null && carpan > 0 ? carpan : 1,
                          })
                        }
                      />
                    </div>
                    <CariOutlinedGirdi
                      etiket="Barkod"
                      deger={satir.barkod}
                      inputMode="numeric"
                      onChange={(barkod) => satirPatch(satir.id, { barkod: barkodFiltrele(barkod) })}
                      maxLength={64}
                      odakPlaceholder="Barkod yazınız"
                    />
                    <DigerVergiBlok />
                  </div>

                  <div className="stok-yb-kart-orta">
                    <div className="stok-yb-fiyat-satir">
                      <CariOutlinedSayi
                        etiket="Alış Fiyatı"
                        deger={satir.alisFiyati}
                        placeholder="0,00"
                        onDegistir={(alisFiyati) => satirPatch(satir.id, { alisFiyati })}
                      />
                      <CariOutlinedAcilir
                        etiket="PB"
                        deger={satir.pb1}
                        secenekler={pbSecenekleri}
                        onChange={(pb1) =>
                          satirPatch(satir.id, {
                            pb1: pb1 === 'USD' || pb1 === 'EUR' ? pb1 : 'TL',
                          })
                        }
                      />
                    </div>
                    <CariOutlinedSayi
                      etiket="Satış Fiyatı"
                      zorunlu
                      deger={satir.satisFiyati1}
                      placeholder="0,00"
                      onDegistir={(satisFiyati1) => satirPatch(satir.id, { satisFiyati1 })}
                    />
                    <div className="stok-yb-kdv-grup">
                      <div className="stok-yb-kdv-satir-compact">
                        <CariOutlinedKdv
                          etiket="Alış KDV"
                          deger={satir.alisKdv ?? satir.kdv}
                          onChange={(alisKdv) => satirPatch(satir.id, { alisKdv })}
                        />
                        <KdvTipToggle
                          tip={alisKdvTipi}
                          onChange={(alisKdvTipi) => satirPatch(satir.id, { alisKdvTipi })}
                        />
                      </div>
                      <div className="stok-yb-kdv-satir-compact">
                        <CariOutlinedKdv
                          etiket="Satış KDV"
                          zorunlu
                          deger={satir.kdv}
                          onChange={(kdv) => satirPatch(satir.id, { kdv })}
                        />
                        <KdvTipToggle
                          tip={satir.kdvTipi}
                          onChange={(kdvTipi) => satirPatch(satir.id, { kdvTipi })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="stok-yb-kart-sag">
                    <CariToggleAlan
                      etiket="Ana Birim"
                      acik={Boolean(satir.anaBirimMi)}
                      onChange={(v) => tekilPatch(satir.id, 'anaBirimMi', v)}
                    />
                    <CariToggleAlan
                      etiket="Varsayılan"
                      acik={Boolean(satir.varsayilanMi)}
                      onChange={(v) => tekilPatch(satir.id, 'varsayilanMi', v)}
                    />
                    <button
                      type="button"
                      className="stok-yb-sil stok-yb-sil--kart"
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
              </div>
            );
          })
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
