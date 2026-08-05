import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { SistemModal } from '@/admin/ortak/SistemModal';
import { FormAlani, formInputSinifi } from '@/formlar/FormAlani';

interface AdminProfilModalProps {
  acik: boolean;
  onKapat: () => void;
}

type ProfilSekme = 'bilgilerim' | 'sifre';

function ProfilFlatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 18.25c1.35-2.6 3.55-3.9 6.5-3.9s5.15 1.3 6.5 3.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BilgiFlatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function AnahtarFlatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <circle cx="8" cy="14" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M11 14h9v-2.5h-2V9h-2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KaydetFlatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M5 5.5A1.5 1.5 0 0 1 6.5 4H16l3 3v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M8 4.5V9h7V4.5M8 19v-5h8v5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function GonderFlatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path d="M4 6.5 20 12 4 17.5 6.5 12 4 6.5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M6.5 12H14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function GozFlatIkon({ acik }: { acik: boolean }) {
  if (acik) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path
          d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9.8 7-.3.9-1.1 2.2-2.4 3.5M6.1 6.1C4.3 7.5 3.2 9.2 2.2 12c.8 2.5 4.8 7 9.8 7 1.4 0 2.7-.3 3.9-.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path d="M2.2 12C3 9.5 7 5 12 5s9 4.5 9.8 7c-.8 2.5-4.8 7-9.8 7s-9-4.5-9.8-7z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function SifreAlani({
  etiket,
  deger,
  onChange,
  autoComplete,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [goster, setGoster] = useState(false);
  return (
    <FormAlani etiket={etiket}>
      <div className="ap-profil-sifre-wrap">
        <input
          type={goster ? 'text' : 'password'}
          className={`${formInputSinifi} ap-profil-sifre-input`}
          value={deger}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={6}
        />
        <button
          type="button"
          className="ap-profil-sifre-goz"
          onClick={() => setGoster((v) => !v)}
          aria-label={goster ? 'Şifreyi gizle' : 'Şifreyi göster'}
          tabIndex={-1}
        >
          <GozFlatIkon acik={goster} />
        </button>
      </div>
    </FormAlani>
  );
}

export function AdminProfilModal({ acik, onKapat }: AdminProfilModalProps) {
  const { kullanici, profilKaydet } = useAuth();
  const baslikId = useId();
  const [sekme, setSekme] = useState<ProfilSekme>('bilgilerim');
  const [ad, setAd] = useState('');
  const [eposta, setEposta] = useState('');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [sifirlaEposta, setSifirlaEposta] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');

  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    if (!acik || !kullanici) return;
    setSekme('bilgilerim');
    setAd(kullanici.ad);
    setEposta(kullanici.email ?? '');
    setMevcutSifre('');
    setYeniSifre('');
    setYeniSifreTekrar('');
    setSifirlaEposta(kullanici.email ?? '');
    setHata('');
    setBasari('');
  }, [acik, kullanici]);

  async function bilgiKaydet(e: FormEvent) {
    e.preventDefault();
    if (!kullanici || kaydediliyor) return;
    setHata('');
    setBasari('');
    setKaydediliyor(true);
    try {
      await profilKaydet({
        ad,
        email: eposta.trim() || undefined,
      });
      setBasari('Bilgileriniz güncellendi.');
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }

  async function sifreDegistir(e: FormEvent) {
    e.preventDefault();
    if (!kullanici || kaydediliyor) return;
    setHata('');
    setBasari('');
    if (!mevcutSifre.trim() || !yeniSifre.trim()) {
      setHata('Mevcut ve yeni şifre gerekli.');
      return;
    }
    if (yeniSifre.trim().length < 6) {
      setHata('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setHata('Yeni şifreler eşleşmiyor.');
      return;
    }
    setKaydediliyor(true);
    try {
      await profilKaydet({
        ad: kullanici.ad,
        mevcutSifre,
        yeniSifre,
      });
      setMevcutSifre('');
      setYeniSifre('');
      setYeniSifreTekrar('');
      setBasari('Şifreniz güncellendi.');
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Şifre güncellenemedi');
    } finally {
      setKaydediliyor(false);
    }
  }

  function kodGonder() {
    setHata('');
    setBasari('');
    if (!sifirlaEposta.trim()) {
      setHata('Kod göndermek için e-posta gerekli.');
      return;
    }
    setBasari(`Sıfırlama kodu ${sifirlaEposta.trim()} adresine gönderildi.`);
  }

  if (!kullanici) return null;

  const kullaniciAdi = kullanici.kullaniciKodu ?? 'kullanici';

  return (
    <SistemModal
      acik={acik}
      onKapat={kapat}
      baslik="Profilim"
      altBaslik={`@${kullaniciAdi}`}
      baslikId={baslikId}
      ikon={<ProfilFlatIkon />}
      ikonFlat
      genislik="sm"
      kapatEtiket="✕ ESC"
      disariTiklaKapat={false}
      ustCizgi={false}
    >
      <div className="ap-profil-modal">
        <div className="ap-profil-sekmeler" role="tablist" aria-label="Profil sekmeleri">
          <button
            type="button"
            role="tab"
            aria-selected={sekme === 'bilgilerim'}
            className={`ap-profil-sekme${sekme === 'bilgilerim' ? ' ap-profil-sekme--aktif' : ''}`}
            onClick={() => {
              setSekme('bilgilerim');
              setHata('');
              setBasari('');
            }}
          >
            <BilgiFlatIkon />
            Bilgilerim
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sekme === 'sifre'}
            className={`ap-profil-sekme${sekme === 'sifre' ? ' ap-profil-sekme--aktif' : ''}`}
            onClick={() => {
              setSekme('sifre');
              setHata('');
              setBasari('');
            }}
          >
            <AnahtarFlatIkon />
            Şifre
          </button>
        </div>

        {hata ? <p className="ap-admin-modal-hata">{hata}</p> : null}
        {basari ? <p className="ap-admin-modal-basari">{basari}</p> : null}

        {sekme === 'bilgilerim' ? (
          <form className="ap-profil-modal-form" onSubmit={(e) => void bilgiKaydet(e)}>
            <FormAlani etiket="Ad Soyad">
              <input
                className={formInputSinifi}
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </FormAlani>

            <FormAlani etiket="Kullanıcı Adı (değiştirilemez)">
              <input
                className={formInputSinifi}
                value={kullaniciAdi}
                readOnly
                aria-readonly="true"
              />
            </FormAlani>

            <FormAlani etiket="E-posta (isteğe bağlı)">
              <input
                type="email"
                className={formInputSinifi}
                value={eposta}
                onChange={(e) => setEposta(e.target.value)}
                autoComplete="email"
                placeholder="ornek@firma.com"
              />
            </FormAlani>

            <button
              type="submit"
              className="ap-profil-aksiyon-btn ap-profil-aksiyon-btn--birincil"
              disabled={kaydediliyor}
            >
              <KaydetFlatIkon />
              {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        ) : (
          <div className="ap-profil-modal-form">
            <form className="ap-profil-sifre-bolum" onSubmit={(e) => void sifreDegistir(e)}>
              <p className="ap-profil-bolum-baslik">Mevcut Şifre ile Değiştir</p>
              <SifreAlani
                etiket="Mevcut Şifre"
                deger={mevcutSifre}
                onChange={setMevcutSifre}
                autoComplete="current-password"
              />
              <SifreAlani
                etiket="Yeni Şifre"
                deger={yeniSifre}
                onChange={setYeniSifre}
                autoComplete="new-password"
              />
              <SifreAlani
                etiket="Yeni Şifre (Tekrar)"
                deger={yeniSifreTekrar}
                onChange={setYeniSifreTekrar}
                autoComplete="new-password"
              />
              <button
                type="submit"
                className="ap-profil-aksiyon-btn ap-profil-aksiyon-btn--birincil"
                disabled={kaydediliyor}
              >
                <AnahtarFlatIkon />
                {kaydediliyor ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>

            <div className="ap-profil-sifre-bolum ap-profil-sifre-bolum--ayirici">
              <p className="ap-profil-bolum-baslik">E-posta ile Sıfırla</p>
              <FormAlani etiket="E-posta">
                <input
                  type="email"
                  className={formInputSinifi}
                  value={sifirlaEposta}
                  onChange={(e) => setSifirlaEposta(e.target.value)}
                  autoComplete="email"
                />
              </FormAlani>
              <button
                type="button"
                className="ap-profil-aksiyon-btn ap-profil-aksiyon-btn--ikincil"
                onClick={kodGonder}
              >
                <GonderFlatIkon />
                Kod Gönder
              </button>
            </div>
          </div>
        )}
      </div>
    </SistemModal>
  );
}
