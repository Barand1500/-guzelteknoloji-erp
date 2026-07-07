interface BaslatMenuAramaProps {
  deger: string;
  onDegistir: (deger: string) => void;
  variant?: 'klasik' | 'modern';
}

export function BaslatMenuArama({ deger, onDegistir, variant = 'klasik' }: BaslatMenuAramaProps) {
  if (variant === 'modern') {
    return (
      <div className="ap-baslat-modern-arama">
        <span className="ap-baslat-modern-arama-ikon" aria-hidden>
          ⌕
        </span>
        <input
          type="search"
          value={deger}
          onChange={(e) => onDegistir(e.target.value)}
          placeholder="Modül veya ayar ara..."
          className="ap-baslat-modern-arama-input"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <input
        type="search"
        value={deger}
        onChange={(e) => onDegistir(e.target.value)}
        placeholder="Modül, sayfa, widget veya ayar ara..."
        className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
        autoFocus
      />
    </div>
  );
}
