import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  VERGI_DAIRELERI_GUNCELLENDI,
  vergiDaireleriOtGetir,
  vergiDairesiOtEkle,
  vergiDairesiOtGuncelle,
  vergiDairesiOtSil,
  type VergiDairesi,
  type VergiDairesiGirdi,
  type VergiSureTipi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiDaireleriOt';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import {
  OtOutlinedAcilir,
  OtOutlinedAlan,
  OtOutlinedGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';
import { turkiyeIlAdlari, turkiyeIlceAdlari } from '@/veri/turkiyeIlIlce';
import { vergiDaireleriListeYukle } from '@/veri/vergiDaireleriApi';

const BOS: VergiDairesiGirdi = {
  adi: '',
  detayli: false,
  il: '',
  ilce: '',
  gibKodu: '',
  muhBirKodu: '',
  vergiDairesiAdi: '',
  sureTipi: '',
  mtv: false,
  kdv: false,
  otv: false,
  aktif: true,
};

const SURE_SECENEKLERI = [
  { value: 'surekli', label: 'Sürekli' },
  { value: 'sureksiz', label: 'Süreksiz' },
];

function OnayHucre({ aktif }: { aktif: boolean }) {
  return aktif ? (
    <span className="ot-bk-onay" title="Evet">
      ✓
    </span>
  ) : (
    <span className="ap-muted">—</span>
  );
}

export function VergiDaireleriListeSayfasi() {
  const [liste, setListe] = useState<VergiDairesi[]>(() => vergiDaireleriOtGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [detayliGorunum, setDetayliGorunum] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<VergiDairesi | null>(null);
  const [silinecek, setSilinecek] = useState<VergiDairesi | null>(null);
  const [form, setForm] = useState<VergiDairesiGirdi>(BOS);
  const [hata, setHata] = useState('');
  const [ilceler, setIlceler] = useState<{ value: string; label: string }[]>([]);
  const [vdSecenekleri, setVdSecenekleri] = useState<{ value: string; label: string }[]>([]);

  const yenile = useCallback(() => setListe(vergiDaireleriOtGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(VERGI_DAIRELERI_GUNCELLENDI, h);
    return () => window.removeEventListener(VERGI_DAIRELERI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    void vergiDaireleriListeYukle()
      .then((adlar) => setVdSecenekleri(adlar.map((a) => ({ value: a, label: a }))))
      .catch(() => setVdSecenekleri([]));
  }, []);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    if (duzenlenen) {
      setForm({
        adi: duzenlenen.adi,
        detayli: duzenlenen.detayli,
        il: duzenlenen.il,
        ilce: duzenlenen.ilce,
        gibKodu: duzenlenen.gibKodu,
        muhBirKodu: duzenlenen.muhBirKodu,
        vergiDairesiAdi: duzenlenen.vergiDairesiAdi,
        sureTipi: duzenlenen.sureTipi,
        mtv: duzenlenen.mtv,
        kdv: duzenlenen.kdv,
        otv: duzenlenen.otv,
        aktif: duzenlenen.aktif,
      });
    } else {
      setForm({ ...BOS });
    }
  }, [modalAcik, duzenlenen]);

  useEffect(() => {
    if (!form.detayli || !form.il) {
      setIlceler([]);
      return;
    }
    let iptal = false;
    void turkiyeIlceAdlari(form.il).then((adlar) => {
      if (!iptal) setIlceler(adlar.map((a) => ({ value: a, label: a })));
    });
    return () => {
      iptal = true;
    };
  }, [form.detayli, form.il]);

  const ilSecenekleri = useMemo(
    () => turkiyeIlAdlari().map((a) => ({ value: a, label: a })),
    [modalAcik]
  );

  const filtrelenenVd = vdSecenekleri;

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter((d) => {
      const alanlar = [
        d.adi,
        d.il,
        d.ilce,
        d.gibKodu,
        d.muhBirKodu,
        d.vergiDairesiAdi,
        d.sureTipi,
      ];
      return alanlar.some((a) => a.toLocaleLowerCase('tr').includes(q));
    });
  }, [liste, arama]);

  useEffect(() => setSayfa(1), [arama, sayfaBoyutu, detayliGorunum]);

  const { toplamSayfa, guvenliSayfa, baslangic, kayitlar, bitis } = otSayfaDilimleri(
    filtrelenen,
    sayfa,
    sayfaBoyutu
  );

  function kaydet(e: FormEvent) {
    e.preventDefault();
    const girdi: VergiDairesiGirdi = {
      ...form,
      adi: form.adi.trim() || form.vergiDairesiAdi.trim(),
    };
    if (!girdi.adi) {
      setHata('Ad zorunlu.');
      return;
    }
    if (duzenlenen) {
      if (!vergiDairesiOtGuncelle(duzenlenen.id, girdi)) {
        setHata('Güncellenemedi.');
        return;
      }
    } else if (!vergiDairesiOtEkle(girdi)) {
      setHata('Eklenemedi.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  return (
    <div className="ot-pb-sayfa">
      <div className="ot-pb-kontroller">
        <label className="ot-pb-sayfa-boyutu">
          <select
            value={sayfaBoyutu}
            onChange={(e) => setSayfaBoyutu(Number(e.target.value))}
            className="ap-input"
          >
            {OT_SAYFA_SECENEKLERI.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ap-muted text-sm">veri göster</span>
        </label>
        <div className="ot-pb-kontroller-sag">
          <button
            type="button"
            className={`ot-vd-detay-toggle${detayliGorunum ? ' ot-vd-detay-toggle-aktif' : ''}`}
            title={detayliGorunum ? 'Normal görünüm' : 'Detaylı görünüm'}
            aria-pressed={detayliGorunum}
            onClick={() => setDetayliGorunum((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {detayliGorunum ? 'Detaylı' : 'Normal'}
          </button>
          <div className="ot-pb-arama">
            <AdminAramaKutusu deger={arama} onChange={setArama} placeholder="Ara" />
          </div>
          <button
            type="button"
            className="ot-btn-ekle"
            onClick={() => {
              setDuzenlenen(null);
              setModalAcik(true);
            }}
          >
            + Ekle
          </button>
        </div>
      </div>

      <div className="ot-pb-tablo-sarici">
        <table className="ot-pb-tablo">
          <thead>
            <tr>
              <th>Adı</th>
              {detayliGorunum ? (
                <>
                  <th>İl</th>
                  <th>İlçe</th>
                  <th>GİB</th>
                  <th>MUH.BİR Kodu</th>
                  <th>Vergi Dairesi</th>
                  <th>Süre</th>
                  <th>MTV</th>
                  <th>KDV</th>
                  <th>ÖTV</th>
                </>
              ) : null}
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={detayliGorunum ? 11 : 2} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((d) => (
                <tr key={d.id}>
                  <td>{d.adi}</td>
                  {detayliGorunum ? (
                    <>
                      <td>{d.il || '—'}</td>
                      <td>{d.ilce || '—'}</td>
                      <td>{d.gibKodu || '—'}</td>
                      <td>{d.muhBirKodu || '—'}</td>
                      <td>{d.vergiDairesiAdi || '—'}</td>
                      <td>
                        {d.sureTipi === 'surekli'
                          ? 'Sürekli'
                          : d.sureTipi === 'sureksiz'
                            ? 'Süreksiz'
                            : '—'}
                      </td>
                      <td>
                        <OnayHucre aktif={d.mtv} />
                      </td>
                      <td>
                        <OnayHucre aktif={d.kdv} />
                      </td>
                      <td>
                        <OnayHucre aktif={d.otv} />
                      </td>
                    </>
                  ) : null}
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(d);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(d)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OtSayfalama
        guvenliSayfa={guvenliSayfa}
        toplamSayfa={toplamSayfa}
        baslangic={baslangic}
        bitis={bitis}
        toplam={filtrelenen.length}
        onSayfa={setSayfa}
      />

      <SistemModal
        acik={modalAcik}
        onKapat={() => setModalAcik(false)}
        baslik={duzenlenen ? 'Vergi Dairesi Düzenle' : 'Vergi Dairesi Ekle'}
        genislik={form.detayli ? 'lg' : 'md'}
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
                Kapat
              </button>
              <button type="submit" form="ot-vd-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-vd-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}

          <label className="ot-vd-detayli-secim">
            <input
              type="checkbox"
              checked={form.detayli}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  detayli: e.target.checked,
                  ...(e.target.checked
                    ? {}
                    : {
                        il: '',
                        ilce: '',
                        gibKodu: '',
                        muhBirKodu: '',
                        vergiDairesiAdi: '',
                        sureTipi: '' as VergiSureTipi,
                        mtv: false,
                        kdv: false,
                        otv: false,
                      }),
                }))
              }
            />
            <span>Detaylı ekle</span>
          </label>

          {!form.detayli ? (
            <OtOutlinedGirdi
              etiket="Adı"
              deger={form.adi}
              onChange={(adi) => setForm((f) => ({ ...f, adi }))}
              zorunlu
            />
          ) : (
            <>
              <div className="ot-pb-grid-2">
                <OtOutlinedAcilir
                  etiket="İl"
                  deger={form.il}
                  onChange={(il) => setForm((f) => ({ ...f, il, ilce: '', vergiDairesiAdi: '' }))}
                  secenekler={ilSecenekleri}
                />
                <OtOutlinedAcilir
                  etiket="İlçe"
                  deger={form.ilce}
                  onChange={(ilce) => setForm((f) => ({ ...f, ilce }))}
                  secenekler={ilceler}
                  disabled={!form.il}
                />
              </div>

              <div className="ot-pb-grid-2">
                <OtOutlinedGirdi
                  etiket="GİB Kodu"
                  deger={form.gibKodu}
                  onChange={(gibKodu) => setForm((f) => ({ ...f, gibKodu }))}
                />
                <OtOutlinedGirdi
                  etiket="MUH.BİR Kodu"
                  deger={form.muhBirKodu}
                  onChange={(muhBirKodu) => setForm((f) => ({ ...f, muhBirKodu }))}
                />
              </div>

              <OtOutlinedAcilir
                etiket="Vergi Dairesi Adı"
                deger={form.vergiDairesiAdi}
                onChange={(vergiDairesiAdi) =>
                  setForm((f) => ({
                    ...f,
                    vergiDairesiAdi,
                    adi: vergiDairesiAdi || f.adi,
                  }))
                }
                secenekler={filtrelenenVd}
                zorunlu
              />

              <OtOutlinedGirdi
                etiket="Liste Adı"
                deger={form.adi}
                onChange={(adi) => setForm((f) => ({ ...f, adi }))}
                odakPlaceholder="Tabloda görünecek ad"
              />

              <OtOutlinedAcilir
                etiket="Sürekli / Süreksiz"
                deger={form.sureTipi}
                onChange={(sureTipi) =>
                  setForm((f) => ({ ...f, sureTipi: sureTipi as VergiSureTipi }))
                }
                secenekler={SURE_SECENEKLERI}
              />

              <OtOutlinedAlan etiket="Vergi türleri">
                <div className="ot-vd-check-grup">
                  {(
                    [
                      ['mtv', 'MTV'],
                      ['kdv', 'KDV'],
                      ['otv', 'ÖTV'],
                    ] as const
                  ).map(([alan, etiket]) => (
                    <label key={alan} className="ot-vd-check">
                      <input
                        type="checkbox"
                        checked={form[alan]}
                        onChange={(e) => setForm((f) => ({ ...f, [alan]: e.target.checked }))}
                      />
                      <span>{etiket}</span>
                    </label>
                  ))}
                </div>
              </OtOutlinedAlan>
            </>
          )}
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            vergiDairesiOtSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek?.adi ?? ''}
      />
    </div>
  );
}
