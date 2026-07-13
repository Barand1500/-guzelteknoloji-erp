import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { oturumSecenekleriGetir } from '@/admin/ortak/api/authApi';
import type { OturumFirma } from '@/admin/ortak/tipler/admin';
import { GirisButon } from '@/admin/giris/GirisButon';
import { DonenMaviCerceve } from '@/admin/giris/DonenMaviCerceve';
import { GirisIletisimKart } from '@/admin/giris/GirisIletisimKart';
import { GirisErpLogo } from '@/admin/giris/GirisErpLogo';
import { GIRIS_ILETISIM, GIRIS_SITE_URL } from '@/admin/giris/girisYapilandirma';
import { GirisYukleniyor } from '@/admin/giris/GirisYukleniyor';
import '@/stiller/adminTema.css';

const SOSYAL_MEDYA = GIRIS_ILETISIM;

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
    <DonenMaviCerceve className={`erp-giris-kart-donen w-full max-w-md ${className}`}>
      <div className="erp-giris-kart ap-card w-full rounded-2xl border-0 p-6 shadow-xl sm:p-8">{children}</div>
    </DonenMaviCerceve>
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
  metinUzunluk = 34,
}: {
  value: string;
  onChange: (value: string) => void;
  secenekler: GirisComboSecenek[];
  sinif: string;
  placeholder?: string;
  metinUzunluk?: number;
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
        <span className="block truncate pr-1">
          {secili ? kisaltMetin(secili.label, metinUzunluk) : placeholder}
        </span>
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
                  <span className="block truncate">{kisaltMetin(secenek.label, metinUzunluk)}</span>
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
  const [kullaniciKodlari, setKullaniciKodlari] = useState<string[]>(['ADMIN']);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gelismisAcik, setGelismisAcik] = useState(false);
  const [kullaniciKodu, setKullaniciKodu] = useState('ADMIN');
  const [sifre, setSifre] = useState('');
  const [sifreGorunur, setSifreGorunur] = useState(false);
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
        if (veri.kullaniciKodlari?.length) {
          setKullaniciKodlari(veri.kullaniciKodlari);
          if (!veri.kullaniciKodlari.includes(kullaniciKodu)) {
            setKullaniciKodu(veri.kullaniciKodlari[0]);
          }
        }
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
    'ap-input erp-giris-input erp-giris-select w-full min-w-0 max-w-full rounded-lg px-3 py-2 text-sm outline-none';
  const etiketSinif = 'ap-muted mb-1 block text-xs font-medium uppercase tracking-wide';

  return (
    <div className="admin-panel erp-giris" data-tema="acik">
      <div className="erp-giris-kapsayici">
        <aside className="erp-giris-sol relative flex w-full flex-col self-stretch overflow-hidden">
          <div className="erp-giris-sol-sahne" aria-hidden>
            <span className="erp-giris-orb erp-giris-orb-1" />
            <span className="erp-giris-orb erp-giris-orb-2" />
            <span className="erp-giris-orb erp-giris-orb-3" />
            <span className="erp-giris-sol-izgara" />
            <span className="erp-giris-sol-parilti" />
          </div>

          <div className="erp-giris-sol-icerik relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="erp-giris-sol-ust flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:px-8 xl:p-10">
              <div className="erp-giris-sol-marka">
                <GirisErpLogo />
              </div>
              <DonenMaviCerceve className="erp-giris-site-donen">
                <a
                  href={GIRIS_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="erp-giris-sol-site-link"
                >
                  <span className="erp-giris-sol-site-ikon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.18a15.6 15.6 0 0 0-1.12-4.36A8.02 8.02 0 0 1 19.93 11ZM12 4c.95 1.57 1.66 3.58 1.93 7H10.07c.27-3.42.98-5.43 1.93-7ZM8.37 6.64A15.6 15.6 0 0 0 7.25 11H4.07a8.02 8.02 0 0 1 4.3-4.36ZM4.07 13h3.18c.28 1.6.8 3.12 1.5 4.36A8.02 8.02 0 0 1 4.07 13Zm7.93 7c-.95-1.57-1.66-3.58-1.93-7h3.86c-.27 3.42-.98 5.43-1.93 7Zm3.56-1.64c.7-1.24 1.22-2.76 1.5-4.36h3.18a8.02 8.02 0 0 1-4.68 4.36ZM16.75 13a15.6 15.6 0 0 0 1.12-4.36h3.18a8.02 8.02 0 0 1-4.3 4.36Z" />
                    </svg>
                  </span>
                  www.guzelteknoloji.com
                </a>
              </DonenMaviCerceve>
            </div>

            <aside className="erp-giris-iletisim-sutun">
              {SOSYAL_MEDYA.map((kanal) => (
                <GirisIletisimKart
                  key={kanal.id}
                  id={kanal.id}
                  baslik={kanal.baslik}
                  alt={kanal.alt}
                  href={kanal.href}
                  yeniSekme={kanal.yeniSekme}
                  genis={'genis' in kanal ? kanal.genis : false}
                />
              ))}
            </aside>
          </div>
        </aside>

        <div className="erp-giris-icerik flex min-h-0 flex-1 flex-col">
          <div className="erp-giris-form-alani flex min-h-0 flex-1 justify-start px-4 py-8 sm:px-6 sm:py-10 xl:justify-center">
            <GirisKarti>
              <div className="mb-6">
                <h2 className="ap-heading text-xl font-bold">Oturum Bilgileri</h2>
                <p className="ap-muted mt-1 text-sm">ERP Yönetim paneline giriş</p>
              </div>

              {yukleniyor ? (
                <GirisYukleniyor />
              ) : (
                <form onSubmit={formGonder} className="space-y-3">
                  <div>
                    <label className={etiketSinif}>Kullanıcı</label>
                    <GirisCombo
                      value={kullaniciKodu}
                      onChange={setKullaniciKodu}
                      sinif={inputSinif}
                      secenekler={kullaniciKodlari.map((kod) => ({
                        value: kod,
                        label: kod,
                      }))}
                    />
                  </div>
                  <div>
                    <label className={etiketSinif}>Şifre</label>
                    <div className="erp-giris-sifre-alani">
                      <input
                        type={sifreGorunur ? 'text' : 'password'}
                        value={sifre}
                        onChange={(e) => setSifre(e.target.value)}
                        required
                        autoComplete="current-password"
                        className={`${inputSinif} erp-giris-sifre-input`}
                      />
                      <button
                        type="button"
                        className="erp-giris-sifre-goster"
                        onClick={() => setSifreGorunur((gorunur) => !gorunur)}
                        aria-label={sifreGorunur ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        aria-pressed={sifreGorunur}
                        title={sifreGorunur ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        {sifreGorunur ? (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4.2 9.5 6.2a4 4 0 0 1 0 3.6c-.4.8-1 1.7-1.8 2.6M6.2 6.3a16.8 16.8 0 0 0-3.7 3.9 4 4 0 0 0 0 3.6C3.5 15.8 7 20 12 20c1.3 0 2.5-.3 3.6-.7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M2.5 10.2a4 4 0 0 0 0 3.6C3.5 15.8 7 20 12 20s8.5-4.2 9.5-6.2a4 4 0 0 0 0-3.6C20.5 8.2 17 4 12 4s-8.5 4.2-9.5 6.2Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="erp-giris-oturum-ozet ap-input flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                    <span className="erp-giris-oturum-yildiz shrink-0 text-base leading-none" aria-hidden>
                      ★
                    </span>
                    <span className="truncate font-medium text-[var(--ap-heading)]" title={oturumOzeti}>
                      {oturumOzeti}
                    </span>
                  </div>

                  {gelismisAcik && (
                    <div className="erp-giris-gelismis my-4 border-t border-[var(--ap-border)] pt-4">
                      <div className="erp-giris-secim-grid grid gap-3">
                        <div className="col-span-2 min-w-0">
                          <label className={etiketSinif}>Firma Adı</label>
                          <GirisCombo
                            value={firmaKodu}
                            onChange={firmaDegistir}
                            sinif={inputSinif}
                            metinUzunluk={52}
                            secenekler={firmalar.map((f) => ({
                              value: f.firmaKodu,
                              label: f.firmaAdi,
                            }))}
                          />
                        </div>
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
                        <div className="min-w-0">
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
                    <GirisButon
                      type="submit"
                      varyant="birincil"
                      yukleniyor={gonderiliyor}
                      disabled={!firmalar.length}
                      className="flex-1"
                    >
                      {gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </GirisButon>
                    <GirisButon
                      type="button"
                      varyant="ikincil"
                      className={`flex-1${gelismisAcik ? ' erp-giris-btn-ikincil-acik' : ''}`}
                      onClick={() => setGelismisAcik((acik) => !acik)}
                    >
                      Gelişmiş
                    </GirisButon>
                  </div>
                </form>
              )}
            </GirisKarti>
          </div>
        </div>
      </div>
    </div>
  );
}
