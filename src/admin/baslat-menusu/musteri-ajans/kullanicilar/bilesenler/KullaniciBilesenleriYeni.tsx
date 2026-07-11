import type { AdminKullanici, KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import type { AtanabilirRol } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleri';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

function basHarf(ad: string, email: string): string {
  const kaynak = ad.trim() || email.trim();
  return (kaynak[0] ?? '?').toUpperCase();
}

interface KullaniciListesiYeniProps {
  kullanicilar: AdminKullanici[];
  seciliId: string | null;
  rolBasliklari: Record<string, string>;
  onSec: (k: AdminKullanici) => void;
}

export function KullaniciListesiYeni({
  kullanicilar,
  seciliId,
  rolBasliklari,
  onSec,
}: KullaniciListesiYeniProps) {
  if (kullanicilar.length === 0) {
    return (
      <div className="ap-kullanici-yeni-bos">
        <span aria-hidden>👤</span>
        <p>Henüz kullanıcı yok</p>
        <small>Ekle ile yeni kullanıcı oluşturun</small>
      </div>
    );
  }

  return (
    <ul className="ap-kullanici-yeni-liste" aria-label="Kullanıcılar">
      {kullanicilar.map((k) => {
        const secili = seciliId === k.id;
        return (
          <li key={k.id}>
            <button
              type="button"
              className={`ap-kullanici-yeni-kart${secili ? ' ap-kullanici-yeni-kart--secili' : ''}${!k.aktif ? ' ap-kullanici-yeni-kart--pasif' : ''}`}
              onClick={() => onSec(k)}
            >
              <span className="ap-kullanici-yeni-avatar" aria-hidden>
                {basHarf(k.ad, k.email)}
              </span>
              <span className="ap-kullanici-yeni-ad">{k.ad}</span>
              <span className="ap-kullanici-yeni-email">{k.email}</span>
              <span className="ap-kullanici-yeni-kart-alt">
                <span className="ap-kullanici-yeni-rol">{rolBasliklari[k.rol] ?? k.rol}</span>
                {!k.aktif && <span className="ap-kullanici-yeni-durum">Pasif</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface KullaniciDuzenleFormuYeniProps {
  form: KullaniciFormDegeri;
  seciliId: string | null;
  atanabilirRoller: AtanabilirRol[];
  onSifreDegisti: (v: boolean) => void;
  onChange: (form: KullaniciFormDegeri) => void;
}

export function KullaniciDuzenleFormuYeni({
  form,
  seciliId,
  atanabilirRoller,
  onSifreDegisti,
  onChange,
}: KullaniciDuzenleFormuYeniProps) {
  return (
    <div className="ap-kullanici-yeni-form">
      <label className="ap-kullanici-yeni-alan">
        <span className="ap-kullanici-yeni-etiket">Ad Soyad</span>
        <input
          className="ap-kullanici-yeni-input"
          placeholder="Ad Soyad"
          value={form.ad}
          onChange={(e) => onChange({ ...form, ad: e.target.value })}
          required
          autoComplete="name"
        />
      </label>
      <label className="ap-kullanici-yeni-alan">
        <span className="ap-kullanici-yeni-etiket">E-Posta</span>
        <input
          className="ap-kullanici-yeni-input"
          type="email"
          placeholder="ornek@sirket.com"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />
      </label>
      <label className="ap-kullanici-yeni-alan">
        <span className="ap-kullanici-yeni-etiket">
          {seciliId ? 'Yeni şifre' : 'Şifre'}
        </span>
        <input
          className="ap-kullanici-yeni-input"
          type="password"
          placeholder={seciliId ? 'Boş bırak = değişmez' : 'En az 6 karakter'}
          value={form.sifre}
          onChange={(e) => {
            onChange({ ...form, sifre: e.target.value });
            onSifreDegisti(true);
          }}
          required={!seciliId}
          minLength={seciliId ? undefined : 6}
          autoComplete="new-password"
        />
      </label>
      <label className="ap-kullanici-yeni-alan">
        <span className="ap-kullanici-yeni-etiket">Rol</span>
        <FormAcilirSecim
          aria-label="Kullanıcı rolü"
          value={form.rol}
          onChange={(rol) => onChange({ ...form, rol })}
          secenekler={atanabilirRoller.map((r) => ({ value: r.kod, label: r.baslik }))}
        />
      </label>
      <div className="ap-kullanici-yeni-toggle">
        <div>
          <p className="ap-kullanici-yeni-etiket">Aktif kullanıcı</p>
          <p className="ap-kullanici-yeni-aciklama">Pasif kullanıcılar panele giriş yapamaz</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.aktif}
          className={`ap-toggle ${form.aktif ? 'ap-toggle-on' : ''}`}
          aria-label={`Aktif kullanıcı: ${form.aktif ? 'Açık' : 'Kapalı'}`}
          onClick={() => onChange({ ...form, aktif: !form.aktif })}
        >
          <span className="ap-toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
