import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { TANIMLAR_TASARIM_DOSYALARI, TANIMLAR_YAZICI_SECENEKLERI } from '@/admin/baslat-menusu/tanimlar/genel/veri';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { RaporKayit } from '@/admin/baslat-menusu/raporlar/tipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

interface RaporYazdirPanelProps {
  kayit: RaporKayit;
  onKayitDegistir: (kayit: RaporKayit) => void;
  onGeri: () => void;
}

export function RaporYazdirPanel({ kayit, onKayitDegistir, onGeri }: RaporYazdirPanelProps) {
  const { basariBildir } = useAdminSayfaBildirimi();

  return (
    <section className="ap-rapor-yazdir-panel" aria-label="Yazdırma ayarları">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>

      <h3 className="ap-rapor-panel-baslik">Print</h3>

      <div className="ap-tanimlar-print-grid">
        <fieldset className="ap-tanimlar-print-alan">
          <legend className="ap-tanimlar-print-legend">Yazıcı</legend>
          <FormAcilirSecim
            aria-label="Rapor yazıcısı"
            value={kayit.yazici}
            onChange={(yazici) => onKayitDegistir({ ...kayit, yazici })}
            secenekler={TANIMLAR_YAZICI_SECENEKLERI}
          />
        </fieldset>

        <fieldset className="ap-tanimlar-print-alan">
          <legend className="ap-tanimlar-print-legend">Tasarım</legend>
          <select
            className={formSelectSinifi}
            value={kayit.tasarim}
            onChange={(e) => onKayitDegistir({ ...kayit, tasarim: e.target.value })}
          >
            {TANIMLAR_TASARIM_DOSYALARI.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <div className="ap-tanimlar-print-aksiyonlar">
            <button
              type="button"
              className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs"
              onClick={() => basariBildir('Yeni rapor şablonu (önizleme).', 'Rapor')}
            >
              Yeni Rapor
            </button>
            <button
              type="button"
              className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs"
              onClick={() => basariBildir('Rapor düzenleyici açılacak (önizleme).', 'Rapor')}
            >
              Düzenle
            </button>
            <button
              type="button"
              className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs"
              onClick={() => basariBildir('Rapor önizlemesi hazırlanıyor (önizleme).', 'Rapor')}
            >
              Önizleme
            </button>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
