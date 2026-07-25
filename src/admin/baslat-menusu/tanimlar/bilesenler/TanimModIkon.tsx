type TanimModIkonAd = 'kurulum' | 'kayitlar';

function strokeProps(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: TanimModIkonAd }) {
  const s = strokeProps();

  switch (ad) {
    case 'kurulum':
      return (
        <>
          <path d="M12 3.5 13.2 7.5 17.5 8.7 13.2 9.9 12 14 10.8 9.9 6.5 8.7 10.8 7.5Z" {...s} />
          <path d="M18 13.5 18.7 15.8 21 16.5 18.7 17.2 18 19.5 17.3 17.2 15 16.5 17.3 15.8Z" {...s} />
        </>
      );
    case 'kayitlar':
      return (
        <>
          <path d="M8 4.5h6.5L17.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 8 4.5Z" {...s} />
          <path d="M14 4.5V7.5h3.5M9.5 11.5h5M9.5 15h3.5" {...s} />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="7" {...s} />;
  }
}

export function TanimModIkon({
  ad,
  boyut = 14,
  className = '',
}: {
  ad: TanimModIkonAd;
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
