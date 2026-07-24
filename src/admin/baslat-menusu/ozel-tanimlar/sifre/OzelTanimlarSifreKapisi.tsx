import { useId, useState, type FormEvent } from 'react';

interface OzelTanimlarSifreKapisiProps {
  onGiris: () => void;
}

export function OzelTanimlarSifreKapisi({ onGiris }: OzelTanimlarSifreKapisiProps) {
  const inputId = useId();
  const [sifre, setSifre] = useState('');
  const [goster, setGoster] = useState(false);
  const [odak, setOdak] = useState(false);

  function gonder(e: FormEvent) {
    e.preventDefault();
    // Şimdilik her giriş kabul edilir
    void sifre;
    onGiris();
  }

  return (
    <div className="ot-sifre-arka">
      <div className="ot-sifre-halo" aria-hidden />
      <form className="ot-sifre-kart" onSubmit={gonder}>
        <div className="ot-sifre-ust-cizgi" aria-hidden />

        <div className="ot-sifre-ikon" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="5" y="11" width="14" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <div className="ot-sifre-metin">
          <h2 className="ot-sifre-baslik">Özel Tanımlar</h2>
          <p className="ot-sifre-alt">Bu alana erişmek için şifrenizi girin.</p>
        </div>

        <div className={`ot-sifre-alan${odak || sifre ? ' ot-sifre-alan-aktif' : ''}`}>
          <label htmlFor={inputId} className="ot-sifre-etiket">
            Şifre
          </label>
          <div className="ot-sifre-input-wrap">
            <input
              id={inputId}
              type={goster ? 'text' : 'password'}
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              onFocus={() => setOdak(true)}
              onBlur={() => setOdak(false)}
              className="ot-sifre-input"
              placeholder="Şifrenizi yazın"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ot-sifre-goz"
              onClick={() => setGoster((v) => !v)}
              aria-label={goster ? 'Şifreyi gizle' : 'Şifreyi göster'}
              tabIndex={-1}
            >
              {goster ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                  <path
                    d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9.8 7-.3.9-1.1 2.2-2.4 3.5M6.1 6.1C4.3 7.5 3.2 9.2 2.2 12c.8 2.5 4.8 7 9.8 7 1.4 0 2.7-.3 3.9-.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M2.2 12C3 9.5 7 5 12 5s9 4.5 9.8 7c-.8 2.5-4.8 7-9.8 7s-9-4.5-9.8-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="ot-sifre-giris">
          <span>Giriş</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h12M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
