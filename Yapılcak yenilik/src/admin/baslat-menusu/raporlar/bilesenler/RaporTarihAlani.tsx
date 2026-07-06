import { useRef } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { tarihTrGoster } from '@/admin/baslat-menusu/raporlar/yardimci';

interface RaporTarihAlaniProps {
  deger: string;
  onDegistir: (iso: string) => void;
  ariaLabel?: string;
}

export function RaporTarihAlani({ deger, onDegistir, ariaLabel }: RaporTarihAlaniProps) {
  const gizliRef = useRef<HTMLInputElement>(null);

  const takvimAc = () => {
    const el = gizliRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.click();
  };

  return (
    <div className="ap-rapor-tarih-alan">
      <input
        type="text"
        readOnly
        className={`${formInputSinifi} ap-rapor-tarih-girdi`}
        value={tarihTrGoster(deger)}
        aria-label={ariaLabel}
      />
      <div className="ap-rapor-tarih-tus-sarmal">
        <button type="button" className="ap-rapor-tarih-tus" onClick={takvimAc} title="Tarih seç" aria-label="Tarih seç">
          <span aria-hidden>📅</span>
        </button>
        <input
          ref={gizliRef}
          type="date"
          className="ap-rapor-tarih-gizli"
          tabIndex={-1}
          aria-hidden
          value={deger}
          onChange={(e) => onDegistir(e.target.value)}
        />
      </div>
    </div>
  );
}
