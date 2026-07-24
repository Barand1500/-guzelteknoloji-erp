import type { AdminKullanici, KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import { KullaniciOturumCubugu } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciOturumCubugu';
import type { KullaniciOturumSecenekleri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/kullaniciOturumYardimci';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
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
    <aside className="ap-sidebar-panel ap-kullanici-sidebar-panel">
      <div className="ap-sidebar-baslik">
        <h2 className="ap-heading text-sm font-semibold">Kullanıcılar ({kullanicilar.length})</h2>
      </div>
      <ul className="ap-scroll ap-sidebar-icerik ap-kullanici-sidebar-liste p-2">
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
                <span className="ap-muted mt-0.5 block text-xs">{k.kullaniciKodu}</span>
                <span className="mt-1 flex flex-wrap gap-2 text-[10px]">
                  <span className="ap-etiket ap-etiket-gri">
                    {(k.roller?.length ? k.roller : [k.rol])
                      .map((kod) => rolBasliklari[kod] ?? kod)
                      .join(', ')}
                  </span>
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
  oturumSecenekleri: KullaniciOturumSecenekleri;
  onSifreDegisti: (v: boolean) => void;
  onChange: (form: KullaniciFormDegeri) => void;
}

export function KullaniciDuzenleFormu({
  form,
  seciliId,
  atanabilirRoller,
  oturumSecenekleri,
  onSifreDegisti,
  onChange,
}: KullaniciDuzenleFormuProps) {
  return (
    <div className="ap-editor-panel ap-kullanici-editor-panel">
      <div className="ap-editor-baslik">
        <h2 className="ap-heading text-base font-semibold">{seciliId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
      </div>
      <div className="ap-editor-icerik ap-kullanici-editor-icerik ap-kullanici-editor-form-satir">
        <label className="ap-kullanici-editor-alan">
          <span className="ap-kullanici-editor-etiket">Ad Soyad</span>
          <input
            className={formInputSinifi}
            placeholder="Ad Soyad"
            value={form.ad}
            onChange={(e) => onChange({ ...form, ad: e.target.value })}
            required
            autoComplete="name"
          />
        </label>
        <label className="ap-kullanici-editor-alan">
          <span className="ap-kullanici-editor-etiket">Kullanıcı Kodu</span>
          <input
            className={formInputSinifi}
            placeholder="ADMIN"
            value={form.kullaniciKodu}
            onChange={(e) => onChange({ ...form, kullaniciKodu: e.target.value.toUpperCase() })}
            required
            autoComplete="username"
          />
        </label>
        <label className="ap-kullanici-editor-alan">
          <span className="ap-kullanici-editor-etiket">{seciliId ? 'Yeni şifre' : 'Şifre'}</span>
          <input
            className={formInputSinifi}
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
        <label className="ap-kullanici-editor-alan">
          <span className="ap-kullanici-editor-etiket">Rol</span>
          <FormAcilirSecim
            aria-label="Kullanıcı rolleri"
            coklu
            values={form.roller?.length ? form.roller : form.rol ? [form.rol] : []}
            onChangeCoklu={(roller) =>
              onChange({
                ...form,
                roller,
                rol: roller[0] ?? '',
              })
            }
            secenekler={atanabilirRoller.map((r) => ({ value: r.kod, label: r.baslik }))}
          />
        </label>
        <div className="ap-kullanici-editor-alan ap-kullanici-editor-alan--toggle">
          <AdminAnahtarDugme
            etiket="Aktif"
            acik={form.aktif}
            onDegistir={(aktif) => onChange({ ...form, aktif })}
          />
        </div>
      </div>
      <KullaniciOturumCubugu
        form={form}
        oturumSecenekleri={oturumSecenekleri}
        onChange={onChange}
        variant="form-ici-eski"
      />
    </div>
  );
}
