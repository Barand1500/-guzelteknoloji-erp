import type { AdminKullanici, KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import type { AtanabilirRol } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleri';
import { KullaniciOturumCubugu } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciOturumCubugu';
import type { KullaniciOturumSecenekleri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/kullaniciOturumYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

function basHarf(ad: string, kullaniciKodu: string): string {
  const kaynak = ad.trim() || kullaniciKodu.trim();
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
                {basHarf(k.ad, k.kullaniciKodu)}
              </span>
              <span className="ap-kullanici-yeni-ad">{k.ad}</span>
              <span className="ap-kullanici-yeni-email">{k.kullaniciKodu}</span>
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
  oturumSecenekleri: KullaniciOturumSecenekleri;
  onSifreDegisti: (v: boolean) => void;
  onChange: (form: KullaniciFormDegeri) => void;
}

export function KullaniciDuzenleFormuYeni({
  form,
  seciliId,
  atanabilirRoller,
  oturumSecenekleri,
  onSifreDegisti,
  onChange,
}: KullaniciDuzenleFormuYeniProps) {
  return (
    <div className="ap-kullanici-yeni-form">
      <div className="ap-kullanici-yeni-form-satir">
        <label className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--ad">
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
        <label className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--kod">
          <span className="ap-kullanici-yeni-etiket">Kullanıcı Kodu</span>
          <input
            className="ap-kullanici-yeni-input"
            placeholder="ADMIN"
            value={form.kullaniciKodu}
            onChange={(e) => onChange({ ...form, kullaniciKodu: e.target.value.toUpperCase() })}
            required
            autoComplete="username"
          />
        </label>
        <label className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--sifre">
          <span className="ap-kullanici-yeni-etiket">
            {seciliId ? 'Yeni şifre' : 'Şifre'}
          </span>
          <input
            className="ap-kullanici-yeni-input"
            type="password"
            placeholder={seciliId ? 'Boş = değişmez' : 'Min 6 karakter'}
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
        <label className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--rol">
          <span className="ap-kullanici-yeni-etiket">Rol</span>
          <FormAcilirSecim
            aria-label="Kullanıcı rolü"
            value={form.rol}
            onChange={(rol) => onChange({ ...form, rol })}
            secenekler={atanabilirRoller.map((r) => ({ value: r.kod, label: r.baslik }))}
          />
        </label>
        <div className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--aktif">
          <span className="ap-kullanici-yeni-etiket">Durum</span>
          <div
            className={`ap-kullanici-yeni-durum-kutu${form.aktif ? ' ap-kullanici-yeni-durum-kutu--aktif' : ' ap-kullanici-yeni-durum-kutu--pasif'}`}
          >
            <span className="ap-kullanici-yeni-durum-rozet" aria-hidden>
              {form.aktif ? 'Aktif' : 'Pasif'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.aktif}
              className={`ap-kullanici-yeni-switch${form.aktif ? ' ap-kullanici-yeni-switch--acik' : ''}`}
              aria-label={`Kullanıcı durumu: ${form.aktif ? 'Aktif' : 'Pasif'}`}
              onClick={() => onChange({ ...form, aktif: !form.aktif })}
            >
              <span className="ap-kullanici-yeni-switch-thumb" />
            </button>
          </div>
        </div>
      </div>
      <KullaniciOturumCubugu
        form={form}
        oturumSecenekleri={oturumSecenekleri}
        onChange={onChange}
        variant="form-ici-yeni"
      />
    </div>
  );
}
