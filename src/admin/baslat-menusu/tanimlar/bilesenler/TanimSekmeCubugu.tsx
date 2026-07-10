import type { TanimSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TANIM_SEKMELER } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimSekmeCubuguProps {
  aktif: TanimSekmeId;
  onDegistir: (id: TanimSekmeId) => void;
}

export function TanimSekmeCubugu({ aktif, onDegistir }: TanimSekmeCubuguProps) {
  return (
    <div className="ap-sistem-sekmeler">
      {TANIM_SEKMELER.map((s) => (
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
