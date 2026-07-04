import { type ReactNode } from 'react';
import { DonenMaviCerceve } from '@/admin/giris/DonenMaviCerceve';

interface GirisSosyalLinkProps {
  href: string;
  etiket: string;
  ikon: ReactNode;
  mobil?: boolean;
}

export function GirisSosyalLink({ href, etiket, ikon, mobil = false }: GirisSosyalLinkProps) {
  return (
    <DonenMaviCerceve className={mobil ? 'erp-giris-sosyal-donen-mobil' : 'erp-giris-sosyal-donen'}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={etiket}
        aria-label={etiket}
        className="erp-giris-sosyal-ikon"
      >
        {ikon}
      </a>
    </DonenMaviCerceve>
  );
}
