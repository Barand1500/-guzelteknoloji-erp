import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import { DG_CIZGI_MODLARI, DG_SAYFA_BOYUTLARI } from '@/admin/ortak/datagrid/datagridSabitleri';
import { dgSagTikMenuRectAl } from '@/admin/ortak/datagrid/dgGeciciMenuAnchor';

export type StokSagTikIslem =
  | 'duzenle'
  | 'incele'
  | 'gorunumDuzenle'
  | 'gorunumKaydet'
  | 'aktifYap'
  | 'pasifYap'
  | 'disaAktar'
  | 'secimiTemizle'
  | 'sayfaBoyutu'
  | 'cizgi'
  | 'formul'
  | 'sutunGorunurluk'
  | 'csvDisa';

interface StoklarSagTikMenuProps {
  konteynerRef: React.RefObject<HTMLElement | null>;
  duzenlemeVar: boolean;
  seciliSatirSayisi?: number;
  gridApiRef?: React.RefObject<DataGridApi | null>;
  onDuzenle: (satirId: string) => void;
  onIncele: (satirId: string) => void;
  onSatirSec?: (satirId: string) => void;
  onGorunumDuzenle: () => void;
  onGorunumKaydet: () => void;
  onAktifYap?: () => void;
  onPasifYap?: () => void;
  onDisaAktar?: () => void;
  onSecimiTemizle?: () => void;
}

interface MenuDurum {
  x: number;
  y: number;
  satirId: string | null;
}

type FlyoutTip = 'sayfaBoyutu' | 'cizgi';

const MENU_OGELERI: {
  id: StokSagTikIslem;
  etiket: string;
  ikon: string;
  ayiriciOnce?: boolean;
  satirGerekli?: boolean;
  duzenlemeGerekli?: boolean;
  secimGerekli?: boolean;
  flyout?: boolean;
  tabloAraci?: boolean;
  secimIslemi?: boolean;
}[] = [
  { id: 'duzenle', etiket: 'Düzenle', ikon: '✏️', satirGerekli: true, duzenlemeGerekli: true },
  { id: 'incele', etiket: 'İncele', ikon: '👁️', satirGerekli: true },
  { id: 'aktifYap', etiket: 'Aktif Yap', ikon: '✅', ayiriciOnce: true, secimGerekli: true, secimIslemi: true, duzenlemeGerekli: true },
  { id: 'pasifYap', etiket: 'Pasif Yap', ikon: '⏸️', secimGerekli: true, secimIslemi: true, duzenlemeGerekli: true },
  { id: 'disaAktar', etiket: 'Dışa Aktar', ikon: '📤', secimGerekli: true, secimIslemi: true },
  { id: 'secimiTemizle', etiket: 'Seçimi Temizle', ikon: '✖️', secimGerekli: true, secimIslemi: true },
  { id: 'gorunumDuzenle', etiket: 'Görünümü Düzenle', ikon: '🎛️', ayiriciOnce: true },
  { id: 'gorunumKaydet', etiket: 'Görünümü Kaydet', ikon: '💾' },
  { id: 'sayfaBoyutu', etiket: 'Kayıt', ikon: '📄', ayiriciOnce: true, flyout: true, tabloAraci: true },
  { id: 'cizgi', etiket: 'Çizgi', ikon: '▦', flyout: true, tabloAraci: true },
  { id: 'formul', etiket: 'Sayı formülleri', ikon: 'ƒx', tabloAraci: true },
  { id: 'sutunGorunurluk', etiket: 'Sütun görünürlüğü', ikon: '▥', tabloAraci: true },
  { id: 'csvDisa', etiket: 'CSV indir', ikon: '⬇️', tabloAraci: true },
];

export function StoklarSagTikMenu({
  konteynerRef,
  duzenlemeVar,
  seciliSatirSayisi = 0,
  gridApiRef,
  onDuzenle,
  onIncele,
  onSatirSec,
  onGorunumDuzenle,
  onGorunumKaydet,
  onAktifYap,
  onPasifYap,
  onDisaAktar,
  onSecimiTemizle,
}: StoklarSagTikMenuProps) {
  const [menu, setMenu] = useState<MenuDurum | null>(null);
  const [flyout, setFlyout] = useState<FlyoutTip | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );

  const kapat = useCallback(() => {
    setMenu(null);
    setFlyout(null);
  }, []);

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
      setFlyout(null);
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
    const api = gridApiRef?.current;
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
      case 'formul': {
        const snapshot = dgSagTikMenuRectAl(kokRef.current);
        kapat();
        requestAnimationFrame(() => api?.formulMenuToggle(snapshot));
        return;
      }
      case 'sutunGorunurluk': {
        const snapshot = dgSagTikMenuRectAl(kokRef.current);
        kapat();
        requestAnimationFrame(() => api?.sutunMenuToggle(snapshot));
        return;
      }
      case 'csvDisa':
        api?.csvIndir(false);
        break;
      case 'aktifYap':
        if (seciliSatirSayisi > 0) onAktifYap?.();
        break;
      case 'pasifYap':
        if (seciliSatirSayisi > 0) onPasifYap?.();
        break;
      case 'disaAktar':
        if (seciliSatirSayisi > 0) {
          if (onDisaAktar) onDisaAktar();
          else api?.csvIndir(true);
        }
        break;
      case 'secimiTemizle':
        if (seciliSatirSayisi > 0) {
          if (onSecimiTemizle) onSecimiTemizle();
          else api?.secimAyarla([]);
        }
        break;
      default:
        break;
    }
    kapat();
  }

  if (!menu) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuSol = Math.min(menu.x, vw - 240);
  const menuUst = Math.min(menu.y, vh - 360);
  const sayfaBoyutu = gridApiRef?.current?.sayfaBoyutu() ?? 10;

  return createPortal(
    <div
      ref={kokRef}
      className="ap-sag-tik-menu dg-sag-tik-menu"
      style={{ top: menuUst, left: menuSol }}
      role="menu"
      aria-label="Stoklar tablo menüsü"
    >
      {MENU_OGELERI.map((oge) => {
        if (oge.tabloAraci && !gridApiRef) return null;
        if (oge.id === 'aktifYap' && !onAktifYap) return null;
        if (oge.id === 'pasifYap' && !onPasifYap) return null;
        const satirEksik = oge.satirGerekli && !menu.satirId;
        const yetkiEksik = oge.duzenlemeGerekli && !duzenlemeVar;
        const secimEksik = oge.secimGerekli && seciliSatirSayisi <= 0;
        const devreDisi = satirEksik || yetkiEksik || secimEksik;
        const flyoutTip: FlyoutTip | null =
          oge.id === 'sayfaBoyutu' ? 'sayfaBoyutu' : oge.id === 'cizgi' ? 'cizgi' : null;
        const etiket =
          oge.id === 'sayfaBoyutu' ? `Kayıt (${sayfaBoyutu})` : oge.etiket;

        return (
          <div key={oge.id}>
            {oge.ayiriciOnce ? <div className="ap-sag-tik-ayirici" role="separator" /> : null}
            {oge.flyout && flyoutTip ? (
              <div
                className="ap-sag-tik-flyout-wrap"
                onMouseEnter={() => !devreDisi && setFlyout(flyoutTip)}
              >
                <button
                  type="button"
                  role="menuitem"
                  className={`ap-sag-tik-oge${flyout === flyoutTip ? ' ap-sag-tik-oge-aktif' : ''}`}
                  disabled={devreDisi}
                  onClick={() =>
                    !devreDisi && setFlyout((f) => (f === flyoutTip ? null : flyoutTip))
                  }
                >
                  <span aria-hidden>{oge.ikon}</span>
                  <span>{etiket}</span>
                  <span className="ap-sag-tik-ok">›</span>
                </button>
                {flyout === 'sayfaBoyutu' && flyoutTip === 'sayfaBoyutu' && (
                  <div className="ap-sag-tik-flyout dg-sag-tik-flyout" role="menu">
                    {DG_SAYFA_BOYUTLARI.map((n) => {
                      const aktif = gridApiRef?.current?.sayfaBoyutu() === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          className={`ap-sag-tik-oge${aktif ? ' ap-sag-tik-oge-aktif' : ''}`}
                          onClick={() => {
                            gridApiRef?.current?.sayfaBoyutuAyarla(n);
                            kapat();
                          }}
                        >
                          <span aria-hidden>{aktif ? '✓' : '·'}</span>
                          <span>{n} Kayıt</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {flyout === 'cizgi' && flyoutTip === 'cizgi' && (
                  <div className="ap-sag-tik-flyout dg-sag-tik-flyout" role="menu">
                    {DG_CIZGI_MODLARI.map((alt) => {
                      const aktif = gridApiRef?.current?.cizgiModu() === alt.mod;
                      return (
                        <button
                          key={alt.mod}
                          type="button"
                          className={`ap-sag-tik-oge${aktif ? ' ap-sag-tik-oge-aktif' : ''}`}
                          onClick={() => {
                            gridApiRef?.current?.cizgiModuAyarla(alt.mod);
                            kapat();
                          }}
                        >
                          <span aria-hidden>{aktif ? '✓' : '·'}</span>
                          <span>{alt.etiket}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="ap-sag-tik-oge"
                disabled={devreDisi}
                onMouseEnter={() => setFlyout(null)}
                onClick={() => islemCalistir(oge.id)}
              >
                <span aria-hidden>{oge.ikon}</span>
                <span>{etiket}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>,
    portalKok
  );
}
