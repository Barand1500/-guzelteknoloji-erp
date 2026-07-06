import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import {
  EpostaOneriAlani,
  IskontoIfadeAlani,
  TelefonAlani,
} from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  kullaniciTipiHesapla,
  KULLANICI_TIP_ETIKET,
  type KullaniciFormGirdi,
  type MasterKullanici,
} from '@/admin/baslat-menusu/master/kullanicilar/api';
import type { MasterSube } from '@/admin/baslat-menusu/master/subeler/api';

export interface KullaniciPanelForm {
  ad: string;
  email: string;
  sifre: string;
  rol: string;
  bayiId: number | null;
  firmaId: number | null;
  subeId: number | null;
  gsm: string;
  iskontoMetin: string;
  aktif: boolean;
}

export const BOS_KULLANICI_PANEL: KullaniciPanelForm = {
  ad: '',
  email: '',
  sifre: '',
  rol: 'EDITOR',
  bayiId: null,
  firmaId: null,
  subeId: null,
  gsm: '',
  iskontoMetin: '',
  aktif: true,
};

interface KullaniciKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterKullanici | null;
  form: KullaniciPanelForm;
  onFormDegistir: (form: KullaniciPanelForm) => void;
  roller: { kod: string; baslik: string }[];
  bayiler: MasterBayi[];
  firmalar: MasterFirma[];
  subeler: MasterSube[];
  kaydediliyor?: boolean;
}

export function kullaniciPaneldenGirdi(
  form: KullaniciPanelForm,
  yeniKayit: boolean
): { girdi?: KullaniciFormGirdi; hata?: string } {
  const ad = form.ad.trim();
  const email = form.email.trim();

  if (ad.length < 2) return { hata: 'Ad en az 2 karakter olmalı' };
  if (!email.includes('@')) return { hata: 'Geçerli e-posta girin' };
  if (yeniKayit && !form.sifre.trim()) return { hata: 'Şifre zorunlu' };

  let iskonto: number | null = null;
  if (form.iskontoMetin.trim()) {
    iskonto = iskontoIfadesiHesapla(form.iskontoMetin);
    if (iskonto == null) return { hata: 'Geçerli bir iskonto girin (ör. 5 veya 20+20)' };
  }

  const kullaniciTipi = kullaniciTipiHesapla(form.bayiId, form.firmaId, form.subeId);

  return {
    girdi: {
      ad,
      email,
      sifre: form.sifre.trim() || undefined,
      rol: form.rol,
      kullaniciTipi,
      bayiId: form.bayiId,
      firmaId: form.firmaId,
      subeId: form.subeId,
      gsm: form.gsm.trim() || undefined,
      iskonto,
      aktif: form.aktif,
    },
  };
}

function kullanicidanPanel(k: MasterKullanici): KullaniciPanelForm {
  return {
    ad: k.ad,
    email: k.eposta,
    sifre: '',
    rol: k.rol,
    bayiId: k.bayiId,
    firmaId: k.firmaId,
    subeId: k.subeId,
    gsm: k.gsm ?? '',
    iskontoMetin: k.iskonto != null ? String(k.iskonto) : '',
    aktif: k.aktif,
  };
}

export function KullaniciKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  roller,
  bayiler,
  firmalar,
  subeler,
  kaydediliyor,
}: KullaniciKayitPanelProps) {
  if (!acik) return null;

  const aktifBayiler = bayiler.filter((b) => b.aktif);
  const filtreFirmalar = firmalar.filter(
    (f) => f.aktif && (!form.bayiId || f.bayiId === form.bayiId)
  );
  const filtreSubeler = subeler.filter(
    (s) => s.aktif && (!form.firmaId || s.firmaId === form.firmaId)
  );
  const hesaplananTip = kullaniciTipiHesapla(form.bayiId, form.firmaId, form.subeId);

  const setForm = (guncelle: KullaniciPanelForm | ((f: KullaniciPanelForm) => KullaniciPanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  return (
    <section className="ap-master-kullanici-ekle-panel" aria-label={yeniKayit ? 'Yeni kullanıcı' : 'Kullanıcı düzenle'}>
      <div className="ap-master-kullanici-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Kullanıcı' : 'Kullanıcı Düzenle'}</h3>
          <p className="ap-muted mt-0.5 text-xs">
            Kullanıcı tipi: <strong className="ap-heading">{KULLANICI_TIP_ETIKET[hesaplananTip]}</strong>
            {duzenlenen && !yeniKayit && ` · ${duzenlenen.eposta}`}
          </p>
        </div>
        <div className="ap-master-kullanici-panel-durum">
          <DurumAnahtari
            etiket={form.aktif ? 'Aktif kullanıcı' : 'Pasif kullanıcı'}
            acik={form.aktif}
            devreDisi={kaydediliyor}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={form.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>

      <div className="ap-master-kullanici-ekle-grid">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bayi</label>
          <select
            className={formSelectSinifi}
            value={form.bayiId ?? ''}
            disabled={kaydediliyor}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                bayiId: e.target.value ? Number(e.target.value) : null,
                firmaId: null,
                subeId: null,
              }))
            }
          >
            <option value="">Seçin</option>
            {aktifBayiler.map((b) => (
              <option key={b.id} value={b.id}>
                {b.unvan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Firma</label>
          <select
            className={formSelectSinifi}
            value={form.firmaId ?? ''}
            disabled={kaydediliyor || !form.bayiId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                firmaId: e.target.value ? Number(e.target.value) : null,
                subeId: null,
              }))
            }
          >
            <option value="">{form.bayiId ? 'Seçin' : 'Önce bayi seçin'}</option>
            {filtreFirmalar.map((fr) => (
              <option key={fr.id} value={fr.id}>
                {fr.tabelaAdi ?? fr.unvan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube</label>
          <select
            className={formSelectSinifi}
            value={form.subeId ?? ''}
            disabled={kaydediliyor || !form.firmaId}
            onChange={(e) =>
              setForm((f) => ({ ...f, subeId: e.target.value ? Number(e.target.value) : null }))
            }
          >
            <option value="">{form.firmaId ? 'Seçin' : 'Önce firma seçin'}</option>
            {filtreSubeler.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subeAdi}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Ad soyad *</label>
          <input
            className={formInputSinifi}
            value={form.ad}
            disabled={kaydediliyor}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, ad: e.target.value }))}
          />
        </div>

        <EpostaOneriAlani
          deger={form.email}
          onDegistir={(v) => setForm((f) => ({ ...f, email: v }))}
          devreDisi={kaydediliyor}
          etiket="E-posta *"
        />

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">
            {yeniKayit ? 'Şifre *' : 'Yeni şifre (opsiyonel)'}
          </label>
          <input
            type="password"
            className={formInputSinifi}
            value={form.sifre}
            disabled={kaydediliyor}
            autoComplete="new-password"
            onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">GSM</label>
          <TelefonAlani
            value={form.gsm}
            onChange={(v) => setForm((f) => ({ ...f, gsm: v }))}
            placeholder="05XX XXX XX XX"
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Rol</label>
          <select
            className={formSelectSinifi}
            value={form.rol}
            disabled={kaydediliyor}
            onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
          >
            {roller.map((r) => (
              <option key={r.kod} value={r.kod}>
                {r.baslik}
              </option>
            ))}
          </select>
        </div>

        <IskontoIfadeAlani
          deger={form.iskontoMetin}
          onDegistir={(v) => setForm((f) => ({ ...f, iskontoMetin: v }))}
          devreDisi={kaydediliyor}
        />
      </div>

      <p className="ap-muted mt-2 text-xs">Kaydetmek için alttaki Kaydet düğmesini kullanın.</p>
    </section>
  );
}

export { kullanicidanPanel };
