interface DgIkonProps {
  ad: 'cizgi' | 'filtre' | 'grup' | 'sutun' | 'indir' | 'tablo';
  className?: string;
}

export function DgIkon({ ad, className = '' }: DgIkonProps) {
  const ortak = {
    className: `dg-svg-ikon ${className}`.trim(),
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  };

  switch (ad) {
    case 'cizgi':
      return (
        <svg {...ortak}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M2 6.5h12M2 9.5h12M6 3v10M10 3v10" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        </svg>
      );
    case 'filtre':
      return (
        <svg {...ortak}>
          <path
            d="M2.5 3.5h11l-3.5 4v4l-4 2.5V7.5L2.5 3.5z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'grup':
      return (
        <svg {...ortak}>
          <path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <circle cx="12.5" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'sutun':
      return (
        <svg {...ortak}>
          <rect x="2.5" y="3" width="3" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
          <rect x="6.75" y="3" width="3" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="3" width="2.5" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
        </svg>
      );
    case 'indir':
      return (
        <svg {...ortak}>
          <path d="M8 2.5v7M5.5 7 8 9.5 10.5 7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.5 12.5h9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case 'tablo':
      return (
        <svg {...ortak}>
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M2 6h12" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}
