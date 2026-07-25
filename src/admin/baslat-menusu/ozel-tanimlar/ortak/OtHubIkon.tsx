import type { OzelTanimModulId } from '@/admin/baslat-menusu/ozel-tanimlar/katalog';

/** Özel Tanımlar hub sol menü — flat stroke SVG */
export function OtHubIkon({
  modulId,
  boyut = 18,
}: {
  modulId: OzelTanimModulId;
  boyut?: number;
}) {
  return (
    <svg
      className="ot-hub-flat-ikon"
      width={boyut}
      height={boyut}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <IkonYollari ad={modulId} />
    </svg>
  );
}

function s(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: OzelTanimModulId }) {
  const p = s();
  switch (ad) {
    case 'para-birimleri':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" {...p} />
          <path d="M12 7.2v9.6M9.2 9.2c.7-1 1.8-1.5 2.8-1.5 1.7 0 2.9 1 2.9 2.4s-1.2 2.3-2.9 2.3H10.5c-1.7 0-2.9.9-2.9 2.3 0 1.4 1.3 2.4 3 2.4 1.1 0 2.1-.5 2.8-1.4" {...p} />
        </>
      );
    case 'bankalar-kartlar':
      return (
        <>
          <path d="M4 10h16L12 4.5 4 10Z" {...p} />
          <path d="M6 10.5V18M10 10.5V18M14 10.5V18M18 10.5V18" {...p} />
          <path d="M4.5 18.5h15" {...p} />
        </>
      );
    case 'vergiler':
      return (
        <>
          <path d="M7 4.5h8.5L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" {...p} />
          <path d="M15 4.5V7.5h3.5M8.5 11h7M8.5 14.5h5M8.5 18h3.5" {...p} />
        </>
      );
    case 'cari-stok':
      return (
        <>
          <path d="M4.5 9.5 12 4.8l7.5 4.7v8.2a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V9.5Z" {...p} />
          <path d="M12 4.8v14.4M4.5 9.5h15" {...p} />
        </>
      );
    case 'resmi-tatiller':
      return (
        <>
          <rect x="4" y="5.5" width="16" height="14.5" rx="2" {...p} />
          <path d="M8 3.5v4M16 3.5v4M4 10.5h16" {...p} />
          <circle cx="8.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="14" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    default:
      return <rect x="5" y="4" width="14" height="16" rx="2" {...p} />;
  }
}
