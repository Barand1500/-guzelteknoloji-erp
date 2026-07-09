import { type CSSProperties, type ReactNode } from 'react';
import { DonenMaviCerceve } from '@/admin/giris/DonenMaviCerceve';

interface DonenAccentCerceveProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Ayarlardaki --ap-accent rengiyle sürekli dönen modal kenarlığı */
export function DonenAccentCerceve({ children, className = '', style }: DonenAccentCerceveProps) {
  return (
    <DonenMaviCerceve
      surekli
      className={['ap-accent-donen-cerceve', className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </DonenMaviCerceve>
  );
}
