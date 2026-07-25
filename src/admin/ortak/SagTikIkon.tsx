import type { SagTikOgeId } from '@/admin/ortak/tipler/sagTikPaneli';

export type SagTikIkonAd =
  | Exclude<SagTikOgeId, 'ayirici1' | 'ayirici2'>
  | 'satirEkle'
  | 'satirDuzenle'
  | 'satirCogalt'
  | 'panoyaKopyala'
  | 'csvDisa'
  | 'degeriYay'
  | 'satirSil'
  | 'seciliSil'
  | 'sayfaBoyutu'
  | 'cizgi'
  | 'formul'
  | 'sutunGorunurluk'
  | 'aktifYap'
  | 'pasifYap'
  | 'disaAktar'
  | 'secimiTemizle'
  | 'ust'
  | 'alt'
  | 'isaret'
  | 'nokta';

interface SagTikIkonProps {
  ad: SagTikIkonAd;
  className?: string;
}

/** Sağ tık menüleri için düz (flat) SVG ikonlar */
export function SagTikIkon({ ad, className = '' }: SagTikIkonProps) {
  const ortak = {
    className: `ap-sag-tik-svg ${className}`.trim(),
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  };

  switch (ad) {
    case 'kopyala':
    case 'panoyaKopyala':
      return (
        <svg {...ortak}>
          <rect x="5.5" y="2.5" width="7.5" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M3 5.25h-.25A1.25 1.25 0 0 0 1.5 6.5v6.25A1.25 1.25 0 0 0 2.75 14h6.5A1.25 1.25 0 0 0 10.5 12.75V12"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'kes':
      return (
        <svg {...ortak}>
          <circle cx="4.25" cy="4.25" r="1.6" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="4.25" cy="11.75" r="1.6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5.5 5.2 13 12.5M5.5 10.8 13 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'yapistir':
      return (
        <svg {...ortak}>
          <path
            d="M5.5 3.25h1.1A1.4 1.4 0 0 1 8 2.1a1.4 1.4 0 0 1 1.4 1.15H10.5A1.5 1.5 0 0 1 12 4.75v8.5A1.5 1.5 0 0 1 10.5 14.75h-5A1.5 1.5 0 0 1 4 13.25v-8.5A1.5 1.5 0 0 1 5.5 3.25Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M6.5 7.5h3M6.5 10h3" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      );
    case 'tumunuSec':
      return (
        <svg {...ortak}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5 8.1 7 10.1 11.2 5.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'moduller':
      return (
        <svg {...ortak}>
          <path
            d="M6.2 2.4h3.6c.7 0 1.3.6 1.3 1.3v1.1h1.1c.7 0 1.3.6 1.3 1.3v3.6c0 .7-.6 1.3-1.3 1.3h-1.1v1.1c0 .7-.6 1.3-1.3 1.3H6.2c-.7 0-1.3-.6-1.3-1.3v-1.1H3.8c-.7 0-1.3-.6-1.3-1.3V6.1c0-.7.6-1.3 1.3-1.3h1.1V3.7c0-.7.6-1.3 1.3-1.3Z"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'kaydet':
      return (
        <svg {...ortak}>
          <path
            d="M3.25 2.75h8.1L13 4.5v8.75a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M5.25 2.75v3.5h5.2V2.75M5.25 13.25v-3.4h5.5v3.4" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
        </svg>
      );
    case 'guncelle':
      return (
        <svg {...ortak}>
          <path
            d="M3.5 7.2a4.5 4.5 0 0 1 7.7-2.7L13 6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13 3.25V6H10.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M12.5 8.8a4.5 4.5 0 0 1-7.7 2.7L3 10"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 12.75V10h2.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'tema':
      return (
        <svg {...ortak}>
          <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 2.75a5.25 5.25 0 0 0 0 10.5Z" fill="currentColor" fillOpacity="0.35" />
        </svg>
      );
    case 'satirDuzenle':
      return (
        <svg {...ortak}>
          <path
            d="m3 11.75.45-2.25 6.7-6.7a1.15 1.15 0 0 1 1.63 0l1.42 1.42a1.15 1.15 0 0 1 0 1.63l-6.7 6.7-2.25.45L3 11.75Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m9.25 3.7 3.05 3.05M3.45 9.5l3.05 3.05" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 'satirEkle':
      return (
        <svg {...ortak}>
          <path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case 'satirCogalt':
      return (
        <svg {...ortak}>
          <rect x="5" y="3" width="8" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M3.5 5.5h-.25A1.25 1.25 0 0 0 2 6.75v5.75A1.25 1.25 0 0 0 3.25 13.75H9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'aktifYap':
      return (
        <svg {...ortak}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5.2 8.1 7.1 10 10.8 6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pasifYap':
      return (
        <svg {...ortak}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M6.4 5.5v5M9.6 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'secimiTemizle':
      return (
        <svg {...ortak}>
          <path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'sayfaBoyutu':
      return (
        <svg {...ortak}>
          <path
            d="M4 2.75h5.4L12.5 6v7.25A1 1 0 0 1 11.5 14.25h-7A1 1 0 0 1 3.5 13.25V3.75a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M9.2 2.9V6H12.2M5.5 8.5h5M5.5 11h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cizgi':
      return (
        <svg {...ortak}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M2 6.5h12M2 9.5h12M6 3v10M10 3v10" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        </svg>
      );
    case 'sutunGorunurluk':
      return (
        <svg {...ortak}>
          <rect x="2.5" y="3" width="3" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
          <rect x="6.75" y="3" width="3" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="3" width="2.5" height="10" rx="0.75" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
        </svg>
      );
    case 'satirSil':
    case 'seciliSil':
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
    case 'csvDisa':
    case 'disaAktar':
      return (
        <svg {...ortak}>
          <path d="M8 2.5v7M5.5 7 8 9.5 10.5 7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.5 12.5h9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case 'degeriYay':
      return (
        <svg {...ortak}>
          <path d="M8 3v10M5.25 5.5 8 3l2.75 2.5M5.25 10.5 8 13l2.75-2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'formul':
      return (
        <svg {...ortak}>
          <path d="M4.5 3.5h7M6.2 3.5 4.5 12.5h2.2M9.2 7.2h3.2M9.2 10.8h3.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'ust':
      return (
        <svg {...ortak}>
          <path d="M8 12.5V4M5.25 6.5 8 4l2.75 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'alt':
      return (
        <svg {...ortak}>
          <path d="M8 3.5v8.5M5.25 9.5 8 12l2.75-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'isaret':
      return (
        <svg {...ortak}>
          <path d="M4.2 8.2 6.7 10.7 11.8 5.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'nokta':
      return (
        <svg {...ortak}>
          <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...ortak}>
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
}
