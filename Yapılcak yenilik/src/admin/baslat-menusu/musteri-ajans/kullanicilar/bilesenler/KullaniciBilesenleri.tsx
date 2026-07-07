import type { AdminKullanici, KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import { formInputSinifi } from '@/formlar/FormAlani';
import { AdminAnahtarDugme } from '@/admin/ortak/AdminFormBilesenleri';

export interface AtanabilirRol {
  kod: string;
  baslik: string;
}

interface KullaniciListesiProps {
  kullanicilar: AdminKullanici[];
  seciliId: string | null;
  rolBasliklari: Record<string, string>;
  onSec: (k: AdminKullanici) => void;
}

export function KullaniciListesi({ kullanicilar, seciliId, rolBasliklari, onSec }: KullaniciListesiProps) {
  return (
    <aside className="ap-sidebar-panel">
      <div className="ap-sidebar-baslik">
        <h2 className="ap-heading text-sm font-semibold">Kullanıcılar ({kullanicilar.length})</h2>
      </div>
      <ul className="ap-scroll ap-sidebar-icerik max-h-[520px] overflow-y-auto p-2">
        {kullanicilar.length === 0 ? (
          <li className="ap-muted px-2 py-4 text-center text-sm">Henüz kullanıcı yok</li>
        ) : (
          kullanicilar.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => onSec(k)}
                className={`ap-liste-oge ${seciliId === k.id ? 'ap-liste-oge-secili' : ''}`}
              >
                <span className="ap-heading font-medium">{k.ad}</span>
                <span className="ap-muted mt-0.5 block text-xs">{k.email}</span>
                <span className="mt-1 flex flex-wrap gap-2 text-[10px]">
                  <span className="ap-etiket ap-etiket-gri">{rolBasliklari[k.rol] ?? k.rol}</span>
                  {!k.aktif && <span className="text-red-400">Pasif</span>}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

interface KullaniciDuzenleFormuProps {
  form: KullaniciFormDegeri;
  seciliId: string | null;
  atanabilirRoller: AtanabilirRol[];
  onSifreDegisti: (v: boolean) => void;
  onChange: (form: KullaniciFormDegeri) => void;
}

export function KullaniciDuzenleFormu({
  form,
  seciliId,
  atanabilirRoller,
  onSifreDegisti,
  onChange,
}: KullaniciDuzenleFormuProps) {
  return (
    <div className="ap-editor-panel">
      <div className="ap-editor-baslik">
        <h2 className="ap-heading text-base font-semibold">{seciliId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
      </div>
      <div className="ap-editor-icerik space-y-3">
        <input
          className={formInputSinifi}
          placeholder="Ad Soyad"
          value={form.ad}
          onChange={(e) => onChange({ ...form, ad: e.target.value })}
          required
          autoComplete="name"
        />
        <input
          className={formInputSinifi}
          type="email"
          placeholder="E-posta"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />
        <input
          className={formInputSinifi}
          type="password"
          placeholder={seciliId ? 'Yeni şifre (boş bırak = değişmez)' : 'Şifre (min 6 karakter)'}
          value={form.sifre}
          onChange={(e) => {
            onChange({ ...form, sifre: e.target.value });
            onSifreDegisti(true);
          }}
          required={!seciliId}
          minLength={seciliId ? undefined : 6}
          autoComplete={seciliId ? 'new-password' : 'new-password'}
        />

        <select
          className={formInputSinifi}
          value={form.rol}
          onChange={(e) => onChange({ ...form, rol: e.target.value })}
        >
          {atanabilirRoller.map((r) => (
            <option key={r.kod} value={r.kod}>
              {r.baslik}
            </option>
          ))}
        </select>

        <AdminAnahtarDugme
          etiket="Aktif kullanıcı"
          acik={form.aktif}
          onDegistir={(aktif) => onChange({ ...form, aktif })}
        />
      </div>
    </div>
  );
}
