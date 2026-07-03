import type { SistemSekmeId } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { SISTEM_SEKMELER } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

interface SistemSekmeCubuguProps {
  aktif: SistemSekmeId;
  onDegistir: (id: SistemSekmeId) => void;
}

export function SistemSekmeCubugu({ aktif, onDegistir }: SistemSekmeCubuguProps) {
  return (
    <div className="ap-sistem-sekmeler">
      {SISTEM_SEKMELER.map((s) => (
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

export function DurumAnahtari({
  etiket,
  aciklama,
  acik,
  onChange,
  renk = 'yesil',
  ikon,
  devreDisi = false,
  kompakt = false,
  sadeceToggle = false,
}: {
  etiket: string;
  aciklama?: string;
  acik: boolean;
  onChange: (v: boolean) => void;
  renk?: 'yesil' | 'turuncu' | 'mavi' | 'kirmizi';
  ikon?: string;
  devreDisi?: boolean;
  kompakt?: boolean;
  sadeceToggle?: boolean;
}) {
  if (sadeceToggle) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        aria-label={etiket}
        disabled={devreDisi}
        onClick={() => onChange(!acik)}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''} ${renk === 'turuncu' ? 'ap-toggle-turuncu' : ''} ${devreDisi ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    );
  }

  return (
    <div
      className={`ap-sistem-toggle ap-sistem-toggle-${renk} ${kompakt ? 'ap-sistem-toggle-kompakt' : ''} ${acik ? 'ap-sistem-toggle-aktif' : ''} ${devreDisi ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {ikon && <span className="ap-sistem-toggle-ikon">{ikon}</span>}
        <div>
          <span className="ap-heading block text-sm font-semibold">{etiket}</span>
          {aciklama && <span className="ap-muted mt-0.5 block text-xs leading-relaxed">{aciklama}</span>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        aria-label={etiket}
        disabled={devreDisi}
        onClick={() => onChange(!acik)}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''} ${renk === 'turuncu' ? 'ap-toggle-turuncu' : ''} ${devreDisi ? 'cursor-not-allowed' : ''}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    </div>
  );
}
