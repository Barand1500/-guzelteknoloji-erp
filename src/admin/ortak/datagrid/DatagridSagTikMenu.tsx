import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { hucrePanoyaMetni, secimMetnindenKopya } from '@/admin/ortak/datagrid/sagTikYardimci';

function menuBasligi(metin: string): string {
  return metin.replace(/([\p{L}\p{M}']+)/gu, (kelime) => {
    if (!kelime) return kelime;
    return kelime.charAt(0).toLocaleUpperCase('tr') + kelime.slice(1);
  });
}

export type DatagridSagTikIslem =
  | 'satirSil'
  | 'seciliSil'
  | 'satirDuzenle'
  | 'satirCogalt'
  | 'csvDisa'
  | 'panoyaKopyala'
  | 'degeriYay';

export type SatirEkleKonumu = 'ust' | 'alt';
export type DegeriYayYon = 'ust' | 'alt';

export interface DatagridSagTikMenuDurum {
  x: number;
  y: number;
  satirId: string | null;
  kolonId: string | null;
  kopyaMetni: string;
}

interface DatagridSagTikMenuProps<TRow extends { id: string }> {
  konteynerRef: React.RefObject<HTMLElement | null>;
  kolonlar: KolonTanimi<TRow>[];
  satirlar: TRow[];
  seciliSatirSayisi: number;
  gridApiRef: React.RefObject<DataGridApi | null>;
  menuEtiketi?: string;
  satirEkleGoster?: boolean;
  satirCogaltGoster?: boolean;
  seciliSilGoster?: boolean;
  dahiliSilmeOnay?: boolean;
  onSatirEkleBaslat?: (konum: SatirEkleKonumu, satirId: string) => void;
  onSatirCogalt?: (satir: TRow) => void;
  onSatirSil?: (satir: TRow) => void;
  onSatirDuzenle?: (satir: TRow) => void;
  onSeciliSil?: (satirIdler: string[]) => void;
  onBilgi?: (mesaj: string) => void;
  hucrePanoyaMetniAl?: (satir: TRow, kolonId: string | null, kolonlar: KolonTanimi<TRow>[]) => string;
  satirSilMetniAl?: (satir: TRow) => string;
  /** Değeri Yay: kolonId + ham değer + hedef satırlar (üste veya alta) */
  onDegeriYay?: (kolonId: string, deger: unknown, satirlar: TRow[]) => void;
}

interface MenuOgesi {
  id: DatagridSagTikIslem | 'satirEkle';
  etiket: string;
  ikon: string;
  devreDisi?: boolean;
  tehlike?: boolean;
  ayiriciOnce?: boolean;
  flyout?: boolean;
  goster?: boolean;
}

type FlyoutTip = 'satirEkle' | 'degeriYay';

const SATIR_EKLE_ALT_OGELER: { konum: SatirEkleKonumu; etiket: string; ikon: string }[] = [
  { konum: 'ust', etiket: 'Üstüne Ekle', ikon: '↑' },
  { konum: 'alt', etiket: 'Altına Ekle', ikon: '↓' },
];

const DEGERI_YAY_ALT_OGELER: { yon: DegeriYayYon; etiket: string; ikon: string }[] = [
  { yon: 'ust', etiket: 'Üste Doğru', ikon: '↑' },
  { yon: 'alt', etiket: 'Alta Doğru', ikon: '↓' },
];

const MENU_IKONLARI: Record<DatagridSagTikIslem | 'satirEkle', string> = {
  satirEkle: '➕',
  satirDuzenle: '✏️',
  satirCogalt: '📑',
  panoyaKopyala: '📋',
  csvDisa: '⬇️',
  degeriYay: '↕',
  satirSil: '🗑️',
  seciliSil: '🗑️',
};

type SilmeOnayDurumu =
  | { tip: 'tek'; satir: { id: string }; metin: string }
  | { tip: 'coklu'; adet: number };

function kisaMetin(metin: string, limit = 28) {
  return metin.length > limit ? `${metin.slice(0, limit)}…` : metin;
}

export function DatagridSagTikMenu<TRow extends { id: string }>({
  konteynerRef,
  kolonlar,
  satirlar,
  seciliSatirSayisi,
  gridApiRef,
  menuEtiketi = 'Tablo menüsü',
  satirEkleGoster = true,
  satirCogaltGoster = true,
  seciliSilGoster = true,
  dahiliSilmeOnay = true,
  onSatirEkleBaslat,
  onSatirCogalt,
  onSatirSil,
  onSatirDuzenle,
  onSeciliSil,
  onBilgi,
  hucrePanoyaMetniAl = hucrePanoyaMetni,
  satirSilMetniAl,
  onDegeriYay,
}: DatagridSagTikMenuProps<TRow>) {
  const [menu, setMenu] = useState<DatagridSagTikMenuDurum | null>(null);
  const [flyout, setFlyout] = useState<FlyoutTip | null>(null);
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
      const hucreMetni = satir && kolonId ? hucrePanoyaMetniAl(satir, kolonId, kolonlar) : '';
      const kopyaMetni = hucreMetni || secimMetnindenKopya(e.target);

      setMenu({ x: e.clientX, y: e.clientY, satirId, kolonId, kopyaMetni });
      setFlyout(null);
    }

    kok.addEventListener('contextmenu', sagTik);
    return () => kok.removeEventListener('contextmenu', sagTik);
  }, [konteynerRef, satirlar, kolonlar, hucrePanoyaMetniAl]);

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

  function degeriYayCalistir(yon: DegeriYayYon) {
    if (!menu?.satirId || !menu.kolonId || !onDegeriYay) return;
    const satir = satirlar.find((s) => s.id === menu.satirId);
    const kolon = kolonlar.find((k) => k.id === menu.kolonId);
    if (!satir || !kolon) return;

    const deger = kolon.degerAl(satir);
    const satirIndeks = satirlar.findIndex((s) => s.id === menu.satirId);
    if (satirIndeks < 0) return;

    const hedefSatirlar =
      yon === 'ust' ? satirlar.slice(0, satirIndeks) : satirlar.slice(satirIndeks + 1);
    if (hedefSatirlar.length === 0) return;

    onDegeriYay(menu.kolonId, deger, hedefSatirlar);
    onBilgi?.(yon === 'ust' ? 'Değer üst satırlara yayıldı' : 'Değer alt satırlara yayıldı');
  }

  async function islemCalistir(id: DatagridSagTikIslem) {
    if (!menu) return;
    const api = gridApiRef.current;
    const satir = menu.satirId ? satirlar.find((s) => s.id === menu.satirId) : null;

    switch (id) {
      case 'satirDuzenle':
        if (satir) onSatirDuzenle?.(satir);
        else if (menu.satirId) api?.satirDuzenleAc(menu.satirId);
        break;
      case 'satirCogalt':
        if (satir) onSatirCogalt?.(satir);
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
        if (satir) {
          if (dahiliSilmeOnay) {
            setSilmeOnay({
              tip: 'tek',
              satir,
              metin: satirSilMetniAl?.(satir) ?? `Satır #${satir.id}`,
            });
          } else {
            onSatirSil?.(satir);
          }
        }
        break;
      case 'seciliSil':
        if (seciliSatirSayisi > 0) {
          if (dahiliSilmeOnay) {
            setSilmeOnay({ tip: 'coklu', adet: seciliSatirSayisi });
          } else {
            onSeciliSil?.(gridApiRef.current?.seciliIdler() ?? []);
          }
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
      const satir = satirlar.find((s) => s.id === silmeOnay.satir.id);
      if (satir) onSatirSil?.(satir);
      onBilgi?.('Satır silindi');
    } else {
      const ids = gridApiRef.current?.seciliIdler() ?? [];
      onSeciliSil?.(ids);
      onBilgi?.('Seçili satırlar silindi');
    }
    setSilmeOnay(null);
  }, [silmeOnay, satirlar, onSatirSil, onSeciliSil, onBilgi, gridApiRef]);

  return (
    <>
      {menu &&
        createPortal(
          (() => {
            const satirIndeks = menu.satirId
              ? satirlar.findIndex((s) => s.id === menu.satirId)
              : -1;
            const ustteSatirVar = satirIndeks > 0;
            const alttaSatirVar = satirIndeks >= 0 && satirIndeks < satirlar.length - 1;

            const kolon = menu.kolonId ? kolonlar.find((k) => k.id === menu.kolonId) : null;
            const degeriYayUygun =
              !!onDegeriYay &&
              !!menu.kolonId &&
              !!menu.satirId &&
              !!kolon?.degerYaz &&
              kolon.id !== 'secim' &&
              kolon.id !== 'islemler';

            const ogeler: MenuOgesi[] = [
              {
                id: 'satirEkle' as const,
                etiket: menuBasligi('Satır ekle'),
                ikon: MENU_IKONLARI.satirEkle,
                devreDisi: !menu.satirId,
                flyout: true,
                goster: satirEkleGoster && !!onSatirEkleBaslat,
              },
              {
                id: 'satirDuzenle' as const,
                etiket: menuBasligi('Satırı düzenle'),
                ikon: MENU_IKONLARI.satirDuzenle,
                devreDisi: !menu.satirId,
                goster: true,
              },
              {
                id: 'satirCogalt' as const,
                etiket: menuBasligi('Satırı kopyala'),
                ikon: MENU_IKONLARI.satirCogalt,
                devreDisi: !menu.satirId,
                goster: satirCogaltGoster && !!onSatirCogalt,
              },
              {
                id: 'degeriYay' as const,
                etiket: (() => {
                  if (!degeriYayUygun || !kolon) return menuBasligi('Değeri yay');
                  const etkt = kolon.baslik || menu.kolonId!;
                  return menuBasligi(`"${etkt}" değerini yay`);
                })(),
                ikon: MENU_IKONLARI.degeriYay,
                flyout: true,
                devreDisi: !degeriYayUygun || (!ustteSatirVar && !alttaSatirVar),
                ayiriciOnce: true,
                goster: !!onDegeriYay,
              },
              {
                id: 'panoyaKopyala' as const,
                etiket: menu.kopyaMetni
                  ? menuBasligi(`"${kisaMetin(menu.kopyaMetni)}" değerini panoya kopyala`)
                  : menuBasligi('Panoya kopyala'),
                ikon: MENU_IKONLARI.panoyaKopyala,
                devreDisi: !menu.kopyaMetni,
                ayiriciOnce: true,
                goster: true,
              },
              {
                id: 'csvDisa' as const,
                etiket: menuBasligi('Dışa aktar (CSV)'),
                ikon: MENU_IKONLARI.csvDisa,
                ayiriciOnce: true,
                goster: true,
              },
              {
                id: 'satirSil' as const,
                etiket: menuBasligi('Satır sil'),
                ikon: MENU_IKONLARI.satirSil,
                devreDisi: !menu.satirId,
                tehlike: true,
                ayiriciOnce: true,
                goster: !!onSatirSil,
              },
              {
                id: 'seciliSil' as const,
                etiket:
                  seciliSatirSayisi > 0
                    ? menuBasligi(`Seçili satırları sil (${seciliSatirSayisi})`)
                    : menuBasligi('Seçili satırları sil'),
                ikon: MENU_IKONLARI.seciliSil,
                devreDisi: seciliSatirSayisi === 0,
                tehlike: true,
                goster: seciliSilGoster && !!onSeciliSil,
              },
            ].filter((oge) => oge.goster !== false);

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
                aria-label={menuEtiketi}
              >
                {ogeler.map((oge) => {
                  const flyoutTip: FlyoutTip | null =
                    oge.id === 'satirEkle'
                      ? 'satirEkle'
                      : oge.id === 'degeriYay'
                        ? 'degeriYay'
                        : null;

                  return (
                    <div key={oge.id}>
                      {oge.ayiriciOnce && <div className="ap-sag-tik-ayirici" role="separator" />}
                      {oge.flyout && flyoutTip ? (
                        <div
                          className="ap-sag-tik-flyout-wrap"
                          onMouseEnter={() => !oge.devreDisi && setFlyout(flyoutTip)}
                        >
                          <button
                            type="button"
                            className={`ap-sag-tik-oge${flyout === flyoutTip ? ' ap-sag-tik-oge-aktif' : ''}`}
                            disabled={oge.devreDisi}
                            onClick={() =>
                              !oge.devreDisi &&
                              setFlyout((f) => (f === flyoutTip ? null : flyoutTip))
                            }
                          >
                            <span>{oge.ikon}</span>
                            <span>{oge.etiket}</span>
                            <span className="ap-sag-tik-ok">›</span>
                          </button>
                          {flyout === 'satirEkle' && flyoutTip === 'satirEkle' && !oge.devreDisi && menu.satirId && (
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
                                  <span>{menuBasligi(alt.etiket)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {flyout === 'degeriYay' && flyoutTip === 'degeriYay' && !oge.devreDisi && (
                            <div
                              className="ap-sag-tik-flyout dg-sag-tik-flyout"
                              role="menu"
                              aria-label="Değeri yay seçenekleri"
                            >
                              {DEGERI_YAY_ALT_OGELER.map((alt) => {
                                const yonDevreDisi =
                                  alt.yon === 'ust' ? !ustteSatirVar : !alttaSatirVar;
                                return (
                                  <button
                                    key={alt.yon}
                                    type="button"
                                    className="ap-sag-tik-oge"
                                    disabled={yonDevreDisi}
                                    onClick={() => {
                                      if (yonDevreDisi) return;
                                      degeriYayCalistir(alt.yon);
                                      kapat();
                                    }}
                                  >
                                    <span>{alt.ikon}</span>
                                    <span>{menuBasligi(alt.etiket)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`ap-sag-tik-oge${oge.tehlike ? ' dg-sag-tik-oge--tehlike' : ''}`}
                          disabled={oge.devreDisi}
                          onMouseEnter={() => setFlyout(null)}
                          onClick={() => void islemCalistir(oge.id as DatagridSagTikIslem)}
                        >
                          <span>{oge.ikon}</span>
                          <span>{oge.etiket}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })(),
          portalKok
        )}

      {dahiliSilmeOnay && (
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
      )}
    </>
  );
}
