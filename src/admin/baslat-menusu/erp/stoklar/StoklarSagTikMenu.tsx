import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type StokSagTikIslem =
  | 'duzenle'
  | 'incele'
  | 'gorunumDuzenle'
  | 'gorunumKaydet';

interface StoklarSagTikMenuProps {
  konteynerRef: React.RefObject<HTMLElement | null>;
  duzenlemeVar: boolean;
  onDuzenle: (satirId: string) => void;
  onIncele: (satirId: string) => void;
  onSatirSec?: (satirId: string) => void;
  onGorunumDuzenle: () => void;
  onGorunumKaydet: () => void;
}

interface MenuDurum {
  x: number;
  y: number;
  satirId: string | null;
}

const MENU_OGELERI: {
  id: StokSagTikIslem;
  etiket: string;
  ikon: string;
  ayiriciOnce?: boolean;
  satirGerekli?: boolean;
  duzenlemeGerekli?: boolean;
}[] = [
  { id: 'duzenle', etiket: 'Düzenle', ikon: '✏️', satirGerekli: true, duzenlemeGerekli: true },
  { id: 'incele', etiket: 'İncele', ikon: '👁️', satirGerekli: true },
  { id: 'gorunumDuzenle', etiket: 'Görünümü Düzenle', ikon: '🎛️', ayiriciOnce: true },
  { id: 'gorunumKaydet', etiket: 'Görünümü Kaydet', ikon: '💾' },
];

export function StoklarSagTikMenu({
  konteynerRef,
  duzenlemeVar,
  onDuzenle,
  onIncele,
  onSatirSec,
  onGorunumDuzenle,
  onGorunumKaydet,
}: StoklarSagTikMenuProps) {
  const [menu, setMenu] = useState<MenuDurum | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );

  const kapat = useCallback(() => setMenu(null), []);

  useEffect(() => {
    const kok = konteynerRef.current;
    if (!kok) return;

    function sagTik(e: MouseEvent) {
      const hedef = e.target as HTMLElement;
      const kabuk = hedef.closest('.dg-kabuk');
      if (!kabuk || !kok!.contains(kabuk)) return;
      if (hedef.closest('.dg-sag-tik-menu')) return;

      e.preventDefault();
      e.stopPropagation();

      const tr = hedef.closest('tr[data-satir-id]');
      const satirId = tr?.getAttribute('data-satir-id') ?? null;
      if (satirId) onSatirSec?.(satirId);
      setMenu({ x: e.clientX, y: e.clientY, satirId });
    }

    kok.addEventListener('contextmenu', sagTik);
    return () => kok.removeEventListener('contextmenu', sagTik);
  }, [konteynerRef, onSatirSec]);

  useEffect(() => {
    if (!menu) return;

    function tikla(e: MouseEvent) {
      if (!kokRef.current?.contains(e.target as Node)) kapat();
    }
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') kapat();
    }
    window.addEventListener('mousedown', tikla);
    window.addEventListener('keydown', tus);
    window.addEventListener('scroll', kapat, true);
    return () => {
      window.removeEventListener('mousedown', tikla);
      window.removeEventListener('keydown', tus);
      window.removeEventListener('scroll', kapat, true);
    };
  }, [kapat, menu]);

  function islemCalistir(id: StokSagTikIslem) {
    if (!menu) return;
    switch (id) {
      case 'duzenle':
        if (menu.satirId) onDuzenle(menu.satirId);
        break;
      case 'incele':
        if (menu.satirId) onIncele(menu.satirId);
        break;
      case 'gorunumDuzenle':
        onGorunumDuzenle();
        break;
      case 'gorunumKaydet':
        onGorunumKaydet();
        break;
    }
    kapat();
  }

  if (!menu) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuSol = Math.min(menu.x, vw - 220);
  const menuUst = Math.min(menu.y, vh - 260);

  return createPortal(
    <div
      ref={kokRef}
      className="ap-sag-tik-menu dg-sag-tik-menu"
      style={{ top: menuUst, left: menuSol }}
      role="menu"
      aria-label="Stoklar tablo menüsü"
    >
      {MENU_OGELERI.map((oge) => {
        const satirEksik = oge.satirGerekli && !menu.satirId;
        const yetkiEksik = oge.duzenlemeGerekli && !duzenlemeVar;
        const devreDisi = satirEksik || yetkiEksik;

        return (
          <div key={oge.id}>
            {oge.ayiriciOnce ? <div className="ap-sag-tik-ayirici" role="separator" /> : null}
            <button
              type="button"
              role="menuitem"
              className="ap-sag-tik-oge"
              disabled={devreDisi}
              onClick={() => islemCalistir(oge.id)}
            >
              <span aria-hidden>{oge.ikon}</span>
              <span>{oge.etiket}</span>
            </button>
          </div>
        );
      })}
    </div>,
    portalKok
  );
}
