import type { TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TANIMLAR_SEKMELER } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimlarSekmeCubuguProps {
  aktif: TanimlarSekmeId;
  onDegistir: (id: TanimlarSekmeId) => void;
}

export function TanimlarSekmeCubugu({ aktif, onDegistir }: TanimlarSekmeCubuguProps) {
  return (
    <div className="ap-sistem-sekmeler">
      {TANIMLAR_SEKMELER.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onDegistir(s.id)}
          className={`ap-sistem-sekme ${aktif === s.id ? 'ap-sistem-sekme-aktif' : ''}`}
        >
          <span className="ap-sistem-sekme-ikon" aria-hidden>
            {s.ikon}
          </span>
          {s.ad}
        </button>
      ))}
    </div>
  );
}
