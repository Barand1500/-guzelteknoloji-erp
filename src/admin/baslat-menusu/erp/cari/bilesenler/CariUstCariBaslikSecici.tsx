import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { AdminCari } from '../tipler';

const KENAR_BOSLUK = 8;
const LISTE_LIMIT = 14;

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function normalizeMetin(metin: string) {
  return metin.trim().toLocaleLowerCase('tr');
}

function listeKonumuHesapla(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const genislik = Math.max(rect.width, 320);
  let left = rect.left;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  const ust = rect.bottom + 4;
  const maxHeight = Math.max(160, window.innerHeight - ust - KENAR_BOSLUK);
  return { top: ust, left, width: genislik, maxHeight };
}

export function CariUstCariBaslikSecici({
  ustId,
  onChange,
  cariler,
  haricId,
  disabled = false,
}: {
  ustId: string;
  onChange: (ustId: string) => void;
  cariler: AdminCari[];
  haricId?: string | null;
  disabled?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const tusRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [arama, setArama] = useState('');
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const secili = useMemo(
    () => (ustId ? cariler.find((c) => c.id === ustId) ?? null : null),
    [cariler, ustId]
  );

  const adaylar = useMemo(() => {
    const q = normalizeMetin(arama);
    const taban = cariler.filter((c) => c.id !== haricId && c.aktif);
    if (!q) return taban.slice(0, LISTE_LIMIT);
    return taban
      .filter((c) => {
        const alanlar = [c.cariKodu, c.cariAdi, c.unvan];
        return alanlar.some((a) => normalizeMetin(a ?? '').includes(q));
      })
      .slice(0, LISTE_LIMIT);
  }, [arama, cariler, haricId]);

  const konumGuncelle = useCallback(() => {
    if (!tusRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(tusRef.current);
    setListeStil({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
      zIndex: 10300,
    });
  }, []);

  useLayoutEffect(() => {
    if (!acik) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, konumGuncelle, adaylar.length]);

  useEffect(() => {
    if (!acik) return;
    function disTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (
        kapsayiciRef.current?.contains(hedef) ||
        panelRef.current?.contains(hedef)
      ) {
        return;
      }
      setAcik(false);
      setArama('');
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik]);

  const sec = (c: AdminCari) => {
    onChange(c.id);
    setAcik(false);
    setArama('');
  };

  const temizle = () => {
    onChange('');
    setAcik(false);
    setArama('');
  };

  return (
    <div ref={kapsayiciRef} className={`cari-ust-baslik-secici${disabled ? ' cari-ust-baslik-secici--pasif' : ''}`}>
      <label className="cari-ust-baslik-etiket" htmlFor={inputId}>
        Üst Cari
      </label>
      <button
        ref={tusRef}
        type="button"
        id={inputId}
        className={`cari-ust-baslik-tus${secili ? ' cari-ust-baslik-tus--secili' : ' cari-ust-baslik-tus--bos'}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={acik}
        aria-controls={acik ? listeId : undefined}
        onClick={() => !disabled && setAcik((v) => !v)}
      >
        {secili ? (
          <span className="cari-ust-baslik-secili">
            <span className="cari-ust-baslik-secili-kod">{secili.cariKodu}</span>
            <span className="cari-ust-baslik-secili-ad">{secili.cariAdi}</span>
          </span>
        ) : (
          <span className="cari-ust-baslik-placeholder">Seçiniz…</span>
        )}
        <span className="cari-ust-baslik-ok" aria-hidden>
          ▾
        </span>
      </button>

      {acik && !disabled
        ? createPortal(
            <div ref={panelRef} className="cari-ust-baslik-panel" style={listeStil}>
              <div className="cari-ust-baslik-ara">
                <input
                  type="search"
                  className="cari-ust-baslik-ara-girdi"
                  value={arama}
                  placeholder="Cari kodu veya adı ara…"
                  autoFocus
                  onChange={(e) => setArama(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adaylar.length === 1) {
                      e.preventDefault();
                      sec(adaylar[0]);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setAcik(false);
                      setArama('');
                    }
                  }}
                />
              </div>
              <div className="cari-ust-baslik-tablo-baslik" aria-hidden>
                <span>Kod</span>
                <span>Ad</span>
              </div>
              <ul ref={listeRef} id={listeId} className="cari-ust-baslik-liste" role="listbox">
                {adaylar.length === 0 ? (
                  <li className="cari-ust-baslik-bos">Sonuç bulunamadı</li>
                ) : (
                  adaylar.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.id === ustId}
                        className={`cari-ust-baslik-oge${c.id === ustId ? ' cari-ust-baslik-oge--secili' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => sec(c)}
                      >
                        <span className="cari-ust-baslik-oge-kod">{c.cariKodu}</span>
                        <span className="cari-ust-baslik-oge-ad">{c.cariAdi}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
              {ustId ? (
                <button type="button" className="cari-ust-baslik-temizle" onClick={temizle}>
                  Seçimi kaldır
                </button>
              ) : null}
            </div>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
