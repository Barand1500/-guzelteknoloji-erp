import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';
import { OzelRenkPaneli } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/OzelRenkPaneli';
import { tooltipMetni } from '@/araclar/tooltipMetni';
import { otKlavyeYoksayMi } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/otKlavye';
import {
  RESMI_TATIL_RENKLER,
  RESMI_TATILLER_GUNCELLENDI,
  resmiTatilEkle,
  resmiTatilGunRolu,
  resmiTatilGuncelle,
  resmiTatilGuneDuserMi,
  resmiTatilKisaEtiket,
  resmiTatilSil,
  resmiTatilleriGetir,
  type ResmiTatil,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/resmiTatiller';

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];
const GUNLER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function ayHucreleri(yil: number, ay: number) {
  const ilkGun = new Date(yil, ay, 1).getDay();
  const baslangic = ilkGun === 0 ? 6 : ilkGun - 1;
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const oncekiAyGun = new Date(yil, ay, 0).getDate();
  const hucreler: { gun: number; ayOffset: -1 | 0 | 1; tarih: string }[] = [];

  for (let i = 0; i < baslangic; i++) {
    const gun = oncekiAyGun - baslangic + 1 + i;
    const d = new Date(yil, ay - 1, gun);
    hucreler.push({
      gun,
      ayOffset: -1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  for (let g = 1; g <= gunSayisi; g++) {
    hucreler.push({ gun: g, ayOffset: 0, tarih: tarihAnahtari(yil, ay, g) });
  }
  while (hucreler.length < 42) {
    const i = hucreler.length - (baslangic + gunSayisi);
    const g = i + 1;
    const d = new Date(yil, ay + 1, g);
    hucreler.push({
      gun: g,
      ayOffset: 1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  return hucreler;
}

export function ResmiTatillerSayfasi() {
  const [liste, setListe] = useState<ResmiTatil[]>(() => resmiTatilleriGetir());
  const [ay, setAy] = useState(() => {
    const d = new Date();
    return { yil: d.getFullYear(), ay: d.getMonth() };
  });
  const [odakliTarih, setOdakliTarih] = useState<string | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<ResmiTatil | null>(null);
  const [silinecek, setSilinecek] = useState<ResmiTatil | null>(null);
  const [adi, setAdi] = useState('');
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [renk, setRenk] = useState<string>(RESMI_TATIL_RENKLER[0]);
  const [hata, setHata] = useState('');
  const [varsayilanBaslangic, setVarsayilanBaslangic] = useState('');
  const [ozelPanelAcik, setOzelPanelAcik] = useState(false);
  const ozelBtnRef = useRef<HTMLButtonElement>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);

  const yenile = useCallback(() => setListe(resmiTatilleriGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(RESMI_TATILLER_GUNCELLENDI, h);
    return () => window.removeEventListener(RESMI_TATILLER_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) {
      setOzelPanelAcik(false);
      return;
    }
    setHata('');
    if (duzenlenen) {
      setAdi(duzenlenen.adi);
      setBaslangic(duzenlenen.baslangic);
      setBitis(duzenlenen.bitis);
      setRenk(duzenlenen.renk);
    } else {
      setAdi('');
      setBaslangic(varsayilanBaslangic);
      setBitis(varsayilanBaslangic);
      setRenk(RESMI_TATIL_RENKLER[0]);
    }
  }, [modalAcik, duzenlenen, varsayilanBaslangic]);

  const hucreler = useMemo(() => ayHucreleri(ay.yil, ay.ay), [ay]);
  const bugun = tarihAnahtari(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const hazirRenkMi = (RESMI_TATIL_RENKLER as readonly string[]).includes(renk);

  const varsayilanOdak = useCallback(() => {
    const [by, bm] = bugun.split('-').map(Number);
    if (by === ay.yil && bm === ay.ay + 1) return bugun;
    return tarihAnahtari(ay.yil, ay.ay, 1);
  }, [ay.ay, ay.yil, bugun]);

  const tarihHaftaGunu = useCallback((tarih: string) => {
    const [y, m, g] = tarih.split('-').map(Number);
    return new Date(y!, m! - 1, g!).getDay(); // 0 Pazar … 1 Pazartesi
  }, []);

  const gunKaydir = useCallback(
    (delta: number) => {
      const base = odakliTarih ?? varsayilanOdak();
      const [y, m, g] = base.split('-').map(Number);
      const d = new Date(y!, m! - 1, g!);
      d.setDate(d.getDate() + delta);
      const yeni = tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate());
      setOdakliTarih(yeni);
      if (d.getFullYear() !== ay.yil || d.getMonth() !== ay.ay) {
        setAy({ yil: d.getFullYear(), ay: d.getMonth() });
      }
    },
    [ay.ay, ay.yil, odakliTarih, varsayilanOdak]
  );

  function yeniAc(bas?: string) {
    setDuzenlenen(null);
    setVarsayilanBaslangic(bas ?? '');
    setModalAcik(true);
  }

  function duzenleAc(t: ResmiTatil) {
    setDuzenlenen(t);
    setVarsayilanBaslangic('');
    setModalAcik(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (otKlavyeYoksayMi(e, sayfaRef.current)) return;

      const takvimde = odakliTarih !== null;

      // Takvim odağındayken ↑↓ hafta gezer; değilse Tanımlar listesine bırak
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!takvimde) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        gunKaydir(e.key === 'ArrowDown' ? 7 : -7);
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();

        // İlk ←/→ ile takvime gir
        if (!takvimde) {
          setOdakliTarih(varsayilanOdak());
          return;
        }

        // Pazartesi sütununda bir kez daha ← → takvimden çık (Tanımlar ↑↓ serbest)
        if (e.key === 'ArrowLeft' && tarihHaftaGunu(odakliTarih) === 1) {
          setOdakliTarih(null);
          return;
        }

        // Pazar sütununda bir kez daha → → takvimden çık
        if (e.key === 'ArrowRight' && tarihHaftaGunu(odakliTarih) === 0) {
          setOdakliTarih(null);
          return;
        }

        gunKaydir(e.key === 'ArrowRight' ? 1 : -1);
        return;
      }

      // Yalnızca takvim odağındayken Enter → o güne ekle; değilse hub +Ekle
      if (e.key === 'Enter' && takvimde && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        yeniAc(odakliTarih);
      }
    }

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [gunKaydir, odakliTarih, tarihHaftaGunu, varsayilanOdak]);

  function kaydet(e: FormEvent) {
    e.preventDefault();
    const girdi = { adi, baslangic, bitis: bitis || baslangic, renk, aktif: true };
    if (duzenlenen) {
      if (!resmiTatilGuncelle(duzenlenen.id, girdi)) {
        setHata('Güncellenemedi. Ad, başlangıç ve bitiş zorunlu.');
        return;
      }
    } else if (!resmiTatilEkle(girdi)) {
      setHata('Eklenemedi. Ad, başlangıç ve bitiş zorunlu.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  return (
    <div className="ot-rt-sayfa" ref={sayfaRef}>
      <div className="ot-rt-ust">
        <div className="ot-rt-nav">
          <button
            type="button"
            className="ot-rt-nav-tus"
            aria-label="Önceki ay"
            onClick={() =>
              setAy((o) => {
                const d = new Date(o.yil, o.ay - 1, 1);
                return { yil: d.getFullYear(), ay: d.getMonth() };
              })
            }
          >
            ‹
          </button>
          <h2 className="ot-rt-baslik">
            {AYLAR[ay.ay]} {ay.yil}
          </h2>
          <button
            type="button"
            className="ot-rt-nav-tus"
            aria-label="Sonraki ay"
            onClick={() =>
              setAy((o) => {
                const d = new Date(o.yil, o.ay + 1, 1);
                return { yil: d.getFullYear(), ay: d.getMonth() };
              })
            }
          >
            ›
          </button>
        </div>
        <button type="button" className="ot-btn-ekle" onClick={() => yeniAc()}>
          + Ekle
        </button>
      </div>

      <div className="ot-rt-takvim">
        <div className="ot-rt-grid" role="grid" aria-label="Resmi tatil takvimi">
          {GUNLER.map((g) => (
            <div key={g} className="ot-rt-gun-baslik">
              {g}
            </div>
          ))}
          {hucreler.map((h) => {
            const gunTatiller = liste.filter((t) => t.aktif && resmiTatilGuneDuserMi(t, h.tarih));
            const odakli = odakliTarih === h.tarih;
            return (
              <button
                key={h.tarih}
                type="button"
                role="gridcell"
                aria-selected={odakli}
                className={`ot-rt-hucre${h.ayOffset !== 0 ? ' ot-rt-hucre--dis' : ''}${
                  h.tarih === bugun ? ' ot-rt-hucre--bugun' : ''
                }${odakli ? ' ot-rt-hucre--odak' : ''}`}
                onClick={() => {
                  setOdakliTarih(h.tarih);
                  yeniAc(h.tarih);
                }}
                title="Bu güne tatil ekle"
              >
                <span className="ot-rt-gun-no">{h.gun}</span>
                <div className="ot-rt-chip-liste">
                  {gunTatiller.slice(0, 3).map((t) => {
                    const rol = resmiTatilGunRolu(t, h.tarih);
                    const metinGoster = rol === 'tek' || rol === 'bas';
                    return (
                      <span
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        className={`ot-rt-chip ot-rt-chip--${rol ?? 'tek'}`}
                        style={{ background: t.renk }}
                        title={`${t.adi} (${resmiTatilKisaEtiket(t)})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          duzenleAc(t);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            duzenleAc(t);
                          }
                        }}
                      >
                        {metinGoster ? t.adi : '\u00A0'}
                      </span>
                    );
                  })}
                  {gunTatiller.length > 3 ? (
                    <span className="ot-rt-daha">+{gunTatiller.length - 3}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="ot-rt-ipucu ap-muted text-sm">
        ← → ile takvime girip gün gezinin; Pazartesi’de bir kez daha ← ile çıkın. Enter ile o güne tatil
        ekleyin.
      </p>

      <SistemModal
        acik={modalAcik}
        onKapat={() => setModalAcik(false)}
        baslik={duzenlenen ? 'Resmi Tatil Gününü Düzenle' : 'Resmi Tatil Günü Ekle'}
        genislik="md"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex w-full items-center justify-between gap-2">
              {duzenlenen ? (
                <button
                  type="button"
                  className="ap-btn-ghost rounded-lg px-3 py-2 text-sm text-red-600"
                  onClick={() => {
                    setSilinecek(duzenlenen);
                    setModalAcik(false);
                  }}
                >
                  Sil
                </button>
              ) : (
                <span />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="ap-btn-ghost rounded-lg px-4 py-2 text-sm"
                  onClick={() => setModalAcik(false)}
                >
                  Kapat
                </button>
                <button type="submit" form="ot-rt-form" className="ot-btn-kaydet">
                  Kaydet
                </button>
              </div>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-rt-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <label className="ot-alan">
            <span className="ot-alan-etiket">
              Adı <span className="ot-zorunlu">*</span>
            </span>
            <input
              className="ot-pb-girdi"
              value={adi}
              onChange={(e) => setAdi(e.target.value)}
              placeholder="Örn. Ramazan Bayramı"
              required
            />
          </label>
          <div className="ot-pb-grid-2">
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Başlangıç <span className="ot-zorunlu">*</span>
              </span>
              <input
                type="date"
                className="ot-pb-girdi"
                value={baslangic}
                onChange={(e) => {
                  const v = e.target.value;
                  setBaslangic(v);
                  if (v && bitis && bitis < v) setBitis(v);
                  if (!bitis) setBitis(v);
                }}
                required
              />
            </label>
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Bitiş <span className="ot-zorunlu">*</span>
              </span>
              <input
                type="date"
                className="ot-pb-girdi"
                value={bitis}
                min={baslangic || undefined}
                onChange={(e) => setBitis(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="ot-alan">
            <span className="ot-alan-etiket">Renk</span>
            <div className="ot-rt-renk-liste" role="radiogroup" aria-label="Tatil rengi">
              {RESMI_TATIL_RENKLER.map((r) => {
                const secili = renk === r && !ozelPanelAcik;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={secili}
                    className={`ot-rt-renk${secili ? ' ot-rt-renk--aktif' : ''}`}
                    style={{ background: r, ['--ot-rt-swatch' as string]: r }}
                    onClick={() => {
                      setOzelPanelAcik(false);
                      setRenk(r);
                    }}
                    title={tooltipMetni('Renk seç')}
                    aria-label={`Renk ${r}`}
                  />
                );
              })}

              <div className="ot-rt-renk-ozel-wrap">
                <button
                  ref={ozelBtnRef}
                  type="button"
                  role="radio"
                  aria-checked={!hazirRenkMi}
                  aria-expanded={ozelPanelAcik}
                  aria-label="Özel renk"
                  title={tooltipMetni('Özel renk seç')}
                  className={`ot-rt-renk ot-rt-renk-ozel-btn${
                    !hazirRenkMi ? ' ot-rt-renk--aktif ot-rt-renk-ozel-btn--secili' : ''
                  }`}
                  style={
                    !hazirRenkMi
                      ? { background: renk, ['--ot-rt-swatch' as string]: renk }
                      : undefined
                  }
                  onClick={() => setOzelPanelAcik((v) => !v)}
                >
                  {hazirRenkMi ? <span className="ot-rt-renk-ozel-arti">+</span> : null}
                </button>
                <OzelRenkPaneli
                  acik={ozelPanelAcik}
                  onKapat={() => setOzelPanelAcik(false)}
                  renk={!hazirRenkMi ? renk : '#FF6000'}
                  capRef={ozelBtnRef}
                  onRenkChange={(hex) => setRenk(hex)}
                />
              </div>
            </div>
          </div>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            resmiTatilSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek?.adi ?? ''}
      />
    </div>
  );
}
