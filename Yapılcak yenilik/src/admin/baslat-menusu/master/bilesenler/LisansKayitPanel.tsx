import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { LisansFormGirdi, MasterLisans } from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterPaket } from '@/admin/baslat-menusu/master/paketler/api';
import { paketParaBirimiSembol } from '@/admin/baslat-menusu/master/paketler/paraBirimi';

export interface LisansPanelForm {
  firmaId: number;
  paketId: number;
  baslangicTarihi: string;
  bitisTarihi: string;
  aktif: boolean;
}

export const BOS_LISANS_PANEL: LisansPanelForm = {
  firmaId: 0,
  paketId: 0,
  baslangicTarihi: new Date().toISOString().slice(0, 10),
  bitisTarihi: '',
  aktif: true,
};

interface LisansKayitPanelProps {
  acik: boolean;
  yeniKayit: boolean;
  duzenlenen: MasterLisans | null;
  form: LisansPanelForm;
  onFormDegistir: (form: LisansPanelForm) => void;
  firmalar: MasterFirma[];
  paketler: MasterPaket[];
  kaydediliyor?: boolean;
}

export function lisansPaneldenGirdi(form: LisansPanelForm): { girdi?: LisansFormGirdi; hata?: string } {
  if (!form.firmaId || form.firmaId < 1) return { hata: 'Firma seçin' };
  if (!form.paketId || form.paketId < 1) return { hata: 'Paket seçin' };

  const baslangicTarihi = form.baslangicTarihi.trim();
  if (!baslangicTarihi) return { hata: 'Başlangıç tarihi gerekli' };

  return {
    girdi: {
      firmaId: form.firmaId,
      paketId: form.paketId,
      baslangicTarihi,
      bitisTarihi: form.bitisTarihi.trim() || null,
      aktif: form.aktif,
    },
  };
}

export function lisanstanPanel(lisans: MasterLisans): LisansPanelForm {
  return {
    firmaId: lisans.firmaId,
    paketId: lisans.paketId,
    baslangicTarihi: lisans.baslangicTarihi.slice(0, 10),
    bitisTarihi: lisans.bitisTarihi ? lisans.bitisTarihi.slice(0, 10) : '',
    aktif: lisans.aktif,
  };
}

export function LisansKayitPanel({
  acik,
  yeniKayit,
  duzenlenen,
  form,
  onFormDegistir,
  firmalar,
  paketler,
  kaydediliyor,
}: LisansKayitPanelProps) {
  if (!acik) return null;

  const aktifFirmalar = firmalar.filter((f) => f.aktif);
  const aktifPaketler = paketler.filter((p) => p.aktif);

  const setForm = (guncelle: LisansPanelForm | ((f: LisansPanelForm) => LisansPanelForm)) => {
    if (typeof guncelle === 'function') {
      onFormDegistir(guncelle(form));
    } else {
      onFormDegistir(guncelle);
    }
  };

  const firmaAd = duzenlenen ? (duzenlenen.firmaTabela ?? duzenlenen.firmaUnvan) : '';

  return (
    <section className="ap-master-lisans-ekle-panel" aria-label={yeniKayit ? 'Yeni lisans' : 'Lisans düzenle'}>
      <div className="ap-master-lisans-ekle-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{yeniKayit ? 'Yeni Lisans' : 'Lisans Düzenle'}</h3>
          {duzenlenen && !yeniKayit && (
            <p className="ap-muted mt-0.5 text-xs">
              {firmaAd} · {duzenlenen.paketAdi}
            </p>
          )}
        </div>
        <div className="ap-master-lisans-panel-durum">
          <div className="ap-master-toggle-mini">
            <DurumAnahtari
              etiket={form.aktif ? 'Aktif lisans' : 'Pasif lisans'}
              acik={form.aktif}
              devreDisi={kaydediliyor || aktifFirmalar.length === 0 || aktifPaketler.length === 0}
              onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
              renk={form.aktif ? 'yesil' : 'turuncu'}
              sadeceToggle
            />
          </div>
        </div>
      </div>

      <div className="ap-master-lisans-ekle-grid">
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

        <div className="sm:col-span-2">
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Paket *</label>
          <select
            className={formSelectSinifi}
            value={form.paketId || ''}
            disabled={kaydediliyor || aktifPaketler.length === 0}
            onChange={(e) => setForm((f) => ({ ...f, paketId: Number(e.target.value) }))}
          >
            <option value="" disabled>
              Paket seçin
            </option>
            {aktifPaketler.map((p) => (
              <option key={p.id} value={p.id}>
                {p.paketAdi} — {paketParaBirimiSembol(p.paraBirimi)}
                {p.fiyat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Başlangıç</label>
          <input
            type="date"
            className={formInputSinifi}
            value={form.baslangicTarihi}
            disabled={kaydediliyor}
            autoFocus={yeniKayit}
            onChange={(e) => setForm((f) => ({ ...f, baslangicTarihi: e.target.value }))}
          />
        </div>

        <div>
          <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bitiş (opsiyonel)</label>
          <input
            type="date"
            className={formInputSinifi}
            value={form.bitisTarihi}
            disabled={kaydediliyor}
            onChange={(e) => setForm((f) => ({ ...f, bitisTarihi: e.target.value }))}
          />
        </div>
      </div>

      <p className="ap-muted mt-2 text-xs">Kaydetmek için alttaki Kaydet düğmesini kullanın.</p>
    </section>
  );
}
