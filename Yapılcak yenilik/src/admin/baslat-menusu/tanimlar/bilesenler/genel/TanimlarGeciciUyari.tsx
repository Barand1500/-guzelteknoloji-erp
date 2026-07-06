import { useEffect, useState } from 'react';

interface TanimlarGeciciUyariProps {
  mesaj: string | null;
  onTemizle: () => void;
  sureMs?: number;
}

export function TanimlarGeciciUyari({ mesaj, onTemizle, sureMs = 4500 }: TanimlarGeciciUyariProps) {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    if (!mesaj) {
      setGorunur(false);
      return;
    }
    setGorunur(true);
    const timer = setTimeout(() => {
      setGorunur(false);
      onTemizle();
    }, sureMs);
    return () => clearTimeout(timer);
  }, [mesaj, onTemizle, sureMs]);

  if (!mesaj || !gorunur) return null;

  return (
    <div className="ap-tanimlar-gecici-uyari" role="alert">
      {mesaj}
    </div>
  );
}
