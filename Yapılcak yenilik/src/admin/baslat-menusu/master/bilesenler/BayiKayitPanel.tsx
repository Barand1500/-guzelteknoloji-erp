import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import {
  EpostaOneriAlani,
  IlIlceArama,
  IskontoIfadeAlani,
  TelefonAlani,
  VergiDairesiArama,
} from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  bayiTarihGoster,
  type BayiFormGirdi,
  type MasterBayi,
} from '@/admin/baslat-menusu/master/bayiler/api';

export interface BayiPanelForm {
  unvan: string;
  ustId: number | null;
  adres: string;
  il: string;
  ilce: string;
  vergiDairesi: string;
  vergiNo: string;
  iskontoMetin: string;
  eposta: string;
  telefon: string;
  gsm: string;
  aktif: boolean;
}

export const BOS_BAYI_PANEL: BayiPanelForm = {
  unvan: '',
  ustId: null,
  adres: '',
  il: '',
  ilce: '',
  vergiDairesi: '',
  vergiNo: '',
  iskontoMetin: '',
  eposta: '',
  telefon: '',
  gsm: '',
  aktif: true,
};

interface BayiKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterBayi | null;
  form: BayiPanelForm;
  onFormDegistir: (form: BayiPanelForm) => void;
  ustBayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
}

export function bayiPaneldenGirdi(form: BayiPanelForm): { girdi?: BayiFormGirdi; hata?: string } {
  const unvan = form.unvan.trim();
  if (unvan.length < 2) return { hata: 'Unvan en az 2 karakter olmalı' };

  const vergiNo = form.vergiNo.replace(/\D/g, '').slice(0, 10);
  if (vergiNo && vergiNo.length > 10) return { hata: 'Vergi no en fazla 10 haneli olmalı' };

  let iskonto: number | null = null;
  if (form.iskontoMetin.trim()) {
    iskonto = iskontoIfadesiHesapla(form.iskontoMetin);
    if (iskonto == null) return { hata: 'Geçerli bir iskonto girin (ör. 5 veya 20+20)' };
  }

  return {
    girdi: {
      unvan,
      ustId: form.ustId ?? null,
      il: form.il.trim() || undefined,
      ilce: form.ilce.trim() || undefined,
      adres: form.adres.trim() || undefined,
      eposta: form.eposta.trim() || undefined,
      telefon: form.telefon.trim() || undefined,
      gsm: form.gsm.trim() || undefined,
      vergiDairesi: form.vergiDairesi.trim() || undefined,
      vergiNo: vergiNo || undefined,
      iskonto,
      aktif: form.aktif,
    },
  };
}

function bayidenPanel(bayi: MasterBayi): BayiPanelForm {
  return {
    unvan: bayi.unvan,
    ustId: bayi.ustId,
    adres: bayi.adres ?? '',
    il: bayi.il ?? '',
    ilce: bayi.ilce ?? '',
    vergiDairesi: bayi.vergiDairesi ?? '',
    vergiNo: bayi.vergiNo ?? '',
    iskontoMetin: bayi.iskonto != null ? String(bayi.iskonto) : '',
    eposta: bayi.eposta ?? '',
    telefon: bayi.telefon ?? '',
    gsm: bayi.gsm ?? '',
    aktif: bayi.aktif,
  };
}

export function BayiKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  ustBayiSecenekleri,
  kaydediliyor,
}: BayiKayitPanelProps) {
  if (!acik) return null;

  const ustSecenekler = ustBayiSecenekleri.filter((b) => b.id !== duzenlenen?.id && b.aktif);
  const setForm = (guncelle: BayiPanelForm | ((f: BayiPanelForm) => BayiPanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  return (
    <section className="ap-master-bayi-ekle-panel" aria-label={yeniKayit ? 'Yeni bayi' : 'Bayi düzenle'}>
      <div className="ap-master-bayi-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Bayi' : 'Bayi Düzenle'}</h3>
          {duzenlenen && !yeniKayit && (
            <p className="ap-muted mt-0.5 text-xs">
              Kayıt: {bayiTarihGoster(duzenlenen.kayitTarihi)} · Güncelleme:{' '}
              {bayiTarihGoster(duzenlenen.guncellemeTarihi)}
            </p>
          )}
        </div>
        <div className="ap-master-bayi-panel-durum">
          <DurumAnahtari
            etiket={form.aktif ? 'Aktif bayi' : 'Pasif bayi'}
            acik={form.aktif}
            devreDisi={kaydediliyor}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={form.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>

      <div className="ap-master-bayi-ekle-grid">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Üst bayi</label>
          <select
            className={formSelectSinifi}
            value={form.ustId ?? ''}
            disabled={kaydediliyor}
            onChange={(e) =>
              setForm((f) => ({ ...f, ustId: e.target.value ? Number(e.target.value) : null }))
            }
          >
            <option value="">Bağımsız (ana bayi)</option>
            {ustSecenekler.map((b) => (
              <option key={b.id} value={b.id}>
                {b.unvan}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Unvan *</label>
          <input
            className={formInputSinifi}
            placeholder="Bayi / distribütör unvanı"
            value={form.unvan}
            disabled={kaydediliyor}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, unvan: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Adres</label>
          <input
            className={formInputSinifi}
            value={form.adres}
            disabled={kaydediliyor}
            onChange={(e) => setForm((f) => ({ ...f, adres: e.target.value }))}
          />
        </div>

        <IlIlceArama
          il={form.il}
          ilce={form.ilce}
          onDegistir={(g) => setForm((f) => ({ ...f, ...g }))}
        />

        <VergiDairesiArama
          deger={form.vergiDairesi}
          onDegistir={(v) => setForm((f) => ({ ...f, vergiDairesi: v }))}
          devreDisi={kaydediliyor}
        />

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Vergi no</label>
          <input
            className={formInputSinifi}
            inputMode="numeric"
            maxLength={10}
            placeholder="En fazla 10 hane"
            value={form.vergiNo}
            disabled={kaydediliyor}
            onChange={(e) =>
              setForm((f) => ({ ...f, vergiNo: e.target.value.replace(/\D/g, '').slice(0, 10) }))
            }
          />
        </div>

        <IskontoIfadeAlani
          deger={form.iskontoMetin}
          onDegistir={(v) => setForm((f) => ({ ...f, iskontoMetin: v }))}
          devreDisi={kaydediliyor}
        />

        <EpostaOneriAlani
          deger={form.eposta}
          onDegistir={(v) => setForm((f) => ({ ...f, eposta: v }))}
          devreDisi={kaydediliyor}
        />

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Telefon</label>
          <TelefonAlani
            value={form.telefon}
            onChange={(v) => setForm((f) => ({ ...f, telefon: v }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">GSM</label>
          <TelefonAlani
            value={form.gsm}
            onChange={(v) => setForm((f) => ({ ...f, gsm: v }))}
            placeholder="05XX XXX XX XX"
            aria-label="GSM"
          />
        </div>
      </div>

      <p className="ap-muted mt-2 text-xs">Kaydetmek için alttaki Kaydet düğmesini kullanın.</p>
    </section>
  );
}

export { bayidenPanel };
