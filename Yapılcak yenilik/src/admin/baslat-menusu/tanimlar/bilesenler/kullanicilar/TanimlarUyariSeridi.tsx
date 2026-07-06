import { useEffect, useState } from 'react';

interface TanimlarUyariSeridiProps {
  mesaj: string;
  /** ms sonra otomatik kapanır */
  sure?: number;
  onKapat: () => void;
}

export function TanimlarUyariSeridi({ mesaj, sure = 4200, onKapat }: TanimlarUyariSeridiProps) {
  const [gorunur, setGorunur] = useState(false);
  const [kapaniyor, setKapaniyor] = useState(false);

  useEffect(() => {
    const ac = requestAnimationFrame(() => setGorunur(true));
    const kapanisZamanlayici = window.setTimeout(() => setKapaniyor(true), sure - 380);
    const temizleZamanlayici = window.setTimeout(onKapat, sure);
    return () => {
      cancelAnimationFrame(ac);
      window.clearTimeout(kapanisZamanlayici);
      window.clearTimeout(temizleZamanlayici);
    };
  }, [sure, onKapat]);

  return (
    <div
      className={`ap-tanimlar-uyari-seridi ${gorunur && !kapaniyor ? 'ap-tanimlar-uyari-seridi-gorunur' : ''} ${kapaniyor ? 'ap-tanimlar-uyari-seridi-kapaniyor' : ''}`}
      role="alert"
    >
      <span className="ap-tanimlar-uyari-seridi-ikon" aria-hidden>
        !
      </span>
      <p className="ap-tanimlar-uyari-seridi-metin">{mesaj}</p>
      <button type="button" className="ap-tanimlar-uyari-seridi-kapat" onClick={onKapat} aria-label="Kapat">
        ×
      </button>
    </div>
  );
}
