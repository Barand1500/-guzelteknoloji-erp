import type { MasterSekmeId } from '@/admin/baslat-menusu/master/tipler';
import { MASTER_SEKMELER } from '@/admin/baslat-menusu/master/tipler';

interface MasterSekmeCubuguProps {
  aktif: MasterSekmeId;
  onDegistir: (id: MasterSekmeId) => void;
}

export function MasterSekmeCubugu({ aktif, onDegistir }: MasterSekmeCubuguProps) {
  return (
    <div className="ap-sistem-sekmeler">
      {MASTER_SEKMELER.map((s) => (
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
