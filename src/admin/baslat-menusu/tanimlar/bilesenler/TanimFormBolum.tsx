import type { ReactNode } from 'react';

interface TanimFormBolumProps {
  baslik: string;
  children: ReactNode;
  className?: string;
}

export function TanimFormBolum({ baslik, children, className }: TanimFormBolumProps) {
  return (
    <section className={`ap-tanimlar-bolum ${className ?? ''}`}>
      <h4 className="ap-tanimlar-bolum-baslik">{baslik}</h4>
      <div className="ap-tanimlar-bolum-icerik">{children}</div>
    </section>
  );
}
