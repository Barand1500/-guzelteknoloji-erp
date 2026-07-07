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
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import type { FirmaFormGirdi, MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';

export interface FirmaPanelForm {
  bayiId: number;
  unvan: string;
  tabelaAdi: string;
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

export const BOS_FIRMA_PANEL: FirmaPanelForm = {
  bayiId: 0,
  unvan: '',
  tabelaAdi: '',
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

interface FirmaKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterFirma | null;
  form: FirmaPanelForm;
  onFormDegistir: (form: FirmaPanelForm) => void;
  bayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
}

export function firmaPaneldenGirdi(form: FirmaPanelForm): { girdi?: FirmaFormGirdi; hata?: string } {
  if (!form.bayiId || form.bayiId < 1) return { hata: 'Bayi seçin' };

  const unvan = form.unvan.trim();
  if (unvan.length < 2) return { hata: 'Unvan en az 2 karakter olmalı' };

  const vergiNo = form.vergiNo.replace(/\D/g, '').slice(0, 10);

  let iskonto: number | null = null;
  if (form.iskontoMetin.trim()) {
    iskonto = iskontoIfadesiHesapla(form.iskontoMetin);
    if (iskonto == null) return { hata: 'Geçerli bir iskonto girin (ör. 5 veya 20+20)' };
  }

  return {
    girdi: {
      bayiId: form.bayiId,
      unvan,
      tabelaAdi: form.tabelaAdi.trim() || undefined,
      il: form.il.trim() || undefined,
      ilce: form.ilce.trim() || undefined,
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

function firmadanPanel(firma: MasterFirma): FirmaPanelForm {
  return {
    bayiId: firma.bayiId,
    unvan: firma.unvan,
    tabelaAdi: firma.tabelaAdi ?? '',
    il: firma.il ?? '',
    ilce: firma.ilce ?? '',
    vergiDairesi: firma.vergiDairesi ?? '',
    vergiNo: firma.vergiNo ?? '',
    iskontoMetin: firma.iskonto != null ? String(firma.iskonto) : '',
    eposta: firma.eposta ?? '',
    telefon: firma.telefon ?? '',
    gsm: firma.gsm ?? '',
    aktif: firma.aktif,
  };
}

export function FirmaKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  bayiSecenekleri,
  kaydediliyor,
}: FirmaKayitPanelProps) {
  if (!acik) return null;

  const aktifBayiler = bayiSecenekleri.filter((b) => b.aktif);
  const setForm = (guncelle: FirmaPanelForm | ((f: FirmaPanelForm) => FirmaPanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  return (
    <section className="ap-master-firma-ekle-panel" aria-label={yeniKayit ? 'Yeni firma' : 'Firma düzenle'}>
      <div className="ap-master-firma-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Firma' : 'Firma Düzenle'}</h3>
          {duzenlenen && !yeniKayit && (
            <p className="ap-muted mt-0.5 text-xs">
              {duzenlenen.tabelaAdi ?? duzenlenen.unvan} · {duzenlenen.bayiUnvan}
            </p>
          )}
        </div>
        <div className="ap-master-firma-panel-durum">
          <DurumAnahtari
            etiket={form.aktif ? 'Aktif firma' : 'Pasif firma'}
            acik={form.aktif}
            devreDisi={kaydediliyor || aktifBayiler.length === 0}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={form.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>

      <div className="ap-master-firma-ekle-grid">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bayi *</label>
          <select
            className={formSelectSinifi}
            value={form.bayiId || ''}
            disabled={kaydediliyor || aktifBayiler.length === 0}
            onChange={(e) => setForm((f) => ({ ...f, bayiId: Number(e.target.value) }))}
          >
            <option value="" disabled>
              Bayi seçin
            </option>
            {aktifBayiler.map((b) => (
              <option key={b.id} value={b.id}>
                {b.unvan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Tabela adı</label>
          <input
            className={formInputSinifi}
            placeholder="Müşteriye görünen ad"
            value={form.tabelaAdi}
            disabled={kaydediliyor}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, tabelaAdi: e.target.value }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Unvan *</label>
          <input
            className={formInputSinifi}
            placeholder="Resmi unvan"
            value={form.unvan}
            disabled={kaydediliyor}
            onChange={(e) => setForm((f) => ({ ...f, unvan: e.target.value }))}
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

export { firmadanPanel };
