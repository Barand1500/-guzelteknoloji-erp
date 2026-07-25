import type { AdminKullanici, KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import type { AtanabilirRol } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/bilesenler/KullaniciBilesenleri';
import {
  CariOutlinedGirdi,
  CariOutlinedSarmalayici,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import '@/admin/baslat-menusu/erp/cari/cari.css';

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
                <span className="ap-kullanici-yeni-rol">
                  {(k.roller?.length ? k.roller : [k.rol])
                    .map((kod) => rolBasliklari[kod] ?? kod)
                    .join(', ')}
                </span>
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
  saltOkunur?: boolean;
}

export function KullaniciDuzenleFormuYeni({
  form,
  seciliId,
  atanabilirRoller,
  onSifreDegisti,
  onChange,
  saltOkunur = false,
}: KullaniciDuzenleFormuYeniProps) {
  return (
    <div className="ap-kullanici-yeni-form">
      <div className="ap-kullanici-yeni-form-satir">
        <CariOutlinedGirdi
          className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--ad"
          etiket="Ad Soyad"
          zorunlu
          deger={form.ad}
          odakPlaceholder="Ad Soyad"
          autoComplete="name"
          disabled={saltOkunur}
          onChange={(ad) => onChange({ ...form, ad })}
        />
        <CariOutlinedGirdi
          className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--kod"
          etiket="Kullanıcı Kodu"
          zorunlu
          deger={form.kullaniciKodu}
          odakPlaceholder="ADMIN"
          buyukHarf
          autoComplete="username"
          disabled={saltOkunur}
          onChange={(kullaniciKodu) => onChange({ ...form, kullaniciKodu })}
        />
        <CariOutlinedGirdi
          className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--sifre"
          etiket={seciliId ? 'Yeni şifre' : 'Şifre'}
          zorunlu={!seciliId}
          type="password"
          deger={form.sifre}
          odakPlaceholder={seciliId ? 'Boş = değişmez' : 'Min 6 karakter'}
          autoComplete="new-password"
          disabled={saltOkunur}
          onChange={(sifre) => {
            onChange({ ...form, sifre });
            onSifreDegisti(true);
          }}
        />
        <CariOutlinedSarmalayici
          etiket="Rol"
          zorunlu
          disabled={saltOkunur}
          className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--rol cari-outlined-acilir"
        >
          <FormAcilirSecim
            aria-label="Kullanıcı rolleri"
            coklu
            bosEtiket="Seçiniz"
            disabled={saltOkunur}
            values={(() => {
              const ham = form.roller?.length ? form.roller : form.rol ? [form.rol] : [];
              const izinli = new Set(atanabilirRoller.map((r) => r.kod));
              return ham.filter((kod) => izinli.has(kod));
            })()}
            onChangeCoklu={(roller) =>
              onChange({
                ...form,
                roller,
                rol: roller[0] ?? '',
              })
            }
            secenekler={atanabilirRoller.map((r) => ({ value: r.kod, label: r.baslik }))}
            className="cari-outlined-acilir-tus"
          />
        </CariOutlinedSarmalayici>
        <CariOutlinedSarmalayici
          etiket="Durum"
          disabled={saltOkunur}
          className="ap-kullanici-yeni-alan ap-kullanici-yeni-alan--aktif ap-kullanici-yeni-durum-outlined"
        >
          <OrtakDurumAlani
            aktif={form.aktif}
            onChange={(aktif) => {
              if (saltOkunur) return;
              onChange({ ...form, aktif });
            }}
          />
        </CariOutlinedSarmalayici>
      </div>
    </div>
  );
}
