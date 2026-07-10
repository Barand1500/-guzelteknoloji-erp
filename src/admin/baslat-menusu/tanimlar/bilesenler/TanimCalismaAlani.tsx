import type { ReactNode } from 'react';

interface TanimCalismaAlaniProps {
  children: ReactNode;
  ust?: ReactNode;
}

export function TanimCalismaAlani({ children, ust }: TanimCalismaAlaniProps) {
  return (
    <div className="ap-tanimlar-calisma">
      {ust ? <div className="ap-tanimlar-calisma-ust">{ust}</div> : null}
      <div className="ap-tanimlar-calisma-grid">{children}</div>
    </div>
  );
}
