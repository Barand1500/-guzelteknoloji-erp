import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import type { KullaniciFormGirdi, MasterKullanici } from '@/admin/baslat-menusu/master/kullanicilar/api';
import { kullaniciTipiHesapla, KULLANICI_TIP_ETIKET } from '@/admin/baslat-menusu/master/kullanicilar/api';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { MasterSube } from '@/admin/baslat-menusu/master/subeler/api';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface KullaniciKayitModalProps {
  acik: boolean;
  duzenlenen: MasterKullanici | null;
  roller: { kod: string; baslik: string }[];
  bayiler: MasterBayi[];
  firmalar: MasterFirma[];
  subeler: MasterSube[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: KullaniciFormGirdi) => void;
}

const bosForm: KullaniciFormGirdi = {
  ad: '',
  email: '',
  sifre: '',
  rol: 'EDITOR',
  kullaniciTipi: 'sube',
  bayiId: null,
  firmaId: null,
  subeId: null,
  gsm: '',
  iskonto: null,
  aktif: true,
};

export function KullaniciKayitModal({
  acik,
  duzenlenen,
  roller,
  bayiler,
  firmalar,
  subeler,
  kaydediliyor,
  onKapat,
  onKaydet,
}: KullaniciKayitModalProps) {
  const [form, setForm] = useState<KullaniciFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  const aktifBayiler = bayiler.filter((b) => b.aktif);
  const filtreFirmalar = firmalar.filter(
    (f) => f.aktif && (!form.bayiId || f.bayiId === form.bayiId)
  );
  const filtreSubeler = subeler.filter(
    (s) => s.aktif && (!form.firmaId || s.firmaId === form.firmaId)
  );
  const hesaplananTip = kullaniciTipiHesapla(form.bayiId, form.firmaId, form.subeId);

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        ad: duzenlenen.ad,
        email: duzenlenen.eposta,
        rol: duzenlenen.rol,
        kullaniciTipi: duzenlenen.kullaniciTipi,
        bayiId: duzenlenen.bayiId,
        firmaId: duzenlenen.firmaId,
        subeId: duzenlenen.subeId,
        gsm: duzenlenen.gsm ?? '',
        iskonto: duzenlenen.iskonto,
        aktif: duzenlenen.aktif,
      });
    } else {
      const ilkBayi = bayiler.find((b) => b.aktif)?.id ?? null;
      setForm({
        ...bosForm,
        rol: roller[0]?.kod ?? 'EDITOR',
        bayiId: ilkBayi,
      });
    }
    setHata('');
  }, [acik, duzenlenen, roller, bayiler]);

  function kaydet() {
    const ad = form.ad.trim();
    const email = form.email.trim();
    if (ad.length < 2) {
      setHata('Ad en az 2 karakter olmalı');
      return;
    }
    if (!email.includes('@')) {
      setHata('Geçerli e-posta girin');
      return;
    }
    if (!duzenlenen && !form.sifre?.trim()) {
      setHata('Şifre zorunlu');
      return;
    }
    if (form.iskonto != null && (form.iskonto < 0 || form.iskonto > 100)) {
      setHata('İskonto 0-100 arasında olmalı');
      return;
    }
    onKaydet({
      ...form,
      ad,
      email,
      gsm: form.gsm?.trim() || undefined,
      sifre: form.sifre?.trim() || undefined,
      kullaniciTipi: hesaplananTip,
      iskonto: form.iskonto === null || form.iskonto === undefined ? null : form.iskonto,
    });
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
      altBaslik="Restoran paneline giriş yapacak kullanıcıyı bayi, firma ve şube ile eşleştirin"
      ikon="👤"
      genislik="firma"
      baslikId="kullanici-kayit-baslik"
      kapatmaDevreDisi={kaydediliyor}
      footer={
        <>
          <button type="button" className="ap-sistem-modal-btn" onClick={onKapat} disabled={kaydediliyor}>
            İptal
          </button>
          <button
            type="button"
            className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil"
            onClick={kaydet}
            disabled={kaydediliyor}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Kullanıcı Oluştur'}
          </button>
        </>
      }
    >
      <div className="ap-sistem-modal-bilgi-kutu">
        <span className="ap-sistem-modal-bilgi-ikon" aria-hidden>
          ℹ️
        </span>
        <p>
          Bayi → firma → şube sırasıyla seçim yapın. Kullanıcı tipi otomatik belirlenir (
          <strong className="font-semibold">{KULLANICI_TIP_ETIKET[hesaplananTip]}</strong>). Tabloda hücreleri çift tıklayarak da
          düzenleyebilirsiniz.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Ad soyad *</label>
          <input
            className={formInputSinifi}
            value={form.ad}
            onChange={(e) => setForm((f) => ({ ...f, ad: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">E-posta *</label>
          <input
            type="email"
            className={formInputSinifi}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">
            {duzenlenen ? 'Yeni şifre (opsiyonel)' : 'Şifre *'}
          </label>
          <input
            type="password"
            className={formInputSinifi}
            value={form.sifre ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">GSM</label>
          <TelefonAlani
            value={form.gsm ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, gsm: v }))}
            placeholder="05XX XXX XX XX"
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Rol</label>
          <select
            className={formSelectSinifi}
            value={form.rol}
            onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
          >
            {roller.map((r) => (
              <option key={r.kod} value={r.kod}>
                {r.baslik}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Durum</label>
          <select
            className={formSelectSinifi}
            value={form.aktif === false ? 'false' : 'true'}
            onChange={(e) => setForm((f) => ({ ...f, aktif: e.target.value === 'true' }))}
          >
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>

        <div className="sm:col-span-2 ap-master-modal-bolum-baslik">
          <p className="ap-heading text-sm font-semibold">Restoran ataması</p>
        </div>

        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Bayi</label>
          <select
            className={formSelectSinifi}
            value={form.bayiId ?? ''}
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
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Firma</label>
          <select
            className={formSelectSinifi}
            value={form.firmaId ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                firmaId: e.target.value ? Number(e.target.value) : null,
                subeId: null,
              }))
            }
            disabled={!form.bayiId}
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
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Şube</label>
          <select
            className={formSelectSinifi}
            value={form.subeId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, subeId: e.target.value ? Number(e.target.value) : null }))
            }
            disabled={!form.firmaId}
          >
            <option value="">{form.firmaId ? 'Seçin' : 'Önce firma seçin'}</option>
            {filtreSubeler.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subeAdi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">İskonto %</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className={formInputSinifi}
            value={form.iskonto ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                iskonto: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            placeholder="0-100"
          />
        </div>
      </div>

      {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}
    </SistemModal>
  );
}
