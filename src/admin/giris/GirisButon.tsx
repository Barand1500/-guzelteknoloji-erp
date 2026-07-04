import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type GirisButonVaryant = 'birincil' | 'ikincil';

interface GirisButonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  varyant?: GirisButonVaryant;
  yukleniyor?: boolean;
  children: ReactNode;
}

export function GirisButon({
  varyant = 'birincil',
  yukleniyor = false,
  disabled,
  className = '',
  children,
  ...props
}: GirisButonProps) {
  const pasif = disabled || yukleniyor;

  return (
    <button
      {...props}
      disabled={pasif}
      className={[
        'erp-giris-btn',
        `erp-giris-btn-${varyant}`,
        yukleniyor ? 'erp-giris-btn-yukleniyor' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="erp-giris-btn-icerik">{children}</span>
      {yukleniyor && <span className="erp-giris-btn-spinner" aria-hidden />}
      <span className="erp-giris-btn-dalga" aria-hidden />
    </button>
  );
}
