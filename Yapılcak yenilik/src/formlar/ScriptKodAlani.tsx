import { useMemo } from 'react';

interface ScriptKodAlaniProps {
  baslik: string;
  aciklama: string;
  deger: string;
  onChange: (deger: string) => void;
  placeholder?: string;
}

export function ScriptKodAlani({ baslik, aciklama, deger, onChange, placeholder }: ScriptKodAlaniProps) {
  const satirlar = useMemo(() => {
    const sayi = Math.max(1, deger.split('\n').length);
    return Array.from({ length: sayi }, (_, i) => i + 1);
  }, [deger]);

  return (
    <div className="ap-script-alan">
      <h4 className="ap-heading text-sm font-semibold">{baslik}</h4>
      <p className="ap-muted mt-1 text-xs">{aciklama}</p>
      <div className="ap-script-kod-kutu mt-3">
        <div className="ap-script-kod-gutter" aria-hidden>
          {satirlar.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <textarea
          className="ap-script-kod-textarea"
          value={deger}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '<script>...</script>'}
          spellCheck={false}
          rows={Math.max(6, satirlar.length)}
        />
      </div>
    </div>
  );
}
