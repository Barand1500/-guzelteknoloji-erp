import { useCallback, useEffect, useRef } from 'react';
import type { AdminSekme } from '@/admin/ortak/tipler/admin';
import type { SekmeSagTikIslem } from './sekmeSagTikYardimci';

export interface SekmeSagTikMenuDurum {
  x: number;
  y: number;
  sekmeId: string;
}

interface SekmeSagTikMenuProps {
  menu: SekmeSagTikMenuDurum | null;
  sekmeler: AdminSekme[];
  kapananGecmisSayisi: number;
  onKapat: () => void;
  onIslem: (sekmeId: string, islem: SekmeSagTikIslem) => void;
}

interface MenuOgesi {
  id: SekmeSagTikIslem;
  etiket: string;
  devreDisi?: boolean;
  ayiriciOnce?: boolean;
}

function SekmeSagTikIkon({ tip }: { tip: SekmeSagTikIslem }) {
  const ortak = { className: 'ap-sekme-sag-tik-ikon', viewBox: '0 0 16 16', 'aria-hidden': true as const };

  switch (tip) {
    case 'kapat':
      return (
        <svg {...ortak}>
          <rect x="2" y="3.5" width="12" height="9" rx="1.25" fill="none" stroke="currentColor" strokeWidth="1.15" />
          <path d="M9.5 6.25 11.75 8.5M11.75 6.25 9.5 8.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      );
    case 'digerleriniKapat':
      return (
        <svg {...ortak}>
          <rect x="1.5" y="5" width="4" height="7" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          <rect x="6" y="3.5" width="5" height="8" rx="0.9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.15" />
          <rect x="11.5" y="5" width="3" height="7" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          <path d="M8.25 6.25 10.25 8.25M10.25 6.25 8.25 8.25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <path d="M12.75 6.75 14.25 8.25M14.25 6.75 12.75 8.25" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case 'solundakileriKapat':
      return (
        <svg {...ortak}>
          <rect x="1.5" y="5" width="3.5" height="6.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <rect x="5.5" y="5.75" width="2.5" height="5.5" rx="0.65" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <rect x="8.5" y="3.5" width="5" height="8" rx="0.9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.15" />
          <path d="M2.75 7 4.25 8.5M4.25 7 2.75 8.5" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.55" />
          <path d="M6.25 12.5 8 10.75M8 12.5 6.25 10.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'saginiKapat':
      return (
        <svg {...ortak}>
          <rect x="1.5" y="3.5" width="5" height="8" rx="0.9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.15" />
          <rect x="8" y="5" width="3.5" height="6.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <rect x="12" y="5.75" width="2.5" height="5.5" rx="0.65" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <path d="M9.25 7 10.75 8.5M10.75 7 9.25 8.5" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.55" />
          <path d="M12.75 12.5 14.5 10.75M14.5 12.5 12.75 10.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'tumunuKapat':
      return (
        <svg {...ortak}>
          <rect x="2" y="4" width="4" height="7" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <rect x="6" y="3" width="4" height="7.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.65" />
          <rect x="10" y="4.5" width="3.5" height="6.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M3.5 6.25 4.75 7.5M4.75 6.25 3.5 7.5M7.5 5.25 8.75 6.5M8.75 5.25 7.5 6.5M11.25 6.75 12.5 8M12.5 6.75 11.25 8" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" />
        </svg>
      );
    case 'sonKapananlariGeriGetir':
      return (
        <svg {...ortak}>
          <path d="M3.5 8H11.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M5.5 5.5 3.5 8 5.5 10.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="8.5" y="4.5" width="4.5" height="7" rx="0.9" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

export function SekmeSagTikMenu({ menu, sekmeler, kapananGecmisSayisi, onKapat, onIslem }: SekmeSagTikMenuProps) {
  const kokRef = useRef<HTMLDivElement>(null);
  const hedefIdx = menu ? sekmeler.findIndex((s) => s.id === menu.sekmeId) : -1;
  const tekSekme = sekmeler.length <= 1;
  const soldaSekmeYok = hedefIdx <= 0;
  const sagdaSekmeYok = hedefIdx < 0 || hedefIdx >= sekmeler.length - 1;

  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    function tikla(e: MouseEvent) {
      if (!kokRef.current?.contains(e.target as Node)) kapat();
    }
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') kapat();
    }
    window.addEventListener('mousedown', tikla);
    window.addEventListener('keydown', tus);
    window.addEventListener('scroll', kapat, true);
    return () => {
      window.removeEventListener('mousedown', tikla);
      window.removeEventListener('keydown', tus);
      window.removeEventListener('scroll', kapat, true);
    };
  }, [kapat]);

  if (!menu) return null;

  const ogeler: MenuOgesi[] = [
    { id: 'kapat', etiket: 'Sekmeyi Kapat', devreDisi: tekSekme },
    { id: 'digerleriniKapat', etiket: 'Diğerlerini Kapat', devreDisi: tekSekme, ayiriciOnce: true },
    { id: 'solundakileriKapat', etiket: 'Solundakileri Kapat', devreDisi: soldaSekmeYok },
    { id: 'saginiKapat', etiket: 'Sağındakileri Kapat', devreDisi: sagdaSekmeYok },
    { id: 'tumunuKapat', etiket: 'Tümünü Kapat', devreDisi: tekSekme, ayiriciOnce: true },
    {
      id: 'sonKapananlariGeriGetir',
      etiket: 'Son kapanan 3 sekmeyi geri getir',
      devreDisi: kapananGecmisSayisi === 0,
      ayiriciOnce: true,
    },
  ];

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuSol = Math.min(menu.x, vw - 220);
  const menuUst = Math.min(menu.y, vh - 200);

  return (
    <div
      ref={kokRef}
      className="ap-sag-tik-menu ap-sekme-sag-tik-menu"
      style={{ top: menuUst, left: menuSol }}
      role="menu"
    >
      {ogeler.map((oge) => (
        <div key={oge.id}>
          {oge.ayiriciOnce && <div className="ap-sag-tik-ayirici" role="separator" />}
          <button
            type="button"
            className="ap-sag-tik-oge"
            disabled={oge.devreDisi}
            onClick={() => {
              onIslem(menu.sekmeId, oge.id);
              kapat();
            }}
          >
            <span className="ap-sekme-sag-tik-ikon-wrap">
              <SekmeSagTikIkon tip={oge.id} />
            </span>
            <span>{oge.etiket}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
