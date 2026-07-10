interface TanimKayitListesiProps<T extends { id: string }> {
  baslik: string;
  kayitlar: T[];
  seciliId: string | null;
  onSec: (k: T) => void;
  kodAlani: (k: T) => string;
  adAlani: (k: T) => string;
  aktifAlani?: (k: T) => boolean;
  altMetin?: (k: T) => string | undefined;
  bosMesaj?: string;
}

export function TanimKayitListesi<T extends { id: string }>({
  baslik,
  kayitlar,
  seciliId,
  onSec,
  kodAlani,
  adAlani,
  aktifAlani,
  altMetin,
  bosMesaj = 'Henüz kayıt yok',
}: TanimKayitListesiProps<T>) {
  return (
    <aside className="ap-sidebar-panel ap-kullanici-sidebar-panel">
      <div className="ap-sidebar-baslik">
        <h2 className="ap-heading text-sm font-semibold">
          {baslik} ({kayitlar.length})
        </h2>
      </div>
      <ul className="ap-scroll ap-sidebar-icerik ap-kullanici-sidebar-liste p-2">
        {kayitlar.length === 0 ? (
          <li className="ap-muted px-2 py-4 text-center text-sm">{bosMesaj}</li>
        ) : (
          kayitlar.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => onSec(k)}
                className={`ap-liste-oge ${seciliId === k.id ? 'ap-liste-oge-secili' : ''}`}
              >
                <span className="ap-heading font-medium">{adAlani(k)}</span>
                <span className="ap-muted mt-0.5 block text-xs">{kodAlani(k)}</span>
                {altMetin?.(k) && (
                  <span className="ap-muted mt-0.5 block text-[10px]">{altMetin(k)}</span>
                )}
                {aktifAlani && (
                  <span className="mt-1 flex flex-wrap gap-2 text-[10px]">
                    {!aktifAlani(k) && <span className="text-red-400">Pasif</span>}
                  </span>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
