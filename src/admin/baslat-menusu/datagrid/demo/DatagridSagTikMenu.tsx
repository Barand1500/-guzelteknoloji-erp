import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import type { SiparisSatiri } from './demoVeri';
import { satirHesapla } from './demoVeri';
import { hucrePanoyaMetni, secimMetnindenKopya } from './sagTikYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';

export type DatagridSagTikIslem =
  | 'satirEkle'
  | 'satirSil'
  | 'seciliSil'
  | 'satirDuzenle'
  | 'satirCogalt'
  | 'csvDisa'
  | 'panoyaKopyala';

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
  onBilgi?: (mesaj: string) => void;
}

interface MenuOgesi {
  id: DatagridSagTikIslem;
  etiket: string;
  ikon: string;
  devreDisi?: boolean;
  tehlike?: boolean;
  ayiriciOnce?: boolean;
}

const MENU_IKONLARI: Record<DatagridSagTikIslem, string> = {
  satirEkle: '➕',
  satirDuzenle: '✏️',
  satirCogalt: '📑',
  panoyaKopyala: '📋',
  csvDisa: '⬇️',
  satirSil: '🗑️',
  seciliSil: '🗑️',
};

export function DatagridSagTikMenu({
  konteynerRef,
  kolonlar,
  satirlar,
  kdvDahil,
  seciliSatirSayisi,
  gridApiRef,
  onSatirlarDegistir,
  onBilgi,
}: DatagridSagTikMenuProps) {
  const [menu, setMenu] = useState<DatagridSagTikMenuDurum | null>(null);
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
      const hucreMetni = satir && kolonId ? hucrePanoyaMetni(satir, kolonId, kolonlar, kdvDahil) : '';
      const kopyaMetni = hucreMetni || secimMetnindenKopya(e.target);

      setMenu({ x: e.clientX, y: e.clientY, satirId, kolonId, kopyaMetni });
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
      case 'satirEkle':
        api?.hizliGirisOdakla();
        break;
      case 'satirDuzenle':
        if (menu.satirId) api?.satirDuzenleAc(menu.satirId);
        break;
      case 'satirCogalt':
        if (satir) {
          const bugun = new Date().toISOString().slice(0, 10);
          const kopya = satirHesapla(
            {
              ...satir,
              id: `y-${Date.now()}`,
              kayitTarihi: bugun,
              guncellemeTarihi: bugun,
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
          onBilgi?.('Satır çoğaltıldı');
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
        if (menu.satirId && confirm('Bu satır silinsin mi?')) {
          onSatirlarDegistir((onceki) => onceki.filter((s) => s.id !== menu.satirId));
          onBilgi?.('Satır silindi');
        }
        break;
      case 'seciliSil':
        if (seciliSatirSayisi > 0 && confirm(`${seciliSatirSayisi} kayıt silinsin mi?`)) {
          const ids = new Set(api?.seciliIdler() ?? []);
          onSatirlarDegistir((onceki) => onceki.filter((s) => !ids.has(s.id)));
          onBilgi?.('Seçili satırlar silindi');
        }
        break;
      default:
        break;
    }
    kapat();
  }

  if (!menu) return null;

  const kopyaEtiket = menu.kopyaMetni
    ? menu.kopyaMetni.length > 28
      ? `${menu.kopyaMetni.slice(0, 28)}…`
      : menu.kopyaMetni
    : '';

  const ogeler: MenuOgesi[] = [
    { id: 'satirEkle', etiket: 'Satır ekle', ikon: MENU_IKONLARI.satirEkle },
    { id: 'satirDuzenle', etiket: 'Satırı düzenle', ikon: MENU_IKONLARI.satirDuzenle, devreDisi: !menu.satirId },
    { id: 'satirCogalt', etiket: 'Satırı çoğalt', ikon: MENU_IKONLARI.satirCogalt, devreDisi: !menu.satirId },
    {
      id: 'panoyaKopyala',
      etiket: kopyaEtiket ? `Panoya kopyala — ${kopyaEtiket}` : 'Panoya kopyala',
      ikon: MENU_IKONLARI.panoyaKopyala,
      devreDisi: !menu.kopyaMetni,
      ayiriciOnce: true,
    },
    { id: 'csvDisa', etiket: 'Dışa aktar (CSV)', ikon: MENU_IKONLARI.csvDisa, ayiriciOnce: true },
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
      etiket: seciliSatirSayisi > 0 ? `Seçili satırları sil (${seciliSatirSayisi})` : 'Seçili satırları sil',
      ikon: MENU_IKONLARI.seciliSil,
      devreDisi: seciliSatirSayisi === 0,
      tehlike: true,
    },
  ];

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuSol = Math.min(menu.x, vw - 240);
  const menuUst = Math.min(menu.y, vh - 320);

  return createPortal(
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
          <button
            type="button"
            className={`ap-sag-tik-oge${oge.tehlike ? ' dg-sag-tik-oge--tehlike' : ''}`}
            disabled={oge.devreDisi}
            onClick={() => void islemCalistir(oge.id)}
          >
            <span>{oge.ikon}</span>
            <span>{oge.etiket}</span>
          </button>
        </div>
      ))}
    </div>,
    portalKok
  );
}
