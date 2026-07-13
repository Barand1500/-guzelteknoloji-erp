import { useEffect, useRef, useState } from 'react';
import { modulAra } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { tooltipMetni } from '@/araclar/tooltipMetni';
import { useAuth } from '@/baglamlar/AuthContext';
import { kullaniciModuluErisimVar } from '@/kancalar/useYetkiler';

interface CubukModulAramaProps {
  onModulSec: (modul: AdminModul) => void;
}

export function CubukModulArama({ onModulSec }: CubukModulAramaProps) {
  const { t } = usePanelDil();
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState('');
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const panelAnimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { aktifPrefixler } = useModulKatalog();
  const { kullanici } = useAuth();
  const kullaniciModuluErisimiVar = kullaniciModuluErisimVar(
    kullanici?.rol ?? '',
    kullanici?.yetkiler ?? [],
    kullanici?.yetkilerModul
  );
  const sonuclar = modulAra(
    arama,
    aktifPrefixler,
    kullaniciModuluErisimiVar,
    kullanici?.yetkilerModul ?? null,
    kullanici?.rol ?? ''
  ).slice(0, 8);
  const oneriAcik = acik && arama.trim().length > 0;
  useAksiyonCubuguPanelSync(oneriAcik, panelAnimRef);

  useEffect(() => {
    if (!acik) return;
    const disariTikla = (e: MouseEvent) => {
      if (!kapsayiciRef.current?.contains(e.target as Node)) {
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
    <div
      ref={kapsayiciRef}
      className={`ap-cubuk-arama${acik ? ' ap-cubuk-arama--acik' : ''}`}
      data-ap-kesif="modul-arama"
    >
      <div
        ref={panelAnimRef}
        className={`ap-cubuk-arama-birim${oneriAcik ? ' ap-cubuk-arama-birim--oneri ap-cubuk-arama-birim--kenarlik-anim' : ''}`}
      >
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
              tabIndex={acik ? 0 : -1}
            />
          </div>
          <button
            type="button"
            className={`ap-tray-ikon ap-cubuk-arama-btn${acik ? ' ap-tray-ikon-aktif' : ''}`}
            onClick={acKapat}
            title={tooltipMetni('Modül ara')}
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
    </div>
  );
}
