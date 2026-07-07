import { useCallback, useEffect, useRef, useState } from 'react';
import { adminModulleri, modulBul } from '@/admin/veri/adminMenuYapisi';
import { adminSayfalariGetir, type AdminSayfa } from '@/admin/ortak/api/sayfaApi';
import { useSagTikPanel } from '@/baglamlar/SagTikPanelContext';
import { sagTikOgeTanimBul } from '@/admin/baslat-menusu/sistem/ayarlar/veri-sag-tik';
import type { SagTikOgeId } from '@/admin/ortak/tipler/sagTikPaneli';
import {
  metinAlaniMi,
  panoKopyala,
  panoKes,
  panoYapistir,
  secimVarMi,
  tumunuSec,
} from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
export interface AdminSagTikAksiyonlar {
  onModulAc: (modulId: string) => void;
  onKaydet: () => void;
  onGuncelle: () => void;
  onTemaDegistir: () => void;
  onSistemKesif: () => void;
}

interface MenuDurum {
  x: number;
  y: number;
  hedef: EventTarget | null;
}

export function AdminSagTikMenu({ aksiyonlar }: { aksiyonlar: AdminSagTikAksiyonlar }) {
  const { ayarlar } = useSagTikPanel();
  const [menu, setMenu] = useState<MenuDurum | null>(null);
  const [sayfalar, setSayfalar] = useState<AdminSayfa[]>([]);
  const [sayfaAra, setSayfaAra] = useState('');
  const [flyout, setFlyout] = useState<'moduller' | 'sayfalar' | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);

  const kapat = useCallback(() => {
    setMenu(null);
    setFlyout(null);
    setSayfaAra('');
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
      void adminSayfalariGetir()
        .then(setSayfalar)
        .catch(() => setSayfalar([]));
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
      case 'dashboard':
        aksiyonlar.onModulAc('dashboard');
        break;
      case 'yeniSayfa':
        aksiyonlar.onModulAc('sayfalar');
        window.dispatchEvent(new CustomEvent('ap-admin-yeni-sayfa'));
        break;
      case 'kaydet':
        aksiyonlar.onKaydet();
        break;
      case 'guncelle':
        aksiyonlar.onGuncelle();
        break;
      case 'siteAc':
        window.open('/', '_blank');
        break;
      case 'tema':
        aksiyonlar.onTemaDegistir();
        break;
      case 'sistemKesif':
        aksiyonlar.onSistemKesif();
        break;
      default:
        break;
    }
    if (id !== 'moduller' && id !== 'sayfalar') kapat();
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

  const filtreliSayfalar = sayfalar.filter((s) => {
    const q = sayfaAra.trim().toLowerCase();
    if (!q) return true;
    return s.baslik.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
  });

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

        if (oge.id === 'sayfalar') {
          return (
            <div key={oge.id} className="ap-sag-tik-flyout-wrap">
              <button
                type="button"
                className={`ap-sag-tik-oge ${flyout === 'sayfalar' ? 'ap-sag-tik-oge-aktif' : ''}`}
                onMouseEnter={() => setFlyout('sayfalar')}
                onClick={() => setFlyout((f) => (f === 'sayfalar' ? null : 'sayfalar'))}
              >
                <span>{tanim.ikon}</span>
                <span>{tanim.etiket}</span>
                <span className="ap-sag-tik-ok">›</span>
              </button>
              {flyout === 'sayfalar' && (
                <div className="ap-sag-tik-flyout ap-sag-tik-flyout-genis">
                  <input
                    type="search"
                    className="ap-sag-tik-ara"
                    placeholder="Sayfa ara…"
                    value={sayfaAra}
                    onChange={(e) => setSayfaAra(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="ap-sag-tik-flyout-scroll">
                    {filtreliSayfalar.length === 0 && (
                      <p className="ap-sag-tik-bos">Sayfa bulunamadı</p>
                    )}
                    {filtreliSayfalar.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="ap-sag-tik-oge ap-sag-tik-sayfa-oge"
                        onClick={() => {
                          aksiyonlar.onModulAc('sayfalar');
                          window.dispatchEvent(
                            new CustomEvent('ap-admin-sayfa-sec', { detail: { sayfaId: s.id } })
                          );
                          kapat();
                        }}
                      >
                        <span>{s.yayinda ? '✅' : '📄'}</span>
                        <span>
                          <strong>{s.baslik}</strong>
                          <small>/{s.slug}</small>
                        </span>
                      </button>
                    ))}
                  </div>
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
