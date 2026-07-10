import { useEffect, useRef, useState } from 'react';
import { modulAra } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';

interface CubukModulAramaProps {
  onModulSec: (modul: AdminModul) => void;
}

export function CubukModulArama({ onModulSec }: CubukModulAramaProps) {
  const { t } = usePanelDil();
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { aktifPrefixler } = useModulKatalog();
  const sonuclar = modulAra(arama, aktifPrefixler).slice(0, 8);
  const oneriAcik = acik && arama.trim().length > 0;
  useAksiyonCubuguPanelSync(acik, panelRef);

  useEffect(() => {
    if (!acik) return;
    const disariTikla = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setAcik(false);
        setArama('');
      }
    };
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [acik]);

  function modulSec(modul: AdminModul) {
    onModulSec(modul);
    setArama('');
    setAcik(false);
  }

  function acKapat() {
    setAcik((v) => {
      const yeni = !v;
      if (yeni) setTimeout(() => inputRef.current?.focus(), 0);
      else setArama('');
      return yeni;
    });
  }

  return (
    <div ref={wrapRef} className="ap-cubuk-arama-wrap" data-ap-kesif="modul-arama">
      {acik && (
        <div ref={panelRef} className="ap-cubuk-arama-panel ap-cubuk-arama-panel--kenarlik-anim">
          {oneriAcik && (
            <div className="ap-cubuk-arama-oneri" role="listbox" aria-label="Modül önerileri">
              {sonuclar.length === 0 ? (
                <p className="ap-muted px-3 py-2 text-xs">Sonuç bulunamadı</p>
              ) : (
                <ul className="ap-cubuk-arama-sonuc-listesi">
                  {sonuclar.map((modul) => (
                    <li key={modul.id}>
                      <button
                        type="button"
                        className="ap-cubuk-arama-sonuc"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => modulSec(modul)}
                      >
                        <span className="text-base">{modul.ikon}</span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-medium">
                            {t(`modul.${modul.id}`, modul.baslik)}
                          </span>
                          <span className="ap-muted block truncate text-[10px]">{modul.kategori}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="ap-cubuk-arama-grup">
            <div className="ap-cubuk-arama-input-sarm">
              <input
                ref={inputRef}
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Modül ara..."
                className="ap-cubuk-arama-input"
                aria-label="Modül ara"
                aria-expanded={oneriAcik}
              />
            </div>
            <button
              type="button"
              className="ap-tray-ikon ap-cubuk-arama-btn ap-tray-ikon-aktif"
              onClick={acKapat}
              title="Modül ara"
              aria-label="Modül ara"
              aria-expanded={acik}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!acik && (
        <button
          type="button"
          className="ap-tray-ikon ap-cubuk-arama-btn"
          onClick={acKapat}
          title="Modül ara"
          aria-label="Modül ara"
          aria-expanded={false}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
