import type { TanimSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

function strokeProps(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: TanimSekmeId }) {
  const s = strokeProps();

  switch (ad) {
    case 'firma':
      return (
        <>
          <path d="M4.5 20.5h15" {...s} />
          <path d="M6.5 20.5V7.5L12 4.5l5.5 3v13" {...s} />
          <path d="M9.5 10.5h1.5M13 10.5h1.5M9.5 14h1.5M13 14h1.5" {...s} />
          <path d="M10.5 20.5v-3.5h3v3.5" {...s} />
        </>
      );
    case 'sube':
      return (
        <>
          <path d="M4.5 20.5h15" {...s} />
          <path d="M5.5 20.5V10.5h13v10" {...s} />
          <path d="M5.5 10.5 12 5.5l6.5 5" {...s} />
          <path d="M10.5 20.5v-4h3v4" {...s} />
          <path d="M8 13.5h2M14 13.5h2" {...s} />
        </>
      );
    case 'depo':
      return (
        <>
          <path d="M4.5 9.5 12 4.5l7.5 5v10.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V9.5Z" {...s} />
          <path d="M12 4.5v16" {...s} />
          <path d="M4.5 9.5h15" {...s} />
        </>
      );
    case 'kasa':
      return (
        <>
          <rect x="4.5" y="6.5" width="15" height="11" rx="2" {...s} />
          <path d="M4.5 10.5h15" {...s} />
          <circle cx="12" cy="14" r="1.6" {...s} />
        </>
      );
    case 'donem':
      return (
        <>
          <rect x="4.5" y="5.5" width="15" height="14" rx="2" {...s} />
          <path d="M4.5 10h15M9 3.5v4M15 3.5v4" {...s} />
          <path d="M8.5 13.5h2M13.5 13.5h2M8.5 16.5h2M13.5 16.5h2" {...s} />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="7" {...s} />;
  }
}

/** Tanım kayıt modalları — flat stroke SVG */
export function TanimTipIkon({
  ad,
  boyut = 18,
  className = '',
}: {
  ad: TanimSekmeId;
  boyut?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={boyut}
      height={boyut}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <IkonYollari ad={ad} />
    </svg>
  );
}
