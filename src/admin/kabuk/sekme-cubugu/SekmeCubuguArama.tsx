import { useEffect, useRef, useState } from 'react';
import { modulAra } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import type { SekmeAramaGorunum } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

interface SekmeCubuguAramaProps {
  gorunum: SekmeAramaGorunum;
  onModulSec: (modul: AdminModul) => void;
  konum?: 'ust' | 'alt';
}

export function SekmeCubuguArama({ gorunum, onModulSec, konum = 'ust' }: SekmeCubuguAramaProps) {
  const { t } = usePanelDil();
  const [acik, setAcik] = useState(gorunum === 'input');
  const [arama, setArama] = useState('');
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [odak, setOdak] = useState(false);
  const { aktifPrefixler } = useModulKatalog();
  const sonuclar = modulAra(arama, aktifPrefixler).slice(0, 8);
  const panelAcik =
    gorunum === 'input' ? odak || arama.trim().length > 0 : acik;

  useEffect(() => {
    if (gorunum === 'input') {
      setAcik(true);
      return;
    }
    setAcik(false);
    setArama('');
  }, [gorunum]);

  useEffect(() => {
    if (!panelAcik) return;
    const disariTikla = (e: MouseEvent) => {
      if (!kapsayiciRef.current?.contains(e.target as Node)) {
        if (gorunum === 'ikon') {
          setAcik(false);
          setArama('');
        } else {
          setAcik(false);
        }
      }
    };
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [panelAcik, gorunum]);

  function modulSec(modul: AdminModul) {
    onModulSec(modul);
    setArama('');
    setAcik(gorunum === 'input');
  }

  return (
    <div
      ref={kapsayiciRef}
      className={`ap-sekme-arama shrink-0 ${gorunum === 'input' ? 'ap-sekme-arama-input-mod' : 'ap-sekme-arama-ikon-mod'} ${
        konum === 'alt' ? 'ap-sekme-arama--alt' : 'ap-sekme-arama--ust'
      }`}
    >
      {gorunum === 'ikon' ? (
        <div className="ap-sekme-arama-ikon-satir">
          {acik && (
            <div className="ap-sekme-arama-ikon-giris">
              <input
                ref={inputRef}
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Modül ara..."
                className="ap-sekme-arama-input"
              />
            </div>
          )}
          <button
            type="button"
            className="ap-sekme-arama-ikon-btn"
            onClick={() => {
              setAcik((v) => !v);
              if (!acik) setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="Modül ara"
            aria-label="Modül ara"
            aria-expanded={acik}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="ap-sekme-arama-input-kutu">
          <span className="ap-sekme-arama-input-ikon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            onFocus={() => {
              setOdak(true);
              setAcik(true);
            }}
            onBlur={() => setOdak(false)}
            placeholder="Modül ara..."
            className="ap-sekme-arama-input"
          />
        </div>
      )}

      {gorunum === 'ikon' && acik && (
        <div className={`ap-sekme-arama-popup ${konum === 'alt' ? 'ap-sekme-arama-popup--alt' : ''}`}>
          <div className="ap-sekme-arama-popup-sonuclar">
            <AramaSonuclari sonuclar={sonuclar} arama={arama} onSec={modulSec} t={t} />
          </div>
        </div>
      )}

      {gorunum === 'input' && panelAcik && (
        <div className={`ap-sekme-arama-dropdown ${konum === 'alt' ? 'ap-sekme-arama-dropdown--alt' : ''}`}>
          <AramaSonuclari sonuclar={sonuclar} arama={arama} onSec={modulSec} t={t} />
        </div>
      )}
    </div>
  );
}

function AramaSonuclari({
  sonuclar,
  arama,
  onSec,
  t,
}: {
  sonuclar: AdminModul[];
  arama: string;
  onSec: (modul: AdminModul) => void;
  t: (anahtar: string, varsayilan: string) => string;
}) {
  if (!arama.trim()) {
    return <p className="ap-muted px-3 py-2 text-xs">Modül adı yazarak arayın</p>;
  }
  if (sonuclar.length === 0) {
    return <p className="ap-muted px-3 py-2 text-xs">Sonuç bulunamadı</p>;
  }
  return (
    <ul className="ap-sekme-arama-sonuc-listesi">
      {sonuclar.map((modul) => (
        <li key={modul.id}>
          <button type="button" className="ap-sekme-arama-sonuc" onMouseDown={(e) => e.preventDefault()} onClick={() => onSec(modul)}>
            <span className="text-base">{modul.ikon}</span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium">{t(`modul.${modul.id}`, modul.baslik)}</span>
              <span className="ap-muted block truncate text-[10px]">{modul.kategori}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
