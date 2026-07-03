import type { ReactNode } from 'react';

interface FormAlaniProps {
  etiket: string;
  aciklama?: string;
  children: ReactNode;
}

export function FormAlani({ etiket, aciklama, children }: FormAlaniProps) {
  return (
    <div>
      <label className="ap-heading mb-1.5 block text-sm font-medium">{etiket}</label>
      {aciklama && <p className="ap-muted mb-2 text-xs">{aciklama}</p>}
      {children}
    </div>
  );
}

export const formInputSinifi =
  'ap-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--ap-accent)] focus:ring-1 focus:ring-[var(--ap-accent)]';

export const formSelectSinifi = formInputSinifi;
