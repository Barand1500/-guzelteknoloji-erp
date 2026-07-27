import type { LogIslemTuru } from './logYardimci';

function strokeProps(sw = 1.8) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ tur }: { tur: LogIslemTuru }) {
  const s = strokeProps();

  switch (tur) {
    case 'ekle':
      return <path d="M12 5v14M5 12h14" {...s} />;
    case 'sil':
      return (
        <>
          <path d="M5 8h14M9.5 8V6.5A1.5 1.5 0 0 1 11 5h2a1.5 1.5 0 0 1 1.5 1.5V8" {...s} />
          <path d="M7 8v11a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19V8" {...s} />
          <path d="M10 11.5v5M14 11.5v5" {...s} />
        </>
      );
    case 'kaydet':
      return (
        <>
          <path d="M5.5 4.5h10L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V6A1.5 1.5 0 0 1 5.5 4.5Z" {...s} />
          <path d="M8 4.5v4.5h7V4.5M8 20v-5.5h8V20" {...s} />
        </>
      );
    case 'guncelle':
      return (
        <>
          <path d="M4.5 12a7.5 7.5 0 0 1 12.4-5.7L19 8.5" {...s} />
          <path d="M19.5 4.5V8.5H15.5" {...s} />
          <path d="M19.5 12a7.5 7.5 0 0 1-12.4 5.7L5 15.5" {...s} />
          <path d="M4.5 19.5V15.5H8.5" {...s} />
        </>
      );
    case 'diger':
    default:
      return (
        <>
          <path d="M7 4h8.5L19 7.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5.5A1.5 1.5 0 0 1 7 4Z" {...s} />
          <path d="M14.5 4v3.5H18M9 11h6M9 14.5h4" {...s} />
        </>
      );
  }
}

/** Log takibi işlem ikonları — flat stroke SVG */
export function LogIslemIkon({
  tur,
  boyut = 18,
  className = '',
}: {
  tur: LogIslemTuru;
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
      <IkonYollari tur={tur} />
    </svg>
  );
}
