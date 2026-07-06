interface SanalKlavyeProps {
  acik: boolean;
  onKapat: () => void;
  onTus: (tus: string) => void;
  onSil: () => void;
  onTemizle: () => void;
  onEnter: () => void;
}

const SATIRLAR = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '.', ','],
] as const;

export function SanalKlavye({ acik, onKapat, onTus, onSil, onTemizle, onEnter }: SanalKlavyeProps) {
  if (!acik) return null;

  return (
    <div className="ap-cari-sanal-klavye" role="dialog" aria-label="Sanal klavye">
      <div className="ap-cari-sanal-klavye-govde">
        <div className="ap-cari-sanal-klavye-ana">
          {SATIRLAR.map((satir, satirIdx) => (
            <div key={satirIdx} className="ap-cari-sanal-klavye-satir">
              {satir.map((tus) => (
                <button
                  key={tus}
                  type="button"
                  className="ap-cari-sanal-klavye-tus"
                  onClick={() => onTus(tus)}
                >
                  {tus}
                </button>
              ))}
              {satirIdx === 0 && (
                <button type="button" className="ap-cari-sanal-klavye-tus ap-cari-sanal-klavye-sil" onClick={onSil}>
                  ←
                </button>
              )}
            </div>
          ))}
          <div className="ap-cari-sanal-klavye-satir ap-cari-sanal-klavye-alt-satir">
            <button type="button" className="ap-cari-sanal-klavye-tus ap-cari-sanal-klavye-bosluk" onClick={() => onTus(' ')}>
              Boşluk
            </button>
            <button type="button" className="ap-cari-sanal-klavye-tus ap-cari-sanal-klavye-temizle" onClick={onTemizle}>
              SİL
            </button>
          </div>
        </div>
        <div className="ap-cari-sanal-klavye-yan">
          <button type="button" className="ap-cari-sanal-klavye-enter" onClick={onEnter}>
            ENTER
          </button>
          <button type="button" className="ap-cari-sanal-klavye-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
