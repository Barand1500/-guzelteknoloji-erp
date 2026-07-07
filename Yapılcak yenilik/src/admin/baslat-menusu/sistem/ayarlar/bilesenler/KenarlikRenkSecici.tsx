import { useRef, useState } from 'react';
import {
  hexRenkGecerli,
  KENARLIK_RENK_SECENEKLERI,
  kenarlikAyariNormalize,
  kenarlikRenkYayinla,
  type KenarlikRenkAyari,
} from '@/admin/baslat-menusu/sistem/ayarlar/kenarlikRenkYardimci';
import { OzelRenkPaneli } from './OzelRenkPaneli';

interface KenarlikRenkSeciciProps {
  kenarlikRenk: string;
  kenarlikNeon: boolean;
  onChange: (ayar: KenarlikRenkAyari) => void;
}

function RenkNoktasi({
  secili,
  renk,
  etiket,
  onClick,
}: {
  secili: boolean;
  renk: string;
  etiket: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={secili}
      aria-label={etiket}
      title={etiket}
      onClick={onClick}
      className={`h-9 w-9 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ap-accent)] ${
        secili ? 'ring-2 ring-[var(--ap-accent)] ring-offset-2 ring-offset-[var(--ap-surface)]' : ''
      }`}
      style={{ backgroundColor: renk }}
    />
  );
}

export function KenarlikRenkSecici({ kenarlikRenk, kenarlikNeon, onChange }: KenarlikRenkSeciciProps) {
  const ozelMi = kenarlikRenk !== 'mavi' && kenarlikRenk !== 'turuncu';
  const [ozelHex, setOzelHex] = useState(() =>
    ozelMi && hexRenkGecerli(kenarlikRenk) ? kenarlikRenk : '#FF6000'
  );
  const [panelAcik, setPanelAcik] = useState(false);
  const ozelBtnRef = useRef<HTMLButtonElement>(null);

  const uygula = (parca: Partial<KenarlikRenkAyari>) => {
    const ayar = kenarlikAyariNormalize({ renk: kenarlikRenk, neon: kenarlikNeon, ...parca });
    onChange(ayar);
    kenarlikRenkYayinla(ayar);
  };

  const ozelRenk = ozelMi && hexRenkGecerli(kenarlikRenk) ? kenarlikRenk : ozelHex;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex items-center gap-2.5" role="radiogroup" aria-label="Kenarlık rengi">
        {KENARLIK_RENK_SECENEKLERI.map((secenek) => (
          <RenkNoktasi
            key={secenek.id}
            secili={kenarlikRenk === secenek.id}
            renk={secenek.renk}
            etiket={secenek.ad}
            onClick={() => {
              setPanelAcik(false);
              uygula({ renk: secenek.id });
            }}
          />
        ))}

        <button
          ref={ozelBtnRef}
          type="button"
          role="radio"
          aria-checked={ozelMi || panelAcik}
          aria-expanded={panelAcik}
          aria-label="Özel renk"
          title="Özel renk seç"
          onClick={() => setPanelAcik((v) => !v)}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ap-accent)] ${
            ozelMi || panelAcik
              ? 'ring-2 ring-[var(--ap-accent)] ring-offset-2 ring-offset-[var(--ap-surface)]'
              : ''
          }`}
          style={
            ozelMi || panelAcik
              ? { backgroundColor: ozelRenk }
              : {
                  background:
                    'conic-gradient(from 180deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)',
                }
          }
        >
          {!ozelMi && !panelAcik && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ap-surface)] text-[10px] font-bold text-[var(--ap-text-muted)]">
              +
            </span>
          )}
        </button>

        <OzelRenkPaneli
          acik={panelAcik}
          onKapat={() => setPanelAcik(false)}
          renk={ozelRenk}
          capRef={ozelBtnRef}
          onRenkChange={(hex) => {
            setOzelHex(hex);
            uygula({ renk: hex });
          }}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={kenarlikNeon}
          aria-label="Neon efekt"
          onClick={() => uygula({ neon: !kenarlikNeon })}
          className={`ap-toggle ap-kenarlik-neon-toggle${kenarlikNeon ? ' ap-toggle-on' : ''}`}
        >
          <span className="ap-toggle-thumb" />
        </button>
        <span className="text-xs text-[var(--ap-text-muted)]">Neon</span>
      </label>
    </div>
  );
}
