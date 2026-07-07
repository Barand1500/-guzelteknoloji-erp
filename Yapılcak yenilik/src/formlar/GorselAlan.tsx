import { FormAlani, formInputSinifi } from './FormAlani';

interface GorselAlanProps {
  etiket: string;
  aciklama?: string;
  deger: string;
  onChange: (url: string) => void;
  onizlemeSinifi?: string;
  duzen?: 'yatay' | 'dikey';
}

export function GorselAlan({
  etiket,
  aciklama,
  deger,
  onChange,
  onizlemeSinifi = 'h-16 w-16 rounded-lg object-contain bg-[var(--ap-input-bg)] border border-[var(--ap-border)]',
  duzen = 'yatay',
}: GorselAlanProps) {
  const onizlemeUrl = deger?.trim() || '';

  return (
    <FormAlani etiket={etiket} aciklama={aciklama}>
      <div className={`ap-gorsel-alan ${duzen === 'dikey' ? 'ap-gorsel-alan-dikey' : ''}`}>
        <div className="ap-gorsel-onizleme">
          {onizlemeUrl ? (
            <img src={onizlemeUrl} alt="" className={onizlemeSinifi} />
          ) : (
            <div className={`${onizlemeSinifi} flex items-center justify-center text-[var(--ap-text-muted)]`}>
              <svg className="h-8 w-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="ap-gorsel-girdi">
          <input
            type="url"
            value={deger}
            onChange={(e) => onChange(e.target.value)}
            className={`${formInputSinifi} ap-gorsel-url-input`}
            placeholder="https://..."
          />
        </div>
      </div>
    </FormAlani>
  );
}
