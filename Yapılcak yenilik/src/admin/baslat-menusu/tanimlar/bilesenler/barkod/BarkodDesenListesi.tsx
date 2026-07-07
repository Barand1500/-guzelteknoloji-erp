import { formInputSinifi } from '@/formlar/FormAlani';
import { desenParcala } from '@/admin/baslat-menusu/tanimlar/barkod/barkodTipler';

interface BarkodDesenListesiProps {
  desenler: string[];
  seciliIndex: number | null;
  onSec: (index: number) => void;
  onDesenDegistir: (index: number, deger: string) => void;
}

function DesenOnizleme({ desen }: { desen: string }) {
  if (!desen.trim()) return null;
  const parcalar = desenParcala(desen);
  return (
    <div className="ap-tanimlar-barkod-onizleme" aria-hidden>
      {parcalar.map((p, i) => (
        <span
          key={`${p.metin}-${i}`}
          className={`ap-tanimlar-barkod-onizleme-parca ap-tanimlar-barkod-chip-${p.tip === 'sabit' ? 'sabit' : p.tip}`}
        >
          {p.metin}
        </span>
      ))}
    </div>
  );
}

export function BarkodDesenListesi({
  desenler,
  seciliIndex,
  onSec,
  onDesenDegistir,
}: BarkodDesenListesiProps) {
  return (
    <div className="ap-tanimlar-barkod-liste-wrap">
      <div className="ap-tanimlar-barkod-liste-baslik">
        <h4>Barkod Desenleri</h4>
        <p className="ap-muted text-xs">Her satır bir barkod formatı tanımlar.</p>
      </div>

      <ul className="ap-tanimlar-barkod-liste">
        {desenler.length === 0 ? (
          <li className="ap-tanimlar-barkod-bos">Henüz desen yok. Alt çubuktan yeni ekleyin.</li>
        ) : (
          desenler.map((desen, index) => {
            const secili = seciliIndex === index;
            return (
              <li
                key={index}
                className={`ap-tanimlar-barkod-satir ${secili ? 'ap-tanimlar-barkod-satir-secili' : ''}`}
                onClick={() => onSec(index)}
              >
                <span className="ap-tanimlar-barkod-satir-no">{index + 1}</span>
                <div className="ap-tanimlar-barkod-satir-icerik">
                  <input
                    type="text"
                    className={`${formInputSinifi} ap-tanimlar-barkod-input`}
                    value={desen}
                    onChange={(e) => onDesenDegistir(index, e.target.value.toUpperCase())}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Örn. 27BBBBBGGGGGC"
                    spellCheck={false}
                    aria-label={`Barkod deseni ${index + 1}`}
                  />
                  <DesenOnizleme desen={desen} />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
