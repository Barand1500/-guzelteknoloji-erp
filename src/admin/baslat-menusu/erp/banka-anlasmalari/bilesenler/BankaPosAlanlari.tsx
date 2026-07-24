import { useId, useState } from 'react';
import { CariOutlinedEtiket } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';

/** Takvim farkı: yıl / ay / gün */
function sureParcalari(
  baslangic: string,
  bitis: string
): { yil: number; ay: number; gun: number } | null {
  if (!baslangic || !bitis) return null;
  const a = new Date(`${baslangic}T00:00:00`);
  const b = new Date(`${bitis}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return null;

  let yil = b.getFullYear() - a.getFullYear();
  let ay = b.getMonth() - a.getMonth();
  let gun = b.getDate() - a.getDate();

  if (gun < 0) {
    ay -= 1;
    const oncekiAySonu = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    gun += oncekiAySonu;
  }
  if (ay < 0) {
    yil -= 1;
    ay += 12;
  }

  return { yil, ay, gun };
}

/** 27 Gün | 1 Ay 27 Gün | 1 Yıl 3 Ay 18 Gün */
export function sureEtiketi(baslangic: string, bitis: string): string | null {
  const p = sureParcalari(baslangic, bitis);
  if (!p) return null;
  const parcalar: string[] = [];
  if (p.yil > 0) parcalar.push(`${p.yil} Yıl`);
  if (p.ay > 0) parcalar.push(`${p.ay} Ay`);
  if (p.gun > 0 || parcalar.length === 0) parcalar.push(`${p.gun} Gün`);
  return parcalar.join(' ');
}

/** Başlangıç + bitiş tek alanda; süre Yıl/Ay/Gün olarak gösterilir. */
export function BankaOutlinedDonem({
  baslangic,
  bitis,
  onBaslangicChange,
  onBitisChange,
  disabled,
}: {
  baslangic: string;
  bitis: string;
  onBaslangicChange: (deger: string) => void;
  onBitisChange: (deger: string) => void;
  disabled?: boolean;
}) {
  const basId = useId();
  const bitId = useId();
  const [focused, setFocused] = useState(false);
  const sure = sureEtiketi(baslangic, bitis);

  return (
    <div
      className={`cari-outlined-field ba-pos-donem${focused ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}`.trim()}
    >
      <CariOutlinedEtiket etiket="Anlaşma Dönemi" htmlFor={basId} />
      <div className="cari-outlined-cerceve ba-pos-donem-cerceve">
        <label className="ba-pos-donem-parca" htmlFor={basId}>
          <span className="ba-pos-donem-mini-etiket">Başlangıç Tarihi:</span>
          <input
            id={basId}
            type="date"
            className="cari-outlined-input ba-pos-donem-input"
            value={baslangic}
            disabled={disabled}
            max={bitis || undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onBaslangicChange(e.target.value)}
            aria-label="Başlangıç tarihi"
          />
        </label>

        <span className="ba-pos-donem-ayrac" aria-hidden>
          —
        </span>

        <label className="ba-pos-donem-parca" htmlFor={bitId}>
          <span className="ba-pos-donem-mini-etiket">Bitiş Tarihi:</span>
          <input
            id={bitId}
            type="date"
            className="cari-outlined-input ba-pos-donem-input"
            value={bitis}
            disabled={disabled}
            min={baslangic || undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onBitisChange(e.target.value)}
            aria-label="Bitiş tarihi"
          />
        </label>

        {sure ? (
          <span className="ba-pos-donem-gun" aria-live="polite">
            {sure}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function BankaValorKutu({
  deger,
  onChange,
  disabled,
}: {
  deger: boolean;
  onChange: (deger: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label className={`ba-valor-kutu${disabled ? ' ba-valor-kutu--pasif' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="ba-valor-check"
        checked={deger}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ba-valor-metin">Valör</span>
    </label>
  );
}
