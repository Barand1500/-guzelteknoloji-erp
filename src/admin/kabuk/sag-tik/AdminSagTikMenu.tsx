import { useCallback, useEffect, useRef, useState } from 'react';
import { adminModulleri, modulBul } from '@/admin/veri/adminMenuYapisi';
import { useSagTikPanelOptional } from '@/baglamlar/SagTikPanelContext';
import { sagTikOgeTanimBul } from '@/admin/baslat-menusu/sistem/ayarlar/veri-sag-tik';
import type { SagTikOgeId } from '@/admin/ortak/tipler/sagTikPaneli';
import { VARSAYILAN_SAG_TIK_PANEL } from '@/admin/ortak/tipler/sagTikPaneli';
import {
  metinAlaniMi,
  panoKopyala,
  panoKes,
  panoYapistir,
  sagTikPanelNormalize,
  secimVarMi,
  tumunuSec,
} from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
export interface AdminSagTikAksiyonlar {
  onModulAc: (modulId: string) => void;
  onKaydet: () => void;
  onGuncelle: () => void;
  onTemaDegistir: () => void;
}

interface MenuDurum {
  x: number;
  y: number;
  hedef: EventTarget | null;
}

export function AdminSagTikMenu({ aksiyonlar }: { aksiyonlar: AdminSagTikAksiyonlar }) {
  const panel = useSagTikPanelOptional();
  const ayarlar = panel?.ayarlar ?? sagTikPanelNormalize(VARSAYILAN_SAG_TIK_PANEL);
  const [menu, setMenu] = useState<MenuDurum | null>(null);
  const [flyout, setFlyout] = useState<'moduller' | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);

  const kapat = useCallback(() => {
    setMenu(null);
    setFlyout(null);
  }, []);

  useEffect(() => {
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
  }, [kapat]);

  useEffect(() => {
    function sagTik(e: MouseEvent) {
      if (!ayarlar.aktif) return;
      if (e.shiftKey) return;
      const panel = (e.target as HTMLElement)?.closest('.admin-panel');
      if (!panel) return;
      if ((e.target as HTMLElement).closest('.ap-sag-tik-menu')) return;
      if ((e.target as HTMLElement).closest('.ap-sekme-tab')) return;
      if ((e.target as HTMLElement).closest('.dg-demo-sag-tik-alan')) return;

      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, hedef: e.target });
      setFlyout(null);
    }

    document.addEventListener('contextmenu', sagTik);
    return () => document.removeEventListener('contextmenu', sagTik);
  }, [ayarlar.aktif]);

  async function ogeCalistir(id: SagTikOgeId) {
    if (!menu) return;
    const hedef = menu.hedef;

    switch (id) {
      case 'kopyala':
        await panoKopyala(hedef);
        break;
      case 'kes':
        panoKes(hedef);
        break;
      case 'yapistir':
        await panoYapistir(hedef);
        break;
      case 'tumunuSec':
        tumunuSec(hedef);
        break;
      case 'kaydet':
        aksiyonlar.onKaydet();
        break;
      case 'guncelle':
        aksiyonlar.onGuncelle();
        break;
      case 'tema':
        aksiyonlar.onTemaDegistir();
        break;
      default:
        break;
    }
    if (id !== 'moduller') kapat();
  }

  function ogeDevreDisi(id: SagTikOgeId): boolean {
    if (!menu) return true;
    if (id === 'kes') return !secimVarMi(menu.hedef);
    if (id === 'kopyala') {
      if (metinAlaniMi(menu.hedef)) return false;
      return !(window.getSelection()?.toString() ?? '');
    }
    if (id === 'yapistir' || id === 'tumunuSec') return !metinAlaniMi(menu.hedef);
    return false;
  }

  if (!menu || !ayarlar.aktif) return null;

  const aktifOgeler = ayarlar.ogeler.filter((o) => o.aktif);
  const moduller = ayarlar.modulIdler
    .map((id) => modulBul(id) ?? adminModulleri.find((m) => m.id === id))
    .filter(Boolean);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuSol = Math.min(menu.x, vw - 240);
  const menuUst = Math.min(menu.y, vh - 320);

  return (
    <div
      ref={kokRef}
      className="ap-sag-tik-menu"
      style={{ top: menuUst, left: menuSol }}
      role="menu"
    >
      {aktifOgeler.map((oge) => {
        const tanim = sagTikOgeTanimBul(oge.id);
        if (!tanim) return null;

        if (tanim.ayirici) {
          return <div key={oge.id} className="ap-sag-tik-ayirici" role="separator" />;
        }

        if (oge.id === 'moduller') {
          return (
            <div key={oge.id} className="ap-sag-tik-flyout-wrap">
              <button
                type="button"
                className={`ap-sag-tik-oge ${flyout === 'moduller' ? 'ap-sag-tik-oge-aktif' : ''}`}
                onMouseEnter={() => setFlyout('moduller')}
                onClick={() => setFlyout((f) => (f === 'moduller' ? null : 'moduller'))}
              >
                <span>{tanim.ikon}</span>
                <span>{tanim.etiket}</span>
                <span className="ap-sag-tik-ok">›</span>
              </button>
              {flyout === 'moduller' && (
                <div className="ap-sag-tik-flyout">
                  {moduller.map((m) =>
                    m ? (
                      <button
                        key={m.id}
                        type="button"
                        className="ap-sag-tik-oge"
                        onClick={() => {
                          aksiyonlar.onModulAc(m.id);
                          kapat();
                        }}
                      >
                        <span>{m.ikon}</span>
                        <span>{m.baslik}</span>
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={oge.id}
            type="button"
            className="ap-sag-tik-oge"
            disabled={ogeDevreDisi(oge.id)}
            onClick={() => void ogeCalistir(oge.id)}
          >
            <span>{tanim.ikon}</span>
            <span>{tanim.etiket}</span>
          </button>
        );
      })}
    </div>
  );
}
