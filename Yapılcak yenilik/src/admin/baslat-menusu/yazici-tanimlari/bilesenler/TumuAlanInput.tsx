import { formInputSinifi } from '@/formlar/FormAlani';
import { YAZICI_TUMU } from '@/admin/baslat-menusu/yazici-tanimlari/tipler';

interface TumuAlanInputProps {
  etiket: string;
  deger: string;
  placeholder?: string;
  onDegistir: (deger: string) => void;
  oneriler?: readonly string[];
}

export function TumuAlanInput({ etiket, deger, placeholder, onDegistir, oneriler }: TumuAlanInputProps) {
  const tumuMu = deger === YAZICI_TUMU;

  return (
    <label className="ap-yazici-alan">
      <span className="ap-yazici-alan-etiket">{etiket}</span>
      <div className="ap-yazici-alan-satir">
        <input
          className={formInputSinifi}
          value={deger}
          onChange={(e) => onDegistir(e.target.value)}
          placeholder={placeholder ?? 'Tümü için *'}
          list={oneriler?.length ? `${etiket}-oneri` : undefined}
        />
        {oneriler && oneriler.length > 0 && (
          <datalist id={`${etiket}-oneri`}>
            {oneriler.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        )}
        <button
          type="button"
          className={`ap-yazici-tumu-tus ${tumuMu ? 'ap-yazici-tumu-tus-aktif' : ''}`}
          onClick={() => onDegistir(YAZICI_TUMU)}
          title="Tümü (*)"
        >
          Tümü
        </button>
      </div>
    </label>
  );
}
