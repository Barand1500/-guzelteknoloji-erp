import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { rolEtiketi } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { FormAlani, formInputSinifi } from '@/formlar/FormAlani';

interface AdminProfilModalProps {
  acik: boolean;
  onKapat: () => void;
}

export function AdminProfilModal({ acik, onKapat }: AdminProfilModalProps) {
  const { kullanici, profilKaydet, cikisYap } = useAuth();
  const [ad, setAd] = useState('');
  const [email, setEmail] = useState('');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');

  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    if (!acik || !kullanici) return;
    setAd(kullanici.ad);
    setEmail(kullanici.email ?? '');
    setMevcutSifre('');
    setYeniSifre('');
    setHata('');
    setBasari('');
  }, [acik, kullanici]);

  useEffect(() => {
    if (!acik) return;

    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
      }
    }

    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, kapat]);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setBasari('');
    setKaydediliyor(true);
    try {
      await profilKaydet({
        ad,
        email,
        mevcutSifre: mevcutSifre || undefined,
        yeniSifre: yeniSifre || undefined,
      });
      setMevcutSifre('');
      setYeniSifre('');
      setBasari('Profil güncellendi.');
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }

  if (!acik || !kullanici) return null;

  const basHarf = kullanici.ad.charAt(0).toUpperCase();

  return (
    <div className="ap-admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="profil-modal-baslik">
      <div className="ap-admin-modal-backdrop" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--profil">
        <div className="ap-admin-modal">
        <header className="ap-admin-modal-header">
          <div className="flex items-center gap-3">
            <span className="ap-admin-modal-avatar">{basHarf}</span>
            <div>
              <h2 id="profil-modal-baslik" className="ap-admin-modal-baslik">
                Profil Ayarları
              </h2>
              <p className="ap-admin-modal-alt">{rolEtiketi(kullanici.rol)}</p>
            </div>
          </div>
          <button type="button" className="ap-admin-modal-kapat" onClick={kapat}>
            ✕ ESC
          </button>
        </header>

        <form id="admin-profil-form" onSubmit={(e) => void kaydet(e)} className="ap-scroll ap-admin-modal-icerik">
          {hata && <p className="ap-admin-modal-hata">{hata}</p>}
          {basari && <p className="ap-admin-modal-basari">{basari}</p>}

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

          <FormAlani etiket="E-Posta">
            <input
              type="email"
              className={formInputSinifi}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormAlani>

          <div className="ap-admin-modal-bolum">
            <p className="ap-admin-modal-bolum-baslik">Şifre Değiştir</p>
            <p className="ap-muted mb-3 text-xs">Boş bırakırsanız mevcut şifreniz korunur.</p>
            <div className="space-y-3">
              <FormAlani etiket="Mevcut Şifre">
                <input
                  type="password"
                  className={formInputSinifi}
                  value={mevcutSifre}
                  onChange={(e) => setMevcutSifre(e.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                />
              </FormAlani>
              <FormAlani etiket="Yeni Şifre">
                <input
                  type="password"
                  className={formInputSinifi}
                  value={yeniSifre}
                  onChange={(e) => setYeniSifre(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                />
              </FormAlani>
            </div>
          </div>
        </form>

        <footer className="ap-admin-modal-footer">
          <button
            type="button"
            className="ap-admin-modal-cikis"
            onClick={() => {
              cikisYap();
              kapat();
            }}
          >
            Çıkış Yap
          </button>
          <div className="flex gap-2">
            <button type="button" className="ap-admin-modal-iptal" onClick={kapat}>
              İptal
            </button>
            <button
              type="submit"
              form="admin-profil-form"
              className="ap-admin-modal-kaydet"
              disabled={kaydediliyor}
            >
              {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </footer>
        </div>
      </DonenAccentCerceve>
    </div>
  );
}
