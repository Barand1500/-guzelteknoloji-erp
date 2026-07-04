import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { oturumSecenekleriGetir } from '@/admin/ortak/api/authApi';
import type { OturumFirma } from '@/admin/ortak/tipler/admin';
import { UYGULAMA_ADI } from '@/yapilandirma/uygulama';
import '@/stiller/adminTema.css';

const SOSYAL_MEDYA = [
  {
    id: 'web',
    etiket: 'Web Sitesi',
    url: 'https://www.guzelteknoloji.com',
    ikon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.18a15.6 15.6 0 0 0-1.12-4.36A8.02 8.02 0 0 1 19.93 11ZM12 4c.95 1.57 1.66 3.58 1.93 7H10.07c.27-3.42.98-5.43 1.93-7ZM8.37 6.64A15.6 15.6 0 0 0 7.25 11H4.07a8.02 8.02 0 0 1 4.3-4.36ZM4.07 13h3.18c.28 1.6.8 3.12 1.5 4.36A8.02 8.02 0 0 1 4.07 13Zm7.93 7c-.95-1.57-1.66-3.58-1.93-7h3.86c-.27 3.42-.98 5.43-1.93 7Zm3.56-1.64c.7-1.24 1.22-2.76 1.5-4.36h3.18a8.02 8.02 0 0 1-4.68 4.36ZM16.75 13a15.6 15.6 0 0 0 1.12-4.36h3.18a8.02 8.02 0 0 1-4.3 4.36Z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    etiket: 'LinkedIn',
    url: 'https://www.linkedin.com/company/guzelteknoloji',
    ikon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    etiket: 'Facebook',
    url: 'https://www.facebook.com/guzelteknoloji',
    ikon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.92v-8.43H7.08v-3.49h3.05V9.41c0-3.01 1.79-4.68 4.53-4.68 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.49h-2.79v8.43C19.61 23.08 24 18.09 24 12.07Z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    etiket: 'Instagram',
    url: 'https://www.instagram.com/guzelteknoloji',
    ikon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.73 3.73 0 0 1-.9 1.38 3.73 3.73 0 0 1-1.38.9c-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.73 3.73 0 0 1-1.38-.9 3.73 3.73 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.64a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .64 4.14C.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.57 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.51 2.91.57 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.57a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.51-1.64.57-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.57-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.64c-.76-.3-1.64-.51-2.91-.57C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-11.85a1.44 1.44 0 1 0-1.44 1.44 1.44 1.44 0 0 0 1.44-1.44Z" />
      </svg>
    ),
  },
] as const;

function kisaltMetin(metin: string, uzunluk = 34) {
  if (metin.length <= uzunluk) return metin;
  return `${metin.slice(0, uzunluk).trimEnd()}…`;
}

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

function GirisKarti({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`erp-giris-kart ap-card w-full rounded-2xl border p-8 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

interface GirisComboSecenek {
  value: string;
  label: string;
}

function GirisCombo({
  value,
  onChange,
  secenekler,
  sinif,
  placeholder = 'Seçiniz',
}: {
  value: string;
  onChange: (value: string) => void;
  secenekler: GirisComboSecenek[];
  sinif: string;
  placeholder?: string;
}) {
  const [acik, setAcik] = useState(false);
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const secili = secenekler.find((s) => s.value === value);

  useEffect(() => {
    if (!acik) return;

    function disariTikla(event: MouseEvent) {
      if (!kapsayiciRef.current?.contains(event.target as Node)) {
        setAcik(false);
      }
    }

    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [acik]);

  return (
    <div
      ref={kapsayiciRef}
      className={`erp-giris-combo relative min-w-0${acik ? ' erp-giris-combo-acik' : ''}`}
    >
      <button
        type="button"
        onClick={() => setAcik((onceki) => !onceki)}
        title={secili?.label ?? placeholder}
        aria-expanded={acik}
        aria-haspopup="listbox"
        className={`${sinif} erp-giris-combo-tetik text-left`}
      >
        <span className="block truncate pr-1">{secili ? kisaltMetin(secili.label) : placeholder}</span>
      </button>

      {acik && (
        <ul className="erp-giris-combo-panel" role="listbox">
          {secenekler.map((secenek) => {
            const secildi = secenek.value === value;
            return (
              <li key={secenek.value} role="option" aria-selected={secildi}>
                <button
                  type="button"
                  title={secenek.label}
                  onClick={() => {
                    onChange(secenek.value);
                    setAcik(false);
                  }}
                  className={`erp-giris-combo-oge ${secildi ? 'erp-giris-combo-oge-secili' : ''}`}
                >
                  <span className="block truncate">{kisaltMetin(secenek.label)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function GirisSayfasi() {
  const { girisYap } = useAuth();
  const [firmalar, setFirmalar] = useState<OturumFirma[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gelismisAcik, setGelismisAcik] = useState(false);
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
        setHata(err instanceof Error ? err.message : 'Oturum seçenekleri yüklenemedi');
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

  const oturumOzeti = useMemo(() => {
    const firmaAd = seciliFirma?.firmaAdi?.trim() ?? '';
    const firmaKisa = (firmaAd.split(/\s+/)[0] || firmaKodu || '—').toUpperCase();
    const donem =
      donemler.find((d) => d.donemKodu === donemKodu)?.donemAdi ?? (donemKodu || '—');
    return `${firmaKisa} - ${donem}`;
  }, [seciliFirma, firmaKodu, donemKodu, donemler]);

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
      setHata(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setGonderiliyor(false);
    }
  }

  const inputSinif =
    'ap-input erp-giris-select w-full min-w-0 max-w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500';
  const etiketSinif = 'ap-muted mb-1 block text-xs font-medium uppercase tracking-wide';

  return (
    <div className="admin-panel erp-giris min-h-screen" data-tema="acik">
      <div className="erp-giris-kapsayici flex min-h-screen w-full">
        <aside className="erp-giris-sol flex flex-col justify-between p-8 xl:min-h-screen xl:w-[26%] xl:min-w-[260px] xl:max-w-[360px] xl:p-10">
          <div>
            <div className="erp-giris-logo mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold text-white backdrop-blur">
              GT
            </div>
            <h1 className="text-3xl font-bold text-white xl:text-4xl">Güzel Teknoloji</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/90">
              Kurumsal kaynak planlama ve yönetim paneli. Firma, dönem, şube ve kasa seçimi ile güvenli
              oturum açın.
            </p>
          </div>
          <div className="mt-8 text-sm text-blue-100/70 xl:mt-0">
            <p>{UYGULAMA_ADI} Yönetim Paneli</p>
            <p className="mt-1">www.guzelteknoloji.com</p>
          </div>
        </aside>

        <div className="erp-giris-icerik flex min-h-screen flex-1">
          <div className="flex flex-1 items-center justify-center p-6 xl:p-10">
            <GirisKarti>
              <div className="mb-6">
                <h2 className="ap-heading text-xl font-bold">Oturum Bilgileri</h2>
                <p className="ap-muted mt-1 text-sm">ERP yönetim paneline giriş</p>
              </div>

              {yukleniyor ? (
                <p className="ap-muted text-sm">Oturum seçenekleri yükleniyor...</p>
              ) : (
                <form onSubmit={formGonder} className="space-y-3">
                  <div>
                    <label className={etiketSinif}>Kullanıcı Kodu</label>
                    <input
                      type="text"
                      value={kullaniciKodu}
                      onChange={(e) => setKullaniciKodu(e.target.value.toUpperCase())}
                      required
                      className={inputSinif}
                    />
                  </div>
                  <div>
                    <label className={etiketSinif}>Şifre</label>
                    <input
                      type="password"
                      value={sifre}
                      onChange={(e) => setSifre(e.target.value)}
                      required
                      className={inputSinif}
                    />
                  </div>

                  <div className="erp-giris-oturum-ozet ap-input flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                    <span className="erp-giris-oturum-yildiz shrink-0 text-base leading-none" aria-hidden>
                      ★
                    </span>
                    <span className="truncate font-medium text-[var(--ap-heading)]" title={oturumOzeti}>
                      {oturumOzeti}
                    </span>
                  </div>

                  {gelismisAcik && (
                    <div className="erp-giris-gelismis my-4 border-t border-[var(--ap-border)] pt-4">
                      <p className="ap-muted mb-3 text-xs font-semibold uppercase tracking-wide">
                        Oturum Seçimi
                      </p>
                      <div className="erp-giris-secim-grid grid gap-3 sm:grid-cols-2">
                        <div className="min-w-0">
                          <label className={etiketSinif}>Firma Kodu</label>
                          <GirisCombo
                            value={firmaKodu}
                            onChange={firmaDegistir}
                            sinif={inputSinif}
                            secenekler={firmalar.map((f) => ({
                              value: f.firmaKodu,
                              label: f.firmaKodu,
                            }))}
                          />
                        </div>
                        <div className="min-w-0">
                          <label className={etiketSinif}>Firma Adı</label>
                          <GirisCombo
                            value={firmaKodu}
                            onChange={firmaDegistir}
                            sinif={inputSinif}
                            secenekler={firmalar.map((f) => ({
                              value: f.firmaKodu,
                              label: f.firmaAdi,
                            }))}
                          />
                        </div>
                        <div className="min-w-0">
                          <label className={etiketSinif}>Dönem</label>
                          <GirisCombo
                            value={donemKodu}
                            onChange={setDonemKodu}
                            sinif={inputSinif}
                            secenekler={donemler.map((d) => ({
                              value: d.donemKodu,
                              label: d.donemAdi,
                            }))}
                          />
                        </div>
                        <div className="min-w-0">
                          <label className={etiketSinif}>Şube</label>
                          <GirisCombo
                            value={subeKodu}
                            onChange={subeDegistir}
                            sinif={inputSinif}
                            secenekler={subeler.map((s) => ({
                              value: s.subeKodu,
                              label: s.subeAdi,
                            }))}
                          />
                        </div>
                        <div className="min-w-0 sm:col-span-2">
                          <label className={etiketSinif}>Kasa</label>
                          <GirisCombo
                            value={kasaKodu}
                            onChange={setKasaKodu}
                            sinif={inputSinif}
                            secenekler={kasalar.map((k) => ({
                              value: k.kasaKodu,
                              label: k.kasaAdi,
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {hata && <p className="text-sm text-red-500">{hata}</p>}

                  <div className="erp-giris-aksiyonlar mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={gonderiliyor || !firmalar.length}
                      className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGelismisAcik((acik) => !acik)}
                      className={`flex-1 rounded-lg border py-3 text-sm font-semibold transition ${
                        gelismisAcik
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-[var(--ap-border)] bg-[var(--ap-surface)] text-[var(--ap-heading)] hover:bg-[var(--ap-hover)]'
                      }`}
                    >
                      Gelişmiş
                    </button>
                  </div>

                  <div className="erp-giris-sosyal-mobil mt-6 flex justify-end gap-3 xl:hidden">
                    {SOSYAL_MEDYA.map((kanal) => (
                      <a
                        key={kanal.id}
                        href={kanal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={kanal.etiket}
                        aria-label={kanal.etiket}
                        className="erp-giris-sosyal-ikon flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ap-border)] bg-white text-slate-600 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {kanal.ikon}
                      </a>
                    ))}
                  </div>
                </form>
              )}
            </GirisKarti>
          </div>

          <aside className="erp-giris-sosyal-sutun hidden shrink-0 flex-col items-center justify-center gap-4 pr-6 xl:flex">
            {SOSYAL_MEDYA.map((kanal) => (
              <a
                key={kanal.id}
                href={kanal.url}
                target="_blank"
                rel="noopener noreferrer"
                title={kanal.etiket}
                aria-label={kanal.etiket}
                className="erp-giris-sosyal-ikon flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--ap-border)] bg-white text-slate-600 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
              >
                {kanal.ikon}
              </a>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
