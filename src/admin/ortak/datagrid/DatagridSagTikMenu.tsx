import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { DG_CIZGI_MODLARI, DG_SAYFA_BOYUTLARI } from '@/admin/ortak/datagrid/datagridSabitleri';
import { dgSagTikMenuRectAl } from '@/admin/ortak/datagrid/dgGeciciMenuAnchor';
import { hucrePanoyaMetni, secimMetnindenKopya } from '@/admin/ortak/datagrid/sagTikYardimci';
import { useSekmeDegisinceKapat } from '@/araclar/sekmePortal';

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
  | 'degeriYay'
  | 'sayfaBoyutu'
  | 'cizgi'
  | 'formul'
  | 'sutunGorunurluk'
  | 'aktifYap'
  | 'pasifYap'
  | 'disaAktar'
  | 'secimiTemizle';

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
  /** false ise kayıt/çizgi/formül/sütun/csv tablo araçları gizlenir */
  tabloAraclariGoster?: boolean;
  /** Seçim işlemleri: Aktif/Pasif/Dışa Aktar/Seçimi Temizle (varsayılan true) */
  secimIslemleriGoster?: boolean;
  onSatirEkleBaslat?: (konum: SatirEkleKonumu, satirId: string) => void;
  onSatirCogalt?: (satir: TRow) => void;
  onSatirSil?: (satir: TRow) => void;
  onSatirDuzenle?: (satir: TRow) => void;
  onSeciliSil?: (satirIdler: string[]) => void;
  onAktifYap?: () => void;
  onPasifYap?: () => void;
  onDisaAktar?: () => void;
  onSecimiTemizle?: () => void;
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

type FlyoutTip = 'satirEkle' | 'degeriYay' | 'sayfaBoyutu' | 'cizgi';

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
  sayfaBoyutu: '📄',
  cizgi: '▦',
  formul: 'ƒx',
  sutunGorunurluk: '▥',
  aktifYap: '✅',
  pasifYap: '⏸️',
  disaAktar: '📤',
  secimiTemizle: '✖️',
};

type SilmeOnayDurumu =
  | { tip: 'tek'; satir: { id: string }; metin: string }
  | { tip: 'coklu'; adet: number };

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
  tabloAraclariGoster = true,
  secimIslemleriGoster = true,
  onSatirEkleBaslat,
  onSatirCogalt,
  onSatirSil,
  onSatirDuzenle,
  onSeciliSil,
  onAktifYap,
  onPasifYap,
  onDisaAktar,
  onSecimiTemizle,
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

  useSekmeDegisinceKapat(kapat);

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
                etiket: (() => {
                  if (!menu.kopyaMetni) return menuBasligi('Panoya kopyala');
                  const kolonAdi = kolon?.baslik || menu.kolonId;
                  return kolonAdi
                    ? menuBasligi(`"${kolonAdi}" değerini panoya kopyala`)
                    : menuBasligi('Panoya kopyala');
                })(),
                ikon: MENU_IKONLARI.panoyaKopyala,
                devreDisi: !menu.kopyaMetni,
                ayiriciOnce: true,
                goster: true,
              },
              {
                id: 'aktifYap' as const,
                etiket: menuBasligi('Aktif yap'),
                ikon: MENU_IKONLARI.aktifYap,
                devreDisi: seciliSatirSayisi <= 0,
                ayiriciOnce: true,
                goster: secimIslemleriGoster && !!onAktifYap,
              },
              {
                id: 'pasifYap' as const,
                etiket: menuBasligi('Pasif yap'),
                ikon: MENU_IKONLARI.pasifYap,
                devreDisi: seciliSatirSayisi <= 0,
                goster: secimIslemleriGoster && !!onPasifYap,
              },
              {
                id: 'disaAktar' as const,
                etiket: menuBasligi('Dışa aktar'),
                ikon: MENU_IKONLARI.disaAktar,
                devreDisi: seciliSatirSayisi <= 0,
                ayiriciOnce: !onAktifYap && !onPasifYap,
                goster: secimIslemleriGoster,
              },
              {
                id: 'secimiTemizle' as const,
                etiket: menuBasligi('Seçimi temizle'),
                ikon: MENU_IKONLARI.secimiTemizle,
                devreDisi: seciliSatirSayisi <= 0,
                goster: secimIslemleriGoster,
              },
              {
                id: 'sayfaBoyutu' as const,
                etiket: menuBasligi(
                  `Kayıt (${gridApiRef.current?.sayfaBoyutu() ?? 10})`
                ),
                ikon: MENU_IKONLARI.sayfaBoyutu,
                flyout: true,
                ayiriciOnce: true,
                goster: tabloAraclariGoster,
              },
              {
                id: 'cizgi' as const,
                etiket: menuBasligi('Çizgi'),
                ikon: MENU_IKONLARI.cizgi,
                flyout: true,
                goster: tabloAraclariGoster,
              },
              {
                id: 'formul' as const,
                etiket: menuBasligi('Sayı formülleri'),
                ikon: MENU_IKONLARI.formul,
                goster: tabloAraclariGoster,
              },
              {
                id: 'sutunGorunurluk' as const,
                etiket: menuBasligi('Sütun görünürlüğü'),
                ikon: MENU_IKONLARI.sutunGorunurluk,
                goster: tabloAraclariGoster,
              },
              {
                id: 'csvDisa' as const,
                etiket: menuBasligi('CSV indir'),
                ikon: MENU_IKONLARI.csvDisa,
                goster: tabloAraclariGoster,
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
                        : oge.id === 'sayfaBoyutu'
                          ? 'sayfaBoyutu'
                          : oge.id === 'cizgi'
                            ? 'cizgi'
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
                          {flyout === 'sayfaBoyutu' && flyoutTip === 'sayfaBoyutu' && (
                            <div
                              className="ap-sag-tik-flyout dg-sag-tik-flyout"
                              role="menu"
                              aria-label="Sayfa başına kayıt"
                            >
                              {DG_SAYFA_BOYUTLARI.map((n) => {
                                const aktif = gridApiRef.current?.sayfaBoyutu() === n;
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    className={`ap-sag-tik-oge${aktif ? ' ap-sag-tik-oge-aktif' : ''}`}
                                    onClick={() => {
                                      gridApiRef.current?.sayfaBoyutuAyarla(n);
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
                            <div
                              className="ap-sag-tik-flyout dg-sag-tik-flyout"
                              role="menu"
                              aria-label="Tablo çizgileri"
                            >
                              {DG_CIZGI_MODLARI.map((alt) => {
                                const aktif = gridApiRef.current?.cizgiModu() === alt.mod;
                                return (
                                  <button
                                    key={alt.mod}
                                    type="button"
                                    className={`ap-sag-tik-oge${aktif ? ' ap-sag-tik-oge-aktif' : ''}`}
                                    onClick={() => {
                                      gridApiRef.current?.cizgiModuAyarla(alt.mod);
                                      kapat();
                                    }}
                                  >
                                    <span aria-hidden>{aktif ? '✓' : '·'}</span>
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
