import { useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';

export function SayiGirdi({
  etiket,
  deger,
  onChange,
  adim = '0.01',
}: {
  etiket: string;
  deger: number;
  onChange: (v: number) => void;
  adim?: string;
}) {
  const [metin, setMetin] = useState(String(deger));
  const ondalikBasamak = adim === '0.0001' ? 4 : 2;

  useEffect(() => {
    setMetin(String(deger));
  }, [deger]);

  return (
    <label className="ap-tanim-girdi block">
      <span className="ap-tanim-girdi-etiket">{etiket}</span>
      <input
        className={formInputSinifi}
        type="text"
        inputMode="decimal"
        value={metin}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const sonraki = e.target.value;
          const desen = new RegExp(`^\\d*(?:[.,]\\d{0,${ondalikBasamak}})?$`);
          if (!desen.test(sonraki)) return;
          setMetin(sonraki);
          if (sonraki !== '' && sonraki !== ',' && sonraki !== '.') {
            onChange(Number(sonraki.replace(',', '.')));
          }
        }}
        onBlur={() => {
          if (metin.trim() === '' || metin === ',' || metin === '.') {
            setMetin('0');
            onChange(0);
            return;
          }
          const sayi = Number(metin.replace(',', '.'));
          const normal = Number.isFinite(sayi) ? sayi : 0;
          setMetin(String(normal));
          onChange(normal);
        }}
      />
    </label>
  );
}

export function KdvDahilAlani({
  kdvDahil,
  onChange,
}: {
  kdvDahil: boolean;
  onChange: (kdvDahil: boolean) => void;
}) {
  return (
    <div className="ap-tanimlar-aktif-satir">
      <span
        className={`ap-tanimlar-aktif-etiket ${kdvDahil ? 'ap-tanimlar-aktif-etiket--aktif' : 'ap-tanimlar-aktif-etiket--pasif'}`}
      >
        {kdvDahil ? 'KDV Dahil' : 'KDV Hariç'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={kdvDahil}
        aria-label={kdvDahil ? 'KDV Dahil' : 'KDV Hariç'}
        onClick={() => onChange(!kdvDahil)}
        className={`ap-tanimlar-toggle ${kdvDahil ? 'ap-tanimlar-toggle--acik' : ''}`}
      >
        <span className="ap-tanimlar-toggle-dugme" aria-hidden />
      </button>
    </div>
  );
}
