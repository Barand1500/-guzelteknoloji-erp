import type { CSSProperties } from 'react';

/** Başlat menüsü / sekme çubuğu için düz (flat) stroke SVG ikonlar */

export type BaslatMenuIkonAd =
  | 'musteri-ajans'
  | 'sistem'
  | 'tanimlar'
  | 'erp'
  | 'datagrid'
  | 'kullanicilar'
  | 'erisim'
  | 'matris'
  | 'roller'
  | 'ayarlar'
  | 'sekme-yonetimi'
  | 'kisayol-ayarlari'
  | 'datagrid-demo'
  | 'tanimlar-modul'
  | 'cari'
  | 'stoklar'
  | 'banka-anlasmalari'
  | 'belgeler'
  | 'alis-faturasi'
  | 'satis-faturasi'
  | 'ozel-tanimlar'
  | 'loglar'
  | 'veri-yedekleme'
  | 'yapilacaklar'
  | 'varsayilan';

export const KATEGORI_FLAT_IKON: Record<string, BaslatMenuIkonAd> = {
  'Müşteri / Ajans': 'musteri-ajans',
  Sistem: 'sistem',
  Tanımlar: 'tanimlar',
  ERP: 'erp',
  Datagrid: 'datagrid',
};

export const MODUL_FLAT_IKON: Record<string, BaslatMenuIkonAd> = {
  kullanicilar: 'kullanicilar',
  roller: 'roller',
  ayarlar: 'ayarlar',
  'sekme-yonetimi': 'sekme-yonetimi',
  'kisayol-ayarlari': 'kisayol-ayarlari',
  'datagrid-demo': 'datagrid-demo',
  tanimlar: 'tanimlar-modul',
  cari: 'cari',
  stoklar: 'stoklar',
  'banka-anlasmalari': 'banka-anlasmalari',
  belgeler: 'belgeler',
  'alis-faturasi': 'belgeler',
  'satis-faturasi': 'belgeler',
  'ozel-tanimlar': 'ozel-tanimlar',
  loglar: 'loglar',
  'veri-yedekleme': 'veri-yedekleme',
  yapilacaklar: 'yapilacaklar',
};

function kategoriIkonAd(kategori: string): BaslatMenuIkonAd {
  return KATEGORI_FLAT_IKON[kategori] ?? 'varsayilan';
}

function modulIkonAd(modulId: string): BaslatMenuIkonAd {
  return MODUL_FLAT_IKON[modulId] ?? 'varsayilan';
}

interface BaslatMenuIkonProps {
  ad?: BaslatMenuIkonAd;
  kategori?: string;
  modulId?: string;
  className?: string;
  style?: CSSProperties;
  boyut?: number;
}

export function BaslatMenuIkon({
  ad,
  kategori,
  modulId,
  className = '',
  style,
  boyut = 20,
}: BaslatMenuIkonProps) {
  const ikonAd =
    ad ?? (modulId ? modulIkonAd(modulId) : kategori ? kategoriIkonAd(kategori) : 'varsayilan');

  return (
    <svg
      className={`ap-baslat-flat-ikon ${className}`.trim()}
      width={boyut}
      height={boyut}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={style}
    >
      <IkonYollari ad={ikonAd} />
    </svg>
  );
}

function strokeProps(sw = 1.7) {
  return {
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IkonYollari({ ad }: { ad: BaslatMenuIkonAd }) {
  const s = strokeProps();

  switch (ad) {
    case 'musteri-ajans':
    case 'kullanicilar':
      return (
        <>
          <circle cx="9" cy="8" r="3.2" {...s} />
          <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" {...s} />
          <circle cx="16.5" cy="8.5" r="2.4" {...s} />
          <path d="M15.2 14.2c1.9.3 3.4 1.5 4.1 3.8" {...s} />
        </>
      );
    case 'sistem':
      return (
        <>
          <rect x="3.5" y="5" width="17" height="11.5" rx="1.8" {...s} />
          <path d="M8.5 19h7M12 16.5V19" {...s} />
        </>
      );
    case 'ayarlar':
      return (
        <>
          <circle cx="12" cy="12" r="3" {...s} />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z"
            {...s}
          />
        </>
      );
    case 'ozel-tanimlar':
      return (
        <>
          <path d="M5 8h10M5 12h14M5 16h8" {...s} />
          <circle cx="17.5" cy="8" r="2" {...s} />
          <circle cx="11" cy="12" r="2" {...s} />
          <circle cx="15" cy="16" r="2" {...s} />
        </>
      );
    case 'tanimlar':
    case 'tanimlar-modul':
      return (
        <>
          <path d="M5 7.5h14v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V7.5Z" {...s} />
          <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" {...s} />
        </>
      );
    case 'erp':
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.2" {...s} />
          <rect x="13" y="4" width="7" height="7" rx="1.2" {...s} />
          <rect x="4" y="13" width="7" height="7" rx="1.2" {...s} />
          <rect x="13" y="13" width="7" height="7" rx="1.2" {...s} />
        </>
      );
    case 'datagrid':
    case 'datagrid-demo':
      return (
        <>
          <path d="M4 19.5h16" {...s} />
          <path d="M7 17V10M12 17V6.5M17 17v-4.5" {...s} />
        </>
      );
    case 'erisim':
      return (
        <>
          <circle cx="8" cy="12" r="3.8" {...s} />
          <circle cx="8" cy="12" r="1.25" {...s} />
          <path d="M11.6 12H20" {...s} />
          <path d="M17.5 12v2.8M20 12v1.8" {...s} />
        </>
      );
    case 'matris':
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="1.8" {...s} />
          <path d="M4 10h16M4 16h16M10 4v16M16 4v16" {...s} />
        </>
      );
    case 'roller':
      return (
        <>
          <rect x="6.5" y="10.5" width="11" height="9" rx="1.5" {...s} />
          <path d="M9 10.5V8a3 3 0 0 1 6 0v2.5" {...s} />
          <circle cx="12" cy="15" r="1.2" {...s} />
        </>
      );
    case 'sekme-yonetimi':
      return (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" {...s} />
          <path d="M3.5 9.5h17M10 5.5v4" {...s} />
        </>
      );
    case 'kisayol-ayarlari':
      return (
        <>
          <rect x="3" y="7" width="18" height="11" rx="2" {...s} />
          <path d="M6.5 10.5h2M11 10.5h2M15.5 10.5h2M6.5 14h11" {...s} />
        </>
      );
    case 'cari':
      return (
        <>
          <rect x="5" y="4" width="14" height="16" rx="1.8" {...s} />
          <circle cx="12" cy="9.5" r="2.2" {...s} />
          <path d="M8.5 16.5c.7-1.8 2-2.7 3.5-2.7s2.8.9 3.5 2.7" {...s} />
        </>
      );
    case 'stoklar':
      return (
        <>
          <path d="M4.5 10.5 12 4.8l7.5 5.7v7a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8v-7Z" {...s} />
          <circle cx="12" cy="12.5" r="1.6" {...s} />
        </>
      );
    case 'banka-anlasmalari':
      return (
        <>
          <path d="M4 10h16L12 4.5 4 10Z" {...s} />
          <path d="M6 10.5V18M10 10.5V18M14 10.5V18M18 10.5V18" {...s} />
          <path d="M4.5 18.5h15" {...s} />
        </>
      );
    case 'belgeler':
    case 'alis-faturasi':
    case 'satis-faturasi':
      return (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="1.8" {...s} />
          <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" {...s} />
        </>
      );
    case 'loglar':
      return (
        <>
          <path d="M7 4.5h8.5L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" {...s} />
          <path d="M15 4.5V7.5h3.5M8.5 11.5h7M8.5 15h5" {...s} />
        </>
      );
    case 'veri-yedekleme':
      return (
        <>
          <path d="M7 7.5a5 5 0 0 1 9.7-1.2A3.8 3.8 0 0 1 17.5 18.5H8A4 4 0 0 1 7 7.5Z" {...s} />
          <path d="M12 11v5.5M9.5 14.5 12 17l2.5-2.5" {...s} />
        </>
      );
    case 'yapilacaklar':
      return (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...s} />
          <path d="M8 12.2 10.4 14.6 16 9" {...s} />
        </>
      );
    default:
      return <rect x="5" y="4" width="14" height="16" rx="2" {...s} />;
  }
}
