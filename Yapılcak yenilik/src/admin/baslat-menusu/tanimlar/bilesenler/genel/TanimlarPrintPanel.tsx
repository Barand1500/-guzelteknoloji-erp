import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formSelectSinifi } from '@/formlar/FormAlani';
import {
  TANIMLAR_TASARIM_DOSYALARI,
  TANIMLAR_YAZICI_SECENEKLERI,
} from '@/admin/baslat-menusu/tanimlar/genel/veri';
import type { TanimlarGenelForm } from '@/admin/baslat-menusu/tanimlar/genel/tipler';

interface TanimlarPrintPanelProps {
  form: TanimlarGenelForm;
  onFormDegistir: (form: TanimlarGenelForm) => void;
}

export function TanimlarPrintPanel({ form, onFormDegistir }: TanimlarPrintPanelProps) {
  return (
    <section className="ap-tanimlar-inline-panel" aria-label="Pusula tasarımı — yazdır">
      <div className="ap-tanimlar-inline-panel-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">Print</h3>
          <p className="ap-muted mt-0.5 text-xs">Pusula yazıcı ve tasarım seçimi</p>
        </div>
      </div>

      <div className="ap-tanimlar-print-grid">
        <fieldset className="ap-tanimlar-print-alan">
          <legend className="ap-tanimlar-print-legend">Yazıcı</legend>
          <FormAcilirSecim
            aria-label="Pusula yazıcısı"
            value={form.pusulaYazicisi}
            onChange={(pusulaYazicisi) => onFormDegistir({ ...form, pusulaYazicisi })}
            secenekler={TANIMLAR_YAZICI_SECENEKLERI}
          />
        </fieldset>

        <fieldset className="ap-tanimlar-print-alan">
          <legend className="ap-tanimlar-print-legend">Tasarım</legend>
          <select
            className={formSelectSinifi}
            value={form.pusulaTasarim}
            onChange={(e) => onFormDegistir({ ...form, pusulaTasarim: e.target.value })}
          >
            {TANIMLAR_TASARIM_DOSYALARI.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <div className="ap-tanimlar-print-aksiyonlar">
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs">
              Yeni Rapor
            </button>
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs">
              Düzenle
            </button>
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs">
              Önizleme
            </button>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
