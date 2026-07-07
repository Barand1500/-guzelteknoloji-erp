import { useId } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';

interface OneriInputProps {
  deger: string;
  onDegistir: (deger: string) => void;
  oneriler: readonly string[];
  placeholder?: string;
  'aria-label': string;
}

export function OneriInput({ deger, onDegistir, oneriler, placeholder, 'aria-label': ariaLabel }: OneriInputProps) {
  const listId = useId();

  return (
    <>
      <input
        type="text"
        list={listId}
        className={`${formInputSinifi} ap-master-excel-input ap-odeme-grup-input w-full`}
        value={deger}
        onChange={(e) => onDegistir(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <datalist id={listId}>
        {oneriler.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
