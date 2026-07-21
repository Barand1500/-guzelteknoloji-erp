import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

export function CariOutlinedAcilir({
  etiket,
  deger,
  onChange,
  secenekler,
  disabled = false,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  disabled?: boolean;
}) {
  return (
    <CariOutlinedSarmalayici etiket={etiket} disabled={disabled} className="cari-outlined-acilir">
      <FormAcilirSecim
        value={deger}
        onChange={onChange}
        secenekler={secenekler}
        disabled={disabled}
        aria-label={etiket}
        className="cari-outlined-acilir-tus"
      />
    </CariOutlinedSarmalayici>
  );
}
