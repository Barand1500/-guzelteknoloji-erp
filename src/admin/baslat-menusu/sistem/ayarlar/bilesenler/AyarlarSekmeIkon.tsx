import type { SistemSekmeId } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

/** Ayarlar sekme çubuğu — flat stroke SVG ikonlar */

type AyarlarIkonAd = SistemSekmeId | 'robots';

function strokeProps(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: AyarlarIkonAd }) {
  const s = strokeProps();

  switch (ad) {
    case 'genel':
      return <path d="M13 2 4.5 13.5h6.2L11 22l8.5-11.5h-6.2L13 2Z" {...s} />;
    case 'gorunum':
      return (
        <>
          <path
            d="M12 4.5c3.2 0 5.8 1.4 7.2 3.6.6 1 .8 2.1.2 3.1-.7 1.2-2.1 1.8-3.6 1.8h-1.1c-.9 0-1.6.7-1.6 1.6 0 .5.2 1 .6 1.3.5.4.8 1 .8 1.7 0 1.3-1.1 2.4-2.5 2.4C7.8 20 4.5 16.2 4.5 11.5 4.5 7.6 7.8 4.5 12 4.5Z"
            {...s}
          />
          <circle cx="8.2" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="11.2" cy="7.8" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="8.5" r="1" fill="currentColor" stroke="none" />
        </>
      );
    case 'bakim':
      return (
        <path
          d="M14.5 6.2a3.6 3.6 0 0 0-5 4.7L4.2 16.2a1.6 1.6 0 0 0 2.3 2.3l5.3-5.3a3.6 3.6 0 0 0 4.7-5l-2.2 2.2-1.8-1.8 2-2.1Z"
          {...s}
        />
      );
    case 'sayfa404':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" {...s} />
          <path d="M7.5 7.5 16.5 16.5" {...s} />
        </>
      );
    case 'dil':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" {...s} />
          <path d="M3.8 12h16.4M12 3.8c2.4 2.6 2.4 13.8 0 16.4M12 3.8c-2.4 2.6-2.4 13.8 0 16.4" {...s} />
        </>
      );
    case 'guvenlik':
      return (
        <path
          d="M12 3.5 5.5 6.2v5.3c0 4.2 2.8 7.4 6.5 8.5 3.7-1.1 6.5-4.3 6.5-8.5V6.2L12 3.5Z"
          {...s}
        />
      );
    case 'script':
      return (
        <>
          <path d="M8.5 7.5 4.5 12l4 4.5" {...s} />
          <path d="M15.5 7.5 19.5 12l-4 4.5" {...s} />
          <path d="M13.2 6.5 10.8 17.5" {...s} />
        </>
      );
    case 'eklentiler':
      return (
        <>
          <path d="M12 3.5v3a2 2 0 1 0 0 4v2.5h2.5a2 2 0 1 0 4 0H21V10a1.5 1.5 0 0 0-1.5-1.5H17V6A2.5 2.5 0 0 0 14.5 3.5H12Z" {...s} />
          <path d="M3.5 12.5H6a2 2 0 1 1 0 4h2.5V21H12a1.5 1.5 0 0 0 1.5-1.5V17h2.5a2 2 0 1 0 0-4H12v-2.5H3.5Z" {...s} />
        </>
      );
    case 'sagTik':
      return (
        <>
          <rect x="8" y="3.5" width="8" height="13" rx="4" {...s} />
          <path d="M12 6.5v3" {...s} />
          <path d="M10 19.5h4M9 21.5h6" {...s} />
        </>
      );
    case 'robots':
      return (
        <>
          <rect x="4.5" y="7" width="15" height="11.5" rx="2.5" {...s} />
          <path d="M12 3.5V7M9 3.5h6M8 13h.01M16 13h.01M9 16h6" {...s} />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="7" {...s} />;
  }
}

export function AyarlarSekmeIkon({
  ad,
  boyut = 15,
  className = '',
}: {
  ad: AyarlarIkonAd;
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
