export type MasterGorunum = 'tablo' | 'agac';

interface MasterGorunumSegiciProps {
  gorunum: MasterGorunum;
  onDegistir: (g: MasterGorunum) => void;
}

function TabloIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AgacIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="3" width="10" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v3M8.5 11v3M15.5 11v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MasterGorunumSegici({ gorunum, onDegistir }: MasterGorunumSegiciProps) {
  return (
    <div className="ap-master-gorunum-segici" role="group" aria-label="Görünüm seçici">
      <button
        type="button"
        className={`ap-master-gorunum-btn ${gorunum === 'tablo' ? 'ap-master-gorunum-btn-aktif' : ''}`}
        onClick={() => onDegistir('tablo')}
        title="Tablo görünümü"
        aria-label="Tablo görünümü"
        aria-pressed={gorunum === 'tablo'}
      >
        <TabloIkonu />
      </button>
      <button
        type="button"
        className={`ap-master-gorunum-btn ${gorunum === 'agac' ? 'ap-master-gorunum-btn-aktif' : ''}`}
        onClick={() => onDegistir('agac')}
        title="Ağaç görünümü"
        aria-label="Ağaç görünümü"
        aria-pressed={gorunum === 'agac'}
      >
        <AgacIkonu />
      </button>
    </div>
  );
}
