import type { ReactNode } from 'react';

interface ModalSolBaslikProps {
  baslik: string;
  ikon: ReactNode;
  onKapat: () => void;
  kapatGoster?: boolean;
}

export function ModalSolBaslik({
  baslik,
  ikon,
  onKapat,
  kapatGoster = true,
}: ModalSolBaslikProps) {
  return (
    <header className="ap-modal-sol-baslik">
      <div className="ap-modal-sol-baslik-sol">
        <div className="ap-modal-sol-baslik-ikon" aria-hidden>
          {ikon}
        </div>
        <h3 className="ap-modal-sol-baslik-metin">{baslik}</h3>
      </div>
      {kapatGoster ? (
        <button
          type="button"
          className="ap-modal-kapat-pil"
          onClick={onKapat}
          aria-label="Kapat (Esc)"
          title="Kapat (Esc)"
        >
          ✕ ESC
        </button>
      ) : null}
    </header>
  );
}

export function ModalListeIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path d="M8 7h11M8 12h11M8 17h11" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M5 7h.01M5 12h.01M5 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ModalBarkodIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M4 6v12M7 6v12M10 4v16M13 7v10M16 5v14M19 8v8M22 6v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ModalAramaIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.1" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}
