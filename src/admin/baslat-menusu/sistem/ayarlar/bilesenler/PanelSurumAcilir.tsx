import { useEffect, useRef, useState } from 'react';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import {
  PANEL_SURUM_SECENEKLERI,
  type RollerTasarimModu,
} from '@/admin/baslat-menusu/sistem/ayarlar/panelGorunum';

interface PanelSurumAcilirProps {
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
}

export function PanelSurumAcilir({ form, onChange }: PanelSurumAcilirProps) {
  const [acik, setAcik] = useState(false);
  const sarmalRef = useRef<HTMLDivElement>(null);
  const secili = PANEL_SURUM_SECENEKLERI.find((s) => s.id === form.panelGorunum.rollerTasarim)
    ?? PANEL_SURUM_SECENEKLERI[1];

  useEffect(() => {
    if (!acik) return;
    function disiTik(e: MouseEvent) {
      if (sarmalRef.current && !sarmalRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') setAcik(false);
    }
    document.addEventListener('mousedown', disiTik);
    document.addEventListener('keydown', tus);
    return () => {
      document.removeEventListener('mousedown', disiTik);
      document.removeEventListener('keydown', tus);
    };
  }, [acik]);

  const sec = (id: RollerTasarimModu) => {
    onChange({ ...form, panelGorunum: { ...form.panelGorunum, rollerTasarim: id } });
    setAcik(false);
  };

  return (
    <div className="ap-var-ayar-satir ap-panel-surum-satir">
      <div className="ap-var-ayar-satir-baslik">
        <p className="ap-var-ayar-etiket">Panel sürümü</p>
        <p className="ap-var-ayar-aciklama">Site genelinde modül ekranlarının arayüz sürümü</p>
      </div>
      <div className="ap-panel-surum-acilir" ref={sarmalRef}>
        <button
          type="button"
          className="ap-panel-surum-tus"
          aria-haspopup="listbox"
          aria-expanded={acik}
          onClick={() => setAcik((o) => !o)}
        >
          <span className="ap-panel-surum-tus-ad">{secili.ad}</span>
          <span className="ap-panel-surum-tus-ok" aria-hidden>{acik ? '▴' : '▾'}</span>
        </button>
        {acik && (
          <ul className="ap-panel-surum-liste" role="listbox" aria-label="Panel sürümü">
            {PANEL_SURUM_SECENEKLERI.map((s) => (
              <li key={s.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={secili.id === s.id}
                  className={`ap-panel-surum-oge${secili.id === s.id ? ' ap-panel-surum-oge--aktif' : ''}`}
                  onClick={() => sec(s.id)}
                >
                  <span className="ap-panel-surum-oge-ad">{s.ad}</span>
                  <span className="ap-panel-surum-oge-alt">{s.aciklama}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
