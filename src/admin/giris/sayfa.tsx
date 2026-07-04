import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { oturumSecenekleriGetir } from '@/admin/ortak/api/authApi';
import type { OturumFirma } from '@/admin/ortak/tipler/admin';
import { UYGULAMA_ADI, BACKEND_YOK } from '@/yapilandirma/uygulama';
import { useAdminTema } from '@/baglamlar/AdminTemaContext';
import '@/stiller/adminTema.css';

function varsayilanSecimler(firmalar: OturumFirma[]) {
  const firma = firmalar[0];
  const donem = firma?.donemler[0];
  const sube = firma?.subeler[0];
  const kasa = sube?.kasalar[0];
  return {
    firmaKodu: firma?.firmaKodu ?? '',
    donemKodu: donem?.donemKodu ?? '',
    subeKodu: sube?.subeKodu ?? '',
    kasaKodu: kasa?.kasaKodu ?? '',
  };
}

export function GirisSayfasi() {
  const { girisYap } = useAuth();
  const { tema, temaDegistir, koyuMu } = useAdminTema();
  const [firmalar, setFirmalar] = useState<OturumFirma[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullaniciKodu, setKullaniciKodu] = useState('ADMIN');
  const [sifre, setSifre] = useState('');
  const [firmaKodu, setFirmaKodu] = useState('');
  const [donemKodu, setDonemKodu] = useState('');
  const [subeKodu, setSubeKodu] = useState('');
  const [kasaKodu, setKasaKodu] = useState('');
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  useEffect(() => {
    oturumSecenekleriGetir()
      .then((veri) => {
        setFirmalar(veri.firmalar);
        const varsayilan = varsayilanSecimler(veri.firmalar);
        setFirmaKodu(varsayilan.firmaKodu);
        setDonemKodu(varsayilan.donemKodu);
        setSubeKodu(varsayilan.subeKodu);
        setKasaKodu(varsayilan.kasaKodu);
      })
      .catch((err) => {
        setHata(err instanceof Error ? err.message : 'Oturum secenekleri yuklenemedi');
      })
      .finally(() => setYukleniyor(false));
  }, []);

  const seciliFirma = useMemo(
    () => firmalar.find((f) => f.firmaKodu === firmaKodu),
    [firmalar, firmaKodu]
  );

  const donemler = seciliFirma?.donemler ?? [];
  const subeler = seciliFirma?.subeler ?? [];
  const seciliSube = subeler.find((s) => s.subeKodu === subeKodu);
  const kasalar = seciliSube?.kasalar ?? [];

  function firmaDegistir(kod: string) {
    const firma = firmalar.find((f) => f.firmaKodu === kod);
    setFirmaKodu(kod);
    setDonemKodu(firma?.donemler[0]?.donemKodu ?? '');
    setSubeKodu(firma?.subeler[0]?.subeKodu ?? '');
    setKasaKodu(firma?.subeler[0]?.kasalar[0]?.kasaKodu ?? '');
  }

  function subeDegistir(kod: string) {
    const sube = subeler.find((s) => s.subeKodu === kod);
    setSubeKodu(kod);
    setKasaKodu(sube?.kasalar[0]?.kasaKodu ?? '');
  }

  async function formGonder(e: FormEvent) {
    e.preventDefault();
    setHata('');
    setGonderiliyor(true);
    try {
      await girisYap({ kullaniciKodu, sifre, firmaKodu, donemKodu, subeKodu, kasaKodu });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Giris basarisiz');
    } finally {
      setGonderiliyor(false);
    }
  }

  const inputSinif =
    'ap-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500';
  const etiketSinif = 'ap-muted mb-1 block text-xs font-medium uppercase tracking-wide';

  return (
    <div className="admin-panel erp-giris relative min-h-screen" data-tema={tema}>
      <button
        type="button"
        onClick={temaDegistir}
        className="absolute right-4 top-4 z-10 rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm hover:bg-[var(--ap-hover)]"
        title={koyuMu ? 'Gunduz moduna gec' : 'Gece moduna gec'}
      >
        {koyuMu ? '☀️ Gunduz' : '🌙 Gece'}
      </button>

      <div className="erp-giris-kapsayici mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <aside className="erp-giris-sol flex flex-1 flex-col justify-between p-10 lg:min-h-screen lg:p-12">
          <div>
            <div className="erp-giris-logo mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold text-white backdrop-blur">
              GT
            </div>
            <h1 className="text-3xl font-bold text-white lg:text-4xl">Guzel Teknoloji</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/90">
              Kurumsal kaynak planlama ve yonetim paneli. Firma, donem, sube ve kasa secimi ile guvenli
              oturum acin.
            </p>
          </div>
          <div className="mt-10 hidden text-sm text-blue-100/70 lg:block">
            <p>{UYGULAMA_ADI} Yonetim Paneli</p>
            <p className="mt-1">www.guzelteknoloji.com</p>
          </div>
        </aside>

        <section className="erp-giris-sag flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="ap-card w-full max-w-lg rounded-2xl border p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="ap-heading text-xl font-bold">Oturum Bilgileri</h2>
              <p className="ap-muted mt-1 text-sm">
                {BACKEND_YOK ? 'Gelistirme modu (offline)' : 'ERP yonetim paneline giris'}
              </p>
            </div>

            {yukleniyor ? (
              <p className="ap-muted text-sm">Oturum secenekleri yukleniyor...</p>
            ) : (
              <form onSubmit={formGonder} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={etiketSinif}>Kullanici Kodu</label>
                    <input
                      type="text"
                      value={kullaniciKodu}
                      onChange={(e) => setKullaniciKodu(e.target.value.toUpperCase())}
                      required
                      className={inputSinif}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={etiketSinif}>Sifre</label>
                    <input
                      type="password"
                      value={sifre}
                      onChange={(e) => setSifre(e.target.value)}
                      required
                      className={inputSinif}
                    />
                  </div>
                </div>

                <div className="my-4 border-t border-[var(--ap-border)] pt-4">
                  <p className="ap-muted mb-3 text-xs font-semibold uppercase tracking-wide">Oturum Secimi</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={etiketSinif}>Firma Kodu</label>
                      <select
                        value={firmaKodu}
                        onChange={(e) => firmaDegistir(e.target.value)}
                        required
                        className={inputSinif}
                      >
                        {firmalar.map((f) => (
                          <option key={f.id} value={f.firmaKodu}>
                            {f.firmaKodu}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={etiketSinif}>Firma Adi</label>
                      <input
                        type="text"
                        readOnly
                        value={seciliFirma?.firmaAdi ?? ''}
                        className={`${inputSinif} opacity-80`}
                      />
                    </div>
                    <div>
                      <label className={etiketSinif}>Donem</label>
                      <select
                        value={donemKodu}
                        onChange={(e) => setDonemKodu(e.target.value)}
                        required
                        className={inputSinif}
                      >
                        {donemler.map((d) => (
                          <option key={d.id} value={d.donemKodu}>
                            {d.donemAdi}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={etiketSinif}>Sube</label>
                      <select
                        value={subeKodu}
                        onChange={(e) => subeDegistir(e.target.value)}
                        required
                        className={inputSinif}
                      >
                        {subeler.map((s) => (
                          <option key={s.id} value={s.subeKodu}>
                            {s.subeAdi}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={etiketSinif}>Kasa</label>
                      <select
                        value={kasaKodu}
                        onChange={(e) => setKasaKodu(e.target.value)}
                        required
                        className={inputSinif}
                      >
                        {kasalar.map((k) => (
                          <option key={k.id} value={k.kasaKodu}>
                            {k.kasaAdi}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {hata && <p className="text-sm text-red-400">{hata}</p>}

                <button
                  type="submit"
                  disabled={gonderiliyor || !firmalar.length}
                  className="mt-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {gonderiliyor ? 'Giris yapiliyor...' : 'Giris Yap'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
