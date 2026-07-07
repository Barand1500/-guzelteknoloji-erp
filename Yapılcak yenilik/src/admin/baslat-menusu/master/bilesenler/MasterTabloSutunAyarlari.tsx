import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export interface TabloSutunTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
}

interface MasterTabloSutunAyarlariProps {
  baslik?: string;
  sutunlar: TabloSutunTanim[];
  gorunurSira: string[];
  varsayilanSira: string[];
  onDegistir: (yeni: string[]) => void;
}

const PANEL_GENISLIK = 300;
const KENAR_BOSLUK = 8;

function adminTemaOku(): 'acik' | 'koyu' {
  const tema = document.querySelector('.admin-panel')?.getAttribute('data-tema');
  return tema === 'koyu' ? 'koyu' : 'acik';
}

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function panelKonumuHesapla(btn: HTMLButtonElement) {
  const rect = btn.getBoundingClientRect();
  const genislik = Math.min(window.innerWidth - KENAR_BOSLUK * 2, PANEL_GENISLIK);
  let left = rect.right - genislik;
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }

  const altAlan = window.innerHeight - rect.bottom - 6 - KENAR_BOSLUK;
  const ustAlan = rect.top - 6 - KENAR_BOSLUK;
  const tavan = Math.min(window.innerHeight * 0.7, 420);

  if (altAlan >= 160 || altAlan >= ustAlan) {
    return {
      top: rect.bottom + 6,
      left,
      width: genislik,
      maxHeight: Math.max(120, Math.min(tavan, altAlan)),
    };
  }

  const maxHeight = Math.max(120, Math.min(tavan, ustAlan));
  return {
    top: rect.top - maxHeight - 6,
    left,
    width: genislik,
    maxHeight,
  };
}

export function MasterTabloSutunAyarlari({
  baslik = 'Tablo sütunları',
  sutunlar,
  gorunurSira,
  varsayilanSira,
  onDegistir,
}: MasterTabloSutunAyarlariProps) {
  const [acik, setAcik] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStil, setPanelStil] = useState<CSSProperties>({});
  const [tema, setTema] = useState<'acik' | 'koyu'>('acik');

  const konumGuncelle = useCallback(() => {
    if (!btnRef.current) return;
    const { top, left, width, maxHeight } = panelKonumuHesapla(btnRef.current);
    setPanelStil({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
      zIndex: 10050,
    });
  }, []);

  useLayoutEffect(() => {
    if (!acik) return;
    setTema(adminTemaOku());
    konumGuncelle();
  }, [acik, konumGuncelle, gorunurSira.length, sutunlar.length]);

  useEffect(() => {
    if (!acik) return;
    function disari(e: MouseEvent) {
      const hedef = e.target as Node;
      if (btnRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      setAcik(false);
    }
    function yenidenKonumla() {
      konumGuncelle();
    }
    document.addEventListener('mousedown', disari);
    window.addEventListener('resize', yenidenKonumla);
    window.addEventListener('scroll', yenidenKonumla, true);
    return () => {
      document.removeEventListener('mousedown', disari);
      window.removeEventListener('resize', yenidenKonumla);
      window.removeEventListener('scroll', yenidenKonumla, true);
    };
  }, [acik, konumGuncelle]);

  const gizliSutunlar = sutunlar.filter((s) => !gorunurSira.includes(s.id));

  function gorunurlukDegistir(id: string, gorunur: boolean) {
    if (!gorunur) {
      const tanim = sutunlar.find((s) => s.id === id);
      if (tanim?.zorunlu) return;
      onDegistir(gorunurSira.filter((s) => s !== id));
      return;
    }
    if (gorunurSira.includes(id)) return;
    onDegistir([...gorunurSira, id]);
  }

  function tasi(id: string, yon: -1 | 1) {
    const idx = gorunurSira.indexOf(id);
    if (idx < 0) return;
    const hedef = idx + yon;
    if (hedef < 0 || hedef >= gorunurSira.length) return;
    const yeni = [...gorunurSira];
    [yeni[idx], yeni[hedef]] = [yeni[hedef], yeni[idx]];
    onDegistir(yeni);
  }

  const panelIcerik = (
    <div
      ref={panelRef}
      className="ap-master-sutun-ayar-tema-kok ap-master-sutun-ayar-panel ap-master-sutun-ayar-panel-portal"
      data-tema={tema}
      style={panelStil}
    >
      <div className="ap-master-sutun-ayar-baslik">
        <p className="ap-heading text-sm font-semibold">{baslik}</p>
        <button
          type="button"
          className="ap-master-link-btn !text-xs"
          onClick={() => onDegistir([...varsayilanSira])}
        >
          Varsayılana dön
        </button>
      </div>
      <p className="ap-muted mb-2 text-xs">Görünür sütunlar ve sırası</p>
      <ul className="ap-master-sutun-ayar-liste">
        {gorunurSira.map((id, idx) => {
          const tanim = sutunlar.find((s) => s.id === id);
          if (!tanim) return null;
          return (
            <li key={id} className="ap-master-sutun-ayar-oge">
              <label className="ap-master-sutun-ayar-etiket">
                <input
                  type="checkbox"
                  checked
                  disabled={tanim.zorunlu}
                  onChange={() => gorunurlukDegistir(id, false)}
                />
                <span>{tanim.etiket}</span>
              </label>
              <div className="ap-master-sutun-ayar-tasima">
                <button
                  type="button"
                  className="ap-master-sutun-ayar-tas-btn"
                  disabled={idx === 0}
                  onClick={() => tasi(id, -1)}
                  aria-label={`${tanim.etiket} yukarı`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ap-master-sutun-ayar-tas-btn"
                  disabled={idx === gorunurSira.length - 1}
                  onClick={() => tasi(id, 1)}
                  aria-label={`${tanim.etiket} aşağı`}
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {gizliSutunlar.length > 0 && (
        <>
          <p className="ap-muted mb-2 mt-3 text-xs">Gizli sütunlar</p>
          <ul className="ap-master-sutun-ayar-liste ap-master-sutun-ayar-liste-gizli">
            {gizliSutunlar.map((tanim) => (
              <li key={tanim.id} className="ap-master-sutun-ayar-oge">
                <label className="ap-master-sutun-ayar-etiket">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => gorunurlukDegistir(tanim.id, true)}
                  />
                  <span>{tanim.etiket}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <div className="ap-master-sutun-ayar">
      <button
        ref={btnRef}
        type="button"
        className="ap-master-sutun-ayar-btn"
        onClick={() => setAcik((v) => !v)}
        aria-label="Tablo sütun ayarları"
        aria-expanded={acik}
        title="Sütunları göster / gizle ve sırala"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {acik && createPortal(panelIcerik, portalHedefiBul())}
    </div>
  );
}
