export type RehberIkonAd =
  | 'kullanici'
  | 'kilit'
  | 'duraklat'
  | 'onay'
  | 'palet'
  | 'kure'
  | 'baglanti'
  | 'kayit'
  | 'ara'
  | 'cetvel'
  | 'karistir'
  | 'pencere'
  | 'klavye'
  | 'kitap'
  | 'firma'
  | 'fatura'
  | 'kalem'
  | 'yildirim'
  | 'sube'
  | 'konum'
  | 'belge'
  | 'bina'
  | 'depo'
  | 'etiket'
  | 'para'
  | 'doviz'
  | 'takvim'
  | 'not'
  | 'klasor'
  | 'liste'
  | 'cop'
  | 'yildiz'
  | 'soru'
  | 'hesap'
  | 'fare'
  | 'kaydet'
  | 'indir'
  | 'ampul'
  | 'kasa';

function strokeProps(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: RehberIkonAd }) {
  const s = strokeProps();

  switch (ad) {
    case 'kullanici':
      return (
        <>
          <circle cx="12" cy="8" r="3.2" {...s} />
          <path d="M5.5 19.5c1.2-3.2 3.4-4.8 6.5-4.8s5.3 1.6 6.5 4.8" {...s} />
        </>
      );
    case 'kilit':
      return (
        <>
          <rect x="6" y="10.5" width="12" height="9" rx="2" {...s} />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...s} />
          <path d="M12 14v2.5" {...s} />
        </>
      );
    case 'duraklat':
      return (
        <>
          <rect x="7" y="6" width="3" height="12" rx="1" {...s} />
          <rect x="14" y="6" width="3" height="12" rx="1" {...s} />
        </>
      );
    case 'onay':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...s} />
          <path d="m8.2 12.2 2.6 2.6 5-5.2" {...s} />
        </>
      );
    case 'palet':
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
    case 'kure':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" {...s} />
          <path d="M3.8 12h16.4M12 3.8c2.4 2.6 2.4 13.8 0 16.4M12 3.8c-2.4 2.6-2.4 13.8 0 16.4" {...s} />
        </>
      );
    case 'baglanti':
      return (
        <>
          <path d="M9.5 14.5 7.2 16.8a3 3 0 0 1-4.2-4.2L7.2 8.4a3 3 0 0 1 4.2 0" {...s} />
          <path d="M14.5 9.5 16.8 7.2a3 3 0 0 1 4.2 4.2L16.8 15.6a3 3 0 0 1-4.2 0" {...s} />
          <path d="M9.8 14.2 14.2 9.8" {...s} />
        </>
      );
    case 'kayit':
      return (
        <>
          <path d="M7 4.5h8.5L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" {...s} />
          <path d="M14.5 4.5V7.5H17.5M9 11.5h6M9 15h4" {...s} />
        </>
      );
    case 'ara':
      return (
        <>
          <circle cx="11" cy="11" r="6.2" {...s} />
          <path d="m16 16 3.5 3.5" {...s} />
        </>
      );
    case 'cetvel':
      return (
        <>
          <path d="M4.5 15.5 15.5 4.5l4 4-11 11-4-4Z" {...s} />
          <path d="M8 12l1.5 1.5M10.5 9.5 12 11M13 7l1.5 1.5" {...s} />
        </>
      );
    case 'karistir':
      return (
        <>
          <path d="M5 8h5l3 4 3-4h3" {...s} />
          <path d="M16 5.5 18.5 8 16 10.5" {...s} />
          <path d="M5 16h5l1.5-2M14.5 14 16 16h2.5" {...s} />
          <path d="M16 13.5 18.5 16 16 18.5" {...s} />
        </>
      );
    case 'pencere':
      return (
        <>
          <rect x="4.5" y="5.5" width="15" height="13" rx="1.5" {...s} />
          <path d="M4.5 10h15M12 10v8.5" {...s} />
        </>
      );
    case 'klavye':
      return (
        <>
          <rect x="3.5" y="7" width="17" height="10" rx="2" {...s} />
          <path d="M7 10.5h.01M10 10.5h.01M13 10.5h.01M16 10.5h.01M8.5 13.5h7" {...s} />
        </>
      );
    case 'kitap':
      return (
        <>
          <path d="M5 5.5h5.5A2.5 2.5 0 0 1 13 8v11.5H7.5A2.5 2.5 0 0 1 5 17V5.5Z" {...s} />
          <path d="M19 5.5h-5.5A2.5 2.5 0 0 0 11 8v11.5h5.5A2.5 2.5 0 0 0 19 17V5.5Z" {...s} />
        </>
      );
    case 'firma':
      return (
        <>
          <path d="M4.5 20.5h15" {...s} />
          <path d="M6.5 20.5V7.5L12 4.5l5.5 3v13" {...s} />
          <path d="M9.5 10.5h1.5M13 10.5h1.5M9.5 14h1.5M13 14h1.5" {...s} />
          <path d="M10.5 20.5v-3.5h3v3.5" {...s} />
        </>
      );
    case 'fatura':
      return (
        <>
          <path d="M7 3.5h8l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...s} />
          <path d="M14 3.5V7h3.5M9 11h6M9 14.5h6M9 18h3.5" {...s} />
        </>
      );
    case 'kalem':
      return (
        <>
          <path d="m5 16.5 1.2-4.2L16.5 2l4.2 4.2L9.4 17.5 5 18.5l0-2Z" {...s} />
          <path d="m14.2 4.2 4.2 4.2" {...s} />
        </>
      );
    case 'yildirim':
      return <path d="M13 2 4.5 13.5h6.2L11 22l8.5-11.5h-6.2L13 2Z" {...s} />;
    case 'sube':
      return (
        <>
          <path d="M4.5 20.5h15" {...s} />
          <path d="M5.5 20.5V10.5h13v10" {...s} />
          <path d="M5.5 10.5 12 5.5l6.5 5" {...s} />
          <path d="M10.5 20.5v-4h3v4" {...s} />
        </>
      );
    case 'konum':
      return (
        <>
          <path d="M12 21s6.5-5.2 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.8 6.5 11 6.5 11Z" {...s} />
          <circle cx="12" cy="10" r="2.2" {...s} />
        </>
      );
    case 'belge':
      return (
        <>
          <path d="M7 3.5h7.5L18.5 7.5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...s} />
          <path d="M14 3.5V7.5h4M9 11.5h6M9 15h4.5" {...s} />
        </>
      );
    case 'bina':
      return (
        <>
          <path d="M4.5 20.5h15" {...s} />
          <path d="M6 20.5V8.5h5V20.5M11 20.5V5.5h7v15" {...s} />
          <path d="M8 11.5h1M8 14.5h1M13.5 9h1.5M13.5 12h1.5M13.5 15h1.5" {...s} />
        </>
      );
    case 'depo':
      return (
        <>
          <path d="M4.5 9.5 12 4.5l7.5 5v10.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V9.5Z" {...s} />
          <path d="M12 4.5v16M4.5 9.5h15" {...s} />
        </>
      );
    case 'etiket':
      return (
        <>
          <path d="M4.5 11.5V6.5A2 2 0 0 1 6.5 4.5h5l8 8-7 7-8-8Z" {...s} />
          <circle cx="8.2" cy="8.2" r="1.1" {...s} />
        </>
      );
    case 'para':
    case 'kasa':
      return (
        <>
          <rect x="4.5" y="6.5" width="15" height="11" rx="2" {...s} />
          <path d="M4.5 10.5h15" {...s} />
          <circle cx="12" cy="14" r="1.6" {...s} />
        </>
      );
    case 'doviz':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...s} />
          <path d="M12 7v10M9.5 9.5c.6-1 1.5-1.5 2.5-1.5 1.4 0 2.5.8 2.5 2s-1.1 2-2.5 2h-1c-1.4 0-2.5.8-2.5 2s1.1 2 2.5 2c1 0 1.9-.5 2.5-1.5" {...s} />
        </>
      );
    case 'takvim':
      return (
        <>
          <rect x="4.5" y="5.5" width="15" height="14" rx="2" {...s} />
          <path d="M4.5 10h15M9 3.5v4M15 3.5v4" {...s} />
          <path d="M8.5 13.5h2M13.5 13.5h2M8.5 16.5h2" {...s} />
        </>
      );
    case 'not':
      return (
        <>
          <path d="M7 4h8.5L19 7.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5.5A1.5 1.5 0 0 1 7 4Z" {...s} />
          <path d="M14.5 4v3.5H18M9 11h6M9 14.5h4" {...s} />
        </>
      );
    case 'klasor':
      return (
        <>
          <path d="M4.5 8.5V18a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 18V10a1.5 1.5 0 0 0-1.5-1.5h-6L10 6.5H6A1.5 1.5 0 0 0 4.5 8v.5Z" {...s} />
        </>
      );
    case 'liste':
      return (
        <>
          <path d="M9 7h10M9 12h10M9 17h10" {...s} />
          <path d="M5.5 7h.01M5.5 12h.01M5.5 17h.01" strokeWidth={2.6} stroke="currentColor" strokeLinecap="round" />
        </>
      );
    case 'cop':
      return (
        <>
          <path d="M5 8h14M9.5 8V6.5A1.5 1.5 0 0 1 11 5h2a1.5 1.5 0 0 1 1.5 1.5V8" {...s} />
          <path d="M7 8v11a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19V8" {...s} />
          <path d="M10 11.5v5M14 11.5v5" {...s} />
        </>
      );
    case 'yildiz':
      return (
        <path
          d="M12 3.5 13.5 9h5.7l-4.6 3.4 1.8 5.6L12 14.8 7.6 18l1.8-5.6L4.8 9h5.7L12 3.5Z"
          {...s}
        />
      );
    case 'soru':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" {...s} />
          <path d="M9.8 9.2a2.4 2.4 0 1 1 3.5 2.1c-.8.5-1.3 1-1.3 2" {...s} />
          <circle cx="12" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case 'hesap':
      return (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="2" {...s} />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" {...s} />
        </>
      );
    case 'fare':
      return (
        <>
          <rect x="8" y="3.5" width="8" height="13" rx="4" {...s} />
          <path d="M12 6.5v3M10 19.5h4M9 21.5h6" {...s} />
        </>
      );
    case 'kaydet':
      return (
        <>
          <path d="M5.5 4.5h10L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V6A1.5 1.5 0 0 1 5.5 4.5Z" {...s} />
          <path d="M8 4.5v4.5h7V4.5M8 20v-5.5h8V20" {...s} />
        </>
      );
    case 'indir':
      return (
        <>
          <path d="M12 4.5v10M8.5 11.5 12 15l3.5-3.5" {...s} />
          <path d="M5.5 18.5h13" {...s} />
        </>
      );
    case 'ampul':
      return (
        <>
          <path d="M9.5 17.5h5M10 19.5h4" {...s} />
          <path d="M9 15.5c-1.8-1.2-3-3.2-3-5.5a6 6 0 1 1 12 0c0 2.3-1.2 4.3-3 5.5H9Z" {...s} />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="7" {...s} />;
  }
}

/** Rehber modal kart / başlık ikonları — flat stroke SVG */
export function RehberIkon({
  ad,
  boyut = 16,
  className = '',
}: {
  ad: RehberIkonAd;
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
