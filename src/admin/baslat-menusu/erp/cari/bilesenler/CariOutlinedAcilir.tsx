import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

export function CariOutlinedAcilir({
  etiket,
  deger,
  onChange,
  secenekler,
  disabled = false,
  sinif,
  listeSinifi,
  listeMinGenislik,
  tusMetin,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  disabled?: boolean;
  sinif?: string;
  listeSinifi?: string;
  listeMinGenislik?: number;
  tusMetin?: string;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      disabled={disabled}
      className={`cari-outlined-acilir${sinif ? ` ${sinif}` : ''}`.trim()}
    >
      <FormAcilirSecim
        value={deger}
        onChange={onChange}
        secenekler={secenekler}
        disabled={disabled}
        aria-label={etiket}
        className="cari-outlined-acilir-tus"
        listeSinifi={listeSinifi}
        listeMinGenislik={listeMinGenislik}
        tusMetin={tusMetin}
      />
    </CariOutlinedSarmalayici>
  );
}
