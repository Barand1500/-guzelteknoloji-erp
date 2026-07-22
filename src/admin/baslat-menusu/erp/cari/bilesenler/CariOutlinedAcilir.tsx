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
  zorunlu,
  onYonet,
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
  zorunlu?: boolean;
  onYonet?: () => void;
}) {
  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      zorunlu={zorunlu}
      disabled={disabled}
      className={`cari-outlined-acilir${sinif ? ` ${sinif}` : ''}`.trim()}
      etiketEk={
        !disabled && onYonet ? (
          <button
            type="button"
            className="cari-secili-yonet"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onYonet();
            }}
            title={`${etiket} yönet`}
            aria-label={`${etiket} yönet`}
          >
            +
          </button>
        ) : null
      }
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
