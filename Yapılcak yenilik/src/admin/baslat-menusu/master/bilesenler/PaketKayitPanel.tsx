import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import type { MasterPaket, PaketFormGirdi } from '@/admin/baslat-menusu/master/paketler/api';
import {
  PAKET_PARA_BIRIMLERI,
  VARSAYILAN_PARA_BIRIMI,
  gecerliParaBirimi,
  paketParaBirimiNormallestir,
  type PaketParaBirimi,
} from '@/admin/baslat-menusu/master/paketler/paraBirimi';

export interface PaketPanelForm {
  paketAdi: string;
  subeSayisi: string;
  personelSayisi: string;
  masaSayisi: string;
  fiyat: string;
  paraBirimi: PaketParaBirimi;
  aktif: boolean;
}

export const BOS_PAKET_PANEL: PaketPanelForm = {
  paketAdi: '',
  subeSayisi: '1',
  personelSayisi: '10',
  masaSayisi: '50',
  fiyat: '0',
  paraBirimi: VARSAYILAN_PARA_BIRIMI,
  aktif: true,
};

interface PaketKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterPaket | null;
  form: PaketPanelForm;
  onFormDegistir: (form: PaketPanelForm) => void;
  kaydediliyor?: boolean;
}

export function tamSayiKabul(metin: string): boolean {
  return metin === '' || /^\d+$/.test(metin);
}

export function ondalikKabul(metin: string): boolean {
  return metin === '' || /^\d*\.?\d*$/.test(metin);
}

export function paketPaneldenGirdi(form: PaketPanelForm): { girdi?: PaketFormGirdi; hata?: string } {
  const paketAdi = form.paketAdi.trim();
  if (paketAdi.length < 2) return { hata: 'Paket adı en az 2 karakter olmalı' };

  const subeSayisi = Number(form.subeSayisi);
  const personelSayisi = Number(form.personelSayisi);
  const masaSayisi = Number(form.masaSayisi);
  const fiyat = Number(form.fiyat);

  if (form.subeSayisi.trim() === '' || !Number.isInteger(subeSayisi) || subeSayisi < 1) {
    return { hata: 'Şube sayısı en az 1 olmalı' };
  }
  if (form.personelSayisi.trim() === '' || !Number.isInteger(personelSayisi) || personelSayisi < 1) {
    return { hata: 'Personel sayısı en az 1 olmalı' };
  }
  if (form.masaSayisi.trim() === '' || !Number.isInteger(masaSayisi) || masaSayisi < 1) {
    return { hata: 'Masa sayısı en az 1 olmalı' };
  }
  if (form.fiyat.trim() === '' || Number.isNaN(fiyat) || fiyat < 0) {
    return { hata: 'Geçerli bir fiyat girin' };
  }
  if (!gecerliParaBirimi(form.paraBirimi)) {
    return { hata: 'Geçerli bir para birimi seçin' };
  }

  return {
    girdi: {
      paketAdi,
      subeSayisi,
      personelSayisi,
      masaSayisi,
      fiyat,
      paraBirimi: form.paraBirimi,
      aktif: form.aktif,
    },
  };
}

function pakettenPanel(paket: MasterPaket): PaketPanelForm {
  return {
    paketAdi: paket.paketAdi,
    subeSayisi: String(paket.subeSayisi),
    personelSayisi: String(paket.personelSayisi),
    masaSayisi: String(paket.masaSayisi),
    fiyat: String(paket.fiyat),
    paraBirimi: paketParaBirimiNormallestir(paket.paraBirimi),
    aktif: paket.aktif,
  };
}

export function PaketKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  kaydediliyor,
}: PaketKayitPanelProps) {
  if (!acik) return null;

  const setForm = (guncelle: PaketPanelForm | ((f: PaketPanelForm) => PaketPanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  return (
    <section className="ap-master-paket-ekle-panel" aria-label={yeniKayit ? 'Yeni paket' : 'Paket düzenle'}>
      <div className="ap-master-paket-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Paket' : 'Paket Düzenle'}</h3>
          {duzenlenen && !yeniKayit && (
            <p className="ap-muted mt-0.5 text-xs">{duzenlenen.aktifLisansSayisi} aktif lisans</p>
          )}
        </div>
        <div className="ap-master-paket-panel-durum">
          <DurumAnahtari
            etiket={form.aktif ? 'Satışta' : 'Pasif paket'}
            acik={form.aktif}
            devreDisi={kaydediliyor}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={form.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>

      <div className="ap-master-paket-ekle-grid">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Paket adı *</label>
          <input
            className={formInputSinifi}
            value={form.paketAdi}
            disabled={kaydediliyor}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, paketAdi: e.target.value }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube sayısı</label>
          <input
            type="text"
            inputMode="numeric"
            className={formInputSinifi}
            value={form.subeSayisi}
            disabled={kaydediliyor}
            onChange={(e) => {
              const v = e.target.value;
              if (tamSayiKabul(v)) setForm((f) => ({ ...f, subeSayisi: v }));
            }}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Personel sayısı</label>
          <input
            type="text"
            inputMode="numeric"
            className={formInputSinifi}
            value={form.personelSayisi}
            disabled={kaydediliyor}
            onChange={(e) => {
              const v = e.target.value;
              if (tamSayiKabul(v)) setForm((f) => ({ ...f, personelSayisi: v }));
            }}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Masa sayısı</label>
          <input
            type="text"
            inputMode="numeric"
            className={formInputSinifi}
            value={form.masaSayisi}
            disabled={kaydediliyor}
            onChange={(e) => {
              const v = e.target.value;
              if (tamSayiKabul(v)) setForm((f) => ({ ...f, masaSayisi: v }));
            }}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Fiyat</label>
          <div className="ap-master-fiyat-satiri">
            <input
              type="text"
              inputMode="decimal"
              className={formInputSinifi}
              value={form.fiyat}
              disabled={kaydediliyor}
              onChange={(e) => {
                const v = e.target.value.replace(',', '.');
                if (ondalikKabul(v)) setForm((f) => ({ ...f, fiyat: v }));
              }}
            />
            <select
              className={`${formSelectSinifi} ap-master-para-birimi-sec`}
              value={form.paraBirimi}
              disabled={kaydediliyor}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  paraBirimi: paketParaBirimiNormallestir(e.target.value),
                }))
              }
              aria-label="Para birimi"
              title={PAKET_PARA_BIRIMLERI.find((pb) => pb.kod === form.paraBirimi)?.etiket}
            >
              {PAKET_PARA_BIRIMLERI.map((pb) => (
                <option key={pb.kod} value={pb.kod}>
                  {pb.sembol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="ap-muted mt-2 text-xs">Kaydetmek için alttaki Kaydet düğmesini kullanın.</p>
    </section>
  );
}

export { pakettenPanel };
