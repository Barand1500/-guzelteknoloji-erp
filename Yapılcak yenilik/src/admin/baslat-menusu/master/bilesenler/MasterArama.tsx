import { formInputSinifi } from '@/formlar/FormAlani';

interface MasterAramaProps {
  placeholder: string;
  value: string;
  onChange: (deger: string) => void;
  'aria-label'?: string;
}

/** Master ekranlarında arama — ap-seo-arama padding:0 sorununu önler */
export function MasterArama({
  placeholder,
  value,
  onChange,
  'aria-label': ariaLabel,
  kompakt = false,
}: MasterAramaProps & { kompakt?: boolean }) {
  const input = (
    <input
      type="search"
      className={`${formInputSinifi} ap-master-arama ${kompakt ? 'ap-master-arama-kompakt' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel ?? placeholder}
    />
  );

  if (!kompakt) return input;

  return (
    <div className="ap-master-arama-wrap">
      <span className="ap-arama-ikon" aria-hidden>
        🔍
      </span>
      {input}
    </div>
  );
}
