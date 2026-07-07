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
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  SUBE_TIP_SECENEKLERI,
  subeTarihGoster,
  type MasterSube,
  type SubeFormGirdi,
  type SubeTipi,
} from '@/admin/baslat-menusu/master/subeler/api';

export interface SubePanelForm {
  firmaId: number;
  subeAdi: string;
  subeTipi: SubeTipi;
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

export const BOS_SUBE_PANEL: SubePanelForm = {
  firmaId: 0,
  subeAdi: '',
  subeTipi: 'restoran',
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

interface SubeKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterSube | null;
  form: SubePanelForm;
  onFormDegistir: (form: SubePanelForm) => void;
  firmaSecenekleri: MasterFirma[];
  kaydediliyor?: boolean;
}

export function subePaneldenGirdi(form: SubePanelForm): { girdi?: SubeFormGirdi; hata?: string } {
  if (!form.firmaId || form.firmaId < 1) return { hata: 'Firma seçin' };

  const subeAdi = form.subeAdi.trim();
  if (subeAdi.length < 2) return { hata: 'Şube adı en az 2 karakter olmalı' };

  const vergiNo = form.vergiNo.replace(/\D/g, '').slice(0, 10);

  let iskonto: number | null = null;
  if (form.iskontoMetin.trim()) {
    iskonto = iskontoIfadesiHesapla(form.iskontoMetin);
    if (iskonto == null) return { hata: 'Geçerli bir iskonto girin (ör. 5 veya 20+20)' };
  }

  return {
    girdi: {
      firmaId: form.firmaId,
      subeAdi,
      subeTipi: form.subeTipi,
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

function subedenPanel(sube: MasterSube): SubePanelForm {
  return {
    firmaId: sube.firmaId,
    subeAdi: sube.subeAdi,
    subeTipi: sube.subeTipi,
    adres: sube.adres ?? '',
    il: sube.il ?? '',
    ilce: sube.ilce ?? '',
    vergiDairesi: sube.vergiDairesi ?? '',
    vergiNo: sube.vergiNo ?? '',
    iskontoMetin: sube.iskonto != null ? String(sube.iskonto) : '',
    eposta: sube.eposta ?? '',
    telefon: sube.telefon ?? '',
    gsm: sube.gsm ?? '',
    aktif: sube.aktif,
  };
}

export function SubeKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  firmaSecenekleri,
  kaydediliyor,
}: SubeKayitPanelProps) {
  if (!acik) return null;

  const aktifFirmalar = firmaSecenekleri.filter((f) => f.aktif);
  const setForm = (guncelle: SubePanelForm | ((f: SubePanelForm) => SubePanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  return (
    <section className="ap-master-sube-ekle-panel" aria-label={yeniKayit ? 'Yeni şube' : 'Şube düzenle'}>
      <div className="ap-master-sube-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Şube' : 'Şube Düzenle'}</h3>
          {duzenlenen && !yeniKayit && (
            <p className="ap-muted mt-0.5 text-xs">
              Kayıt: {subeTarihGoster(duzenlenen.kayitTarihi)} · Güncelleme:{' '}
              {subeTarihGoster(duzenlenen.guncellemeTarihi)}
            </p>
          )}
        </div>
        <div className="ap-master-sube-panel-durum">
          <DurumAnahtari
            etiket={form.aktif ? 'Aktif şube' : 'Pasif şube'}
            acik={form.aktif}
            devreDisi={kaydediliyor || aktifFirmalar.length === 0}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={form.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>

      <div className="ap-master-sube-ekle-grid">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Firma *</label>
          <select
            className={formSelectSinifi}
            value={form.firmaId || ''}
            disabled={kaydediliyor || aktifFirmalar.length === 0}
            onChange={(e) => setForm((f) => ({ ...f, firmaId: Number(e.target.value) }))}
          >
            <option value="" disabled>
              Firma seçin
            </option>
            {aktifFirmalar.map((f) => (
              <option key={f.id} value={f.id}>
                {f.tabelaAdi ?? f.unvan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube adı *</label>
          <input
            className={formInputSinifi}
            placeholder="ör. Merkez Şube"
            value={form.subeAdi}
            disabled={kaydediliyor}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, subeAdi: e.target.value }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube tipi</label>
          <select
            className={formSelectSinifi}
            value={form.subeTipi}
            disabled={kaydediliyor}
            onChange={(e) => setForm((f) => ({ ...f, subeTipi: e.target.value as SubeTipi }))}
          >
            {SUBE_TIP_SECENEKLERI.map((t) => (
              <option key={t.kod} value={t.kod}>
                {t.etiket}
              </option>
            ))}
          </select>
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

export { subedenPanel };
