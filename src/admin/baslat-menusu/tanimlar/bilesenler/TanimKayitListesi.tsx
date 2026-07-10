import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

interface TanimKayitListesiProps<T extends { id: string }> {
  baslik: string;
  kayitlar: T[];
  seciliId: string | null;
  onSec: (k: T) => void;
  kodAlani: (k: T) => string;
  adAlani: (k: T) => string;
  pasifAlani?: (k: T) => boolean;
  altMetin?: (k: T) => string | undefined;
  bosMesaj?: string;
  listeFiltresi?: ReactNode;
}

export function TanimKayitListesi<T extends { id: string }>({
  baslik,
  kayitlar,
  seciliId,
  onSec,
  kodAlani,
  adAlani,
  pasifAlani,
  altMetin,
  bosMesaj = 'Henüz kayıt yok',
  listeFiltresi,
}: TanimKayitListesiProps<T>) {
  const [arama, setArama] = useState('');

  const filtrelenmis = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return kayitlar;
    return kayitlar.filter((k) => {
      const kod = kodAlani(k).toLocaleLowerCase('tr');
      const ad = adAlani(k).toLocaleLowerCase('tr');
      const alt = altMetin?.(k)?.toLocaleLowerCase('tr') ?? '';
      return kod.includes(q) || ad.includes(q) || alt.includes(q);
    });
  }, [arama, kayitlar, kodAlani, adAlani, altMetin]);

  return (
    <aside className="ap-tanimlar-liste">
      <div className="ap-tanimlar-liste-baslik">
        <div className="ap-tanimlar-liste-baslik-ust">
          <h3>{baslik}</h3>
          <span className="ap-tanimlar-liste-sayi" aria-label={`${kayitlar.length} kayıt`}>
            {kayitlar.length}
          </span>
        </div>
        <input
          type="search"
          className="ap-tanimlar-liste-arama"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ara…"
          aria-label={`${baslik} içinde ara`}
        />
        {listeFiltresi ? <div className="ap-tanimlar-liste-filtre">{listeFiltresi}</div> : null}
      </div>
      <ul className="ap-tanimlar-liste-icerik ap-scroll">
        {filtrelenmis.length === 0 ? (
          <li className="ap-tanimlar-liste-bos">
            {kayitlar.length === 0 ? bosMesaj : 'Arama sonucu bulunamadı'}
          </li>
        ) : (
          filtrelenmis.map((k) => {
            const pasif = pasifAlani?.(k) ?? false;
            return (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => onSec(k)}
                className={`ap-tanimlar-liste-oge ${seciliId === k.id ? 'ap-tanimlar-liste-oge-secili' : ''} ${pasif ? 'ap-tanimlar-liste-oge--pasif' : ''}`}
              >
                <div className="ap-tanimlar-liste-oge-ust">
                  <span className="ap-tanimlar-liste-oge-ad">{adAlani(k)}</span>
                  <span className="ap-tanimlar-liste-oge-kod">{kodAlani(k)}</span>
                </div>
                {altMetin?.(k) ? (
                  <span className="ap-tanimlar-liste-oge-alt">{altMetin(k)}</span>
                ) : null}
                {pasif ? (
                  <span className="ap-tanimlar-liste-oge-etiket">Pasif</span>
                ) : null}
              </button>
            </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
