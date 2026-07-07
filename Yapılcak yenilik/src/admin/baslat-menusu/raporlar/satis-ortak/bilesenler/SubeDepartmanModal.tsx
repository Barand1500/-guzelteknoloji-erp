import { formSelectSinifi } from '@/formlar/FormAlani';
import { SATIS_DEPARTMANLAR, SATIS_SUBELER } from '@/admin/baslat-menusu/raporlar/satis-ortak/varsayilanVeri';
import type { SatisRaporFiltre } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';

interface SubeDepartmanModalProps {
  acik: boolean;
  filtre: SatisRaporFiltre;
  onChange: (filtre: SatisRaporFiltre) => void;
  onKapat: () => void;
  onUygula: () => void;
}

export function SubeDepartmanModal({
  acik,
  filtre,
  onChange,
  onKapat,
  onUygula,
}: SubeDepartmanModalProps) {
  if (!acik) return null;

  return (
    <div className="ap-satis-rapor-modal-arka" role="presentation" onClick={onKapat}>
      <div
        className="ap-satis-rapor-modal"
        role="dialog"
        aria-labelledby="satis-sube-baslik"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ap-satis-rapor-modal-baslik">
          <h3 id="satis-sube-baslik">Şube / Departman</h3>
          <button type="button" className="ap-btn-ghost ap-satis-rapor-modal-kapat" onClick={onKapat}>
            ×
          </button>
        </header>

        <div className="ap-satis-rapor-modal-icerik">
          <label className="ap-satis-rapor-etiket">
            <span>Şube</span>
            <select
              className={formSelectSinifi}
              value={filtre.sube || 'Tümü'}
              onChange={(e) =>
                onChange({ ...filtre, sube: e.target.value === 'Tümü' ? '' : e.target.value })
              }
            >
              {SATIS_SUBELER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="ap-satis-rapor-etiket">
            <span>Departman</span>
            <select
              className={formSelectSinifi}
              value={filtre.departman || 'Tümü'}
              onChange={(e) =>
                onChange({
                  ...filtre,
                  departman: e.target.value === 'Tümü' ? '' : e.target.value,
                })
              }
            >
              {SATIS_DEPARTMANLAR.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <footer className="ap-satis-rapor-modal-alt">
          <button type="button" className="ap-btn-ghost" onClick={onKapat}>
            İptal
          </button>
          <button
            type="button"
            className="ap-satis-rapor-filtre-tus ap-satis-rapor-filtre-tus-kucuk"
            onClick={onUygula}
          >
            Uygula
          </button>
        </footer>
      </div>
    </div>
  );
}
