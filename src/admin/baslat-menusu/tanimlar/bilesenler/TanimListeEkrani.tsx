import type { ReactNode } from 'react';

interface TanimListeEkraniProps {
  onYeniEkle?: () => void;
  yeniEkleMetin?: string;
  children: ReactNode;
}

export function TanimListeEkrani({
  onYeniEkle,
  yeniEkleMetin = 'Yeni Ekle',
  children,
}: TanimListeEkraniProps) {
  return (
    <div className="ap-tanimlar-liste-ekran">
      {onYeniEkle ? (
        <div className="ap-tanimlar-liste-ekran-ust">
          <button type="button" className="ap-tanimlar-yeni-ekle" onClick={onYeniEkle}>
            <span aria-hidden>+</span>
            {yeniEkleMetin}
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
