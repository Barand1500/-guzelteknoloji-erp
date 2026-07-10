import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import type { SiparisSatiri } from './demoVeri';
import { satirHesapla } from './demoVeri';
import { hucrePanoyaMetni, secimMetnindenKopya } from './sagTikYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';

export type DatagridSagTikIslem =
  | 'satirSil'
  | 'seciliSil'
  | 'satirDuzenle'
  | 'satirCogalt'
  | 'csvDisa'
  | 'panoyaKopyala';

export type SatirEkleKonumu = 'ust' | 'alt';

export interface DatagridSagTikMenuDurum {
  x: number;
  y: number;
  satirId: string | null;
  kolonId: string | null;
  kopyaMetni: string;
}

interface DatagridSagTikMenuProps {
  konteynerRef: React.RefObject<HTMLElement | null>;
  kolonlar: KolonTanimi<SiparisSatiri>[];
  satirlar: SiparisSatiri[];
  kdvDahil: boolean;
  seciliSatirSayisi: number;
  gridApiRef: React.RefObject<DataGridApi | null>;
  onSatirlarDegistir: React.Dispatch<React.SetStateAction<SiparisSatiri[]>>;
  onSatirEkleBaslat?: (konum: SatirEkleKonumu, satirId: string) => void;
  onBilgi?: (mesaj: string) => void;
}

interface MenuOgesi {
  id: DatagridSagTikIslem | 'satirEkle';
  etiket: string;
  ikon: string;
  devreDisi?: boolean;
  tehlike?: boolean;
  ayiriciOnce?: boolean;
  flyout?: boolean;
}

const SATIR_EKLE_ALT_OGELER: { konum: SatirEkleKonumu; etiket: string; ikon: string }[] = [
  { konum: 'ust', etiket: 'Satır üstüne ekle', ikon: '↑' },
  { konum: 'alt', etiket: 'Satır altına ekle', ikon: '↓' },
];

const MENU_IKONLARI: Record<DatagridSagTikIslem | 'satirEkle', string> = {
  satirEkle: '➕',
  satirDuzenle: '✏️',
  satirCogalt: '📑',
  panoyaKopyala: '📋',
  csvDisa: '⬇️',
  satirSil: '🗑️',
  seciliSil: '🗑️',
};

type SilmeOnayDurumu =
  | { tip: 'tek'; satirId: string; metin: string }
  | { tip: 'coklu'; adet: number };

function satirSilMetni(satir: SiparisSatiri): string {
  const ad = satir.urun.ad?.trim() ?? '';
  const kod = satir.urun.sku?.trim() ?? '';
  return ad || kod || `Satır #${satir.id}`;
}

export function DatagridSagTikMenu({
  konteynerRef,
  kolonlar,
  satirlar,
  kdvDahil,
  seciliSatirSayisi,
  gridApiRef,
  onSatirlarDegistir,
  onSatirEkleBaslat,
  onBilgi,
}: DatagridSagTikMenuProps) {
  const [menu, setMenu] = useState<DatagridSagTikMenuDurum | null>(null);
  const [flyout, setFlyout] = useState<'satirEkle' | null>(null);
  const [silmeOnay, setSilmeOnay] = useState<SilmeOnayDurumu | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );

  const kapat = useCallback(() => {
    setFlyout(null);
    setMenu(null);
  }, []);

  useEffect(() => {
    const kok = konteynerRef.current;
    if (!kok) return;

    function sagTik(e: MouseEvent) {
      const kabuk = (e.target as HTMLElement).closest('.dg-kabuk');
      if (!kabuk || !kok!.contains(kabuk)) return;
      if ((e.target as HTMLElement).closest('.dg-sag-tik-menu')) return;

      e.preventDefault();
      e.stopPropagation();

      const td = (e.target as HTMLElement).closest('td[data-kolon-id]');
      const tr = (e.target as HTMLElement).closest('tr[data-satir-id]');
      const satirId = tr?.getAttribute('data-satir-id') ?? null;
      const kolonId = td?.getAttribute('data-kolon-id') ?? null;

      const satir = satirId ? satirlar.find((s) => s.id === satirId) : null;
      const hucreMetni = satir && kolonId ? hucrePanoyaMetni(satir, kolonId, kolonlar) : '';
      const kopyaMetni = hucreMetni || secimMetnindenKopya(e.target);

      setMenu({ x: e.clientX, y: e.clientY, satirId, kolonId, kopyaMetni });
      setFlyout(null);
    }

    kok.addEventListener('contextmenu', sagTik);
    return () => kok.removeEventListener('contextmenu', sagTik);
  }, [konteynerRef, satirlar, kolonlar, kdvDahil]);

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
  }, [kapat, menu]);

  async function islemCalistir(id: DatagridSagTikIslem) {
    if (!menu) return;
    const api = gridApiRef.current;
    const satir = menu.satirId ? satirlar.find((s) => s.id === menu.satirId) : null;

    switch (id) {
      case 'satirDuzenle':
        if (menu.satirId) api?.satirDuzenleAc(menu.satirId);
        break;
      case 'satirCogalt':
        if (satir) {
          const simdi = new Date().toISOString();
          const kopya = satirHesapla(
            {
              ...satir,
              id: `y-${Date.now()}`,
              kayitTarihi: simdi,
              guncellemeTarihi: simdi,
            },
            kdvDahil
          );
          onSatirlarDegistir((onceki) => {
            const idx = onceki.findIndex((s) => s.id === satir.id);
            if (idx < 0) return [kopya, ...onceki];
            const yeni = [...onceki];
            yeni.splice(idx + 1, 0, kopya);
            return yeni;
          });
          onBilgi?.('Satır kopyalandı');
        }
        break;
      case 'panoyaKopyala':
        if (menu.kopyaMetni) {
          try {
            await navigator.clipboard.writeText(menu.kopyaMetni);
            onBilgi?.('Panoya kopyalandı');
          } catch {
            onBilgi?.('Kopyalama başarısız');
          }
        }
        break;
      case 'csvDisa':
        api?.csvIndir(false);
        break;
      case 'satirSil':
        if (menu.satirId && satir) {
          setSilmeOnay({
            tip: 'tek',
            satirId: menu.satirId,
            metin: satirSilMetni(satir),
          });
        }
        break;
      case 'seciliSil':
        if (seciliSatirSayisi > 0) {
          setSilmeOnay({ tip: 'coklu', adet: seciliSatirSayisi });
        }
        break;
      default:
        break;
    }
    kapat();
  }

  const silmeOnayla = useCallback(() => {
    if (!silmeOnay) return;
    if (silmeOnay.tip === 'tek') {
      onSatirlarDegistir((onceki) => onceki.filter((s) => s.id !== silmeOnay.satirId));
      onBilgi?.('Satır silindi');
    } else {
      const ids = new Set(gridApiRef.current?.seciliIdler() ?? []);
      onSatirlarDegistir((onceki) => onceki.filter((s) => !ids.has(s.id)));
      onBilgi?.('Seçili satırlar silindi');
    }
    setSilmeOnay(null);
  }, [silmeOnay, onSatirlarDegistir, onBilgi, gridApiRef]);

  return (
    <>
      {menu &&
        createPortal(
          (() => {
            const kopyaEtiket = menu.kopyaMetni
              ? menu.kopyaMetni.length > 28
                ? `${menu.kopyaMetni.slice(0, 28)}…`
                : menu.kopyaMetni
              : '';

            const ogeler: MenuOgesi[] = [
              {
                id: 'satirEkle',
                etiket: 'Satır ekle',
                ikon: MENU_IKONLARI.satirEkle,
                devreDisi: !menu.satirId,
                flyout: true,
              },
              {
                id: 'satirDuzenle',
                etiket: 'Satırı düzenle',
                ikon: MENU_IKONLARI.satirDuzenle,
                devreDisi: !menu.satirId,
              },
              {
                id: 'satirCogalt',
                etiket: 'Satırı kopyala',
                ikon: MENU_IKONLARI.satirCogalt,
                devreDisi: !menu.satirId,
              },
              {
                id: 'panoyaKopyala',
                etiket: kopyaEtiket ? `Panoya kopyala — ${kopyaEtiket}` : 'Panoya kopyala',
                ikon: MENU_IKONLARI.panoyaKopyala,
                devreDisi: !menu.kopyaMetni,
                ayiriciOnce: true,
              },
              {
                id: 'csvDisa',
                etiket: 'Dışa aktar (CSV)',
                ikon: MENU_IKONLARI.csvDisa,
                ayiriciOnce: true,
              },
              {
                id: 'satirSil',
                etiket: 'Satır sil',
                ikon: MENU_IKONLARI.satirSil,
                devreDisi: !menu.satirId,
                tehlike: true,
                ayiriciOnce: true,
              },
              {
                id: 'seciliSil',
                etiket:
                  seciliSatirSayisi > 0
                    ? `Seçili satırları sil (${seciliSatirSayisi})`
                    : 'Seçili satırları sil',
                ikon: MENU_IKONLARI.seciliSil,
                devreDisi: seciliSatirSayisi === 0,
                tehlike: true,
              },
            ];

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const menuSol = Math.min(menu.x, vw - 240);
            const menuUst = Math.min(menu.y, vh - 320);

            return (
              <div
                ref={kokRef}
                className="ap-sag-tik-menu dg-sag-tik-menu"
                style={{ top: menuUst, left: menuSol }}
                role="menu"
                aria-label="Sipariş tablosu menüsü"
              >
                {ogeler.map((oge) => (
                  <div key={oge.id}>
                    {oge.ayiriciOnce && <div className="ap-sag-tik-ayirici" role="separator" />}
                    {oge.flyout ? (
                      <div className="ap-sag-tik-flyout-wrap">
                        <button
                          type="button"
                          className={`ap-sag-tik-oge${flyout === 'satirEkle' ? ' ap-sag-tik-oge-aktif' : ''}`}
                          disabled={oge.devreDisi}
                          onMouseEnter={() => !oge.devreDisi && setFlyout('satirEkle')}
                          onClick={() =>
                            !oge.devreDisi && setFlyout((f) => (f === 'satirEkle' ? null : 'satirEkle'))
                          }
                        >
                          <span>{oge.ikon}</span>
                          <span>{oge.etiket}</span>
                          <span className="ap-sag-tik-ok">›</span>
                        </button>
                        {flyout === 'satirEkle' && !oge.devreDisi && menu.satirId && (
                          <div
                            className="ap-sag-tik-flyout dg-sag-tik-flyout"
                            role="menu"
                            aria-label="Satır ekleme seçenekleri"
                          >
                            {SATIR_EKLE_ALT_OGELER.map((alt) => (
                              <button
                                key={alt.konum}
                                type="button"
                                className="ap-sag-tik-oge"
                                onClick={() => {
                                  onSatirEkleBaslat?.(alt.konum, menu.satirId!);
                                  kapat();
                                }}
                              >
                                <span>{alt.ikon}</span>
                                <span>{alt.etiket}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`ap-sag-tik-oge${oge.tehlike ? ' dg-sag-tik-oge--tehlike' : ''}`}
                        disabled={oge.devreDisi}
                        onClick={() => void islemCalistir(oge.id as DatagridSagTikIslem)}
                      >
                        <span>{oge.ikon}</span>
                        <span>{oge.etiket}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })(),
          portalKok
        )}

      <SilmeOnayModal
        acik={silmeOnay !== null}
        onKapat={() => setSilmeOnay(null)}
        onOnayla={silmeOnayla}
        baslik={
          silmeOnay?.tip === 'coklu'
            ? 'Seçili kayıtları silmek istiyor musunuz?'
            : 'Bu satırı silmek istiyor musunuz?'
        }
        hedefMetin={
          silmeOnay?.tip === 'coklu'
            ? `${silmeOnay.adet} kayıt`
            : (silmeOnay?.metin ?? '')
        }
        ariaLabel="Satır silme onayı"
      />
    </>
  );
}
