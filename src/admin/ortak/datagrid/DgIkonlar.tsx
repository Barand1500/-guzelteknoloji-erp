interface DgIkonProps {
  ad:
    | 'cizgi-yok'
    | 'cizgi-yatay'
    | 'cizgi-dikey'
    | 'cizgi-tam'
    | 'grup'
    | 'sutun'
    | 'indir'
    | 'tablo'
    | 'sil'
    | 'igne';
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
    case 'cizgi-yok':
      return (
        <svg {...ortak}>
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M4.5 11.5 11.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'cizgi-yatay':
      return (
        <svg {...ortak}>
          <path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'cizgi-dikey':
      return (
        <svg {...ortak}>
          <path d="M5 3v10M8 3v10M11 3v10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'cizgi-tam':
      return (
        <svg {...ortak}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M2 6.5h12M2 9.5h12M6 3v10M10 3v10" stroke="currentColor" strokeWidth="1" opacity="0.55" />
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
    case 'sil':
      return (
        <svg {...ortak}>
          <path d="M3.25 4.5h9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path
            d="M5.25 4.5V3.5a.9.9 0 0 1 .9-.9h3.7a.9.9 0 0 1 .9.9v1"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 4.5v8.1a.9.9 0 0 0 .9.9h5.2a.9.9 0 0 0 .9-.9V4.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path d="M6.5 7.25v4M8 7.25v4M9.5 7.25v4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case 'igne':
      return (
        <svg {...ortak}>
          <path
            d="M10.9 2.9 13 5l-2 2-1.2-1.2-1.8 1.8 2.5 2.5-.9.9-2.5-2.5-2.7 2.7a.8.8 0 0 1-1.1 0l-.2-.2a.8.8 0 0 1 0-1.1l2.7-2.7-1.2-1.2 2-2 1.2 1.2 1.8-1.8-1.2-1.2z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
