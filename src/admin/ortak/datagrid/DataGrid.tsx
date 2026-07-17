import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import type { DataGridCizgiModu, DataGridProps, HizliGirisApi, KolonTanimi } from './types';
import { useDataGridState, satirlariIsle, sayfala } from './useDataGridState';
import {
  formulaIpucuMetni,
  ifadeHesapla,
} from './formulaYardimci';
import { FormulaRehberiIcerik } from './FormulaRehberi';
import { bosGosterim, csvIndir, dgTooltipMetni, paraFormatla, tarihFormatla, yuzdeFormatla } from './formatYardimci';
import { DgIkon } from './DgIkonlar';
import { EtiketHucre } from './EtiketHucre';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import './datagrid.css';

function SatirPanelCubukKapak({ children, onKapat }: { children: ReactNode; onKapat: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useAksiyonCubuguPanelSync(true, panelRef);
  const footerKok = useMemo(() => document.querySelector('.ap-footer'), []);

  useEffect(() => {
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onKapat();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  if (!footerKok) return null;

  return createPortal(
    <div className="dg-satir-panel-cubuk-wrap">
      <div
        ref={panelRef}
        className="dg-satir-panel-cubuk dg-satir-panel-cubuk--kenarlik-anim"
        role="dialog"
        aria-modal="true"
        aria-label="Satır düzenle"
      >
        <div className="dg-satir-panel-icerik dg-satir-panel-icerik--cubuk">{children}</div>
      </div>
    </div>,
    footerKok
  );
}

function TopluBarCubukKapak({ children }: { children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useAksiyonCubuguPanelSync(true, panelRef);
  const footerKok = useMemo(() => document.querySelector('.ap-footer'), []);

  if (!footerKok) return null;

  return createPortal(
    <div className="dg-toplu-bar-cubuk-wrap">
      <div ref={panelRef} className="dg-toplu-bar dg-toplu-bar--cubuk" role="status">
        {children}
      </div>
    </div>,
    footerKok
  );
}

const HIZLI_GIRIS_SISTEM_KOLONLARI = new Set(['secim', 'islemler', 'olusturma', 'guncelleme', 'bagli']);

function kolonFormulaTipi<TRow>(kolon: KolonTanimi<TRow>): 'sayi' | 'iskonto' | null {
  if (kolon.formulaTip) return kolon.formulaTip;
  if (kolon.tip === 'iskonto') return 'iskonto';
  if (kolon.tip === 'para' || kolon.tip === 'sayi') return 'sayi';
  return null;
}

const SAYFA_BOYUTLARI = [5, 10, 25, 50];

type MenuHizalama = 'sag' | 'sol';

function portalMenuKonumHesapla(
  rect: DOMRect | undefined,
  genislik: number,
  maxH: number,
  hizalama: MenuHizalama = 'sag'
) {
  if (!rect) return { top: 0, left: 0 };
  let left = hizalama === 'sol' ? rect.left : rect.right - genislik;
  if (hizalama === 'sol' && left + genislik > window.innerWidth - 8) {
    left = rect.right - genislik;
  }
  if (left < 8) left = 8;
  if (left + genislik > window.innerWidth - 8) left = window.innerWidth - genislik - 8;
  let top = rect.bottom + 6;
  if (top + maxH > window.innerHeight - 8) top = Math.max(8, rect.top - maxH - 6);
  return { top, left };
}

const CIZGI_MODLARI: { mod: DataGridCizgiModu; ikon: 'cizgi-yok' | 'cizgi-yatay' | 'cizgi-dikey' | 'cizgi-tam'; title: string }[] = [
  { mod: 'yok', ikon: 'cizgi-yok', title: 'Çizgisiz' },
  { mod: 'yatay', ikon: 'cizgi-yatay', title: 'Yatay çizgiler' },
  { mod: 'dikey', ikon: 'cizgi-dikey', title: 'Dikey çizgiler' },
  { mod: 'tam', ikon: 'cizgi-tam', title: 'Tam ızgara' },
];

interface OdakHucre {
  satirId: string;
  kolonId: string;
}

interface DuzenlemeHucre extends OdakHucre {
  hamDeger: string;
  birlesikKatman?: 'ust' | 'alt';
}

interface SilmeOnayDurumu {
  satirId: string;
  metin: string;
}

function birlesikDuzenlemeKatmani<TRow>(
  e: ReactMouseEvent<HTMLTableCellElement>,
  satir: TRow,
  kolon: KolonTanimi<TRow>
): 'ust' | 'alt' {
  if (!kolon.birlesikDuzenle?.altDegerAl) return 'ust';
  const birlesik = kolon.degerAl(satir) as { ust?: string };
  const ad = String(birlesik.ust ?? '').trim();
  const kod = String(kolon.birlesikDuzenle.altDegerAl(satir) ?? '').trim();
  if (ad && kod) {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY - rect.top > rect.height / 2 ? 'alt' : 'ust';
  }
  if (kod && !ad) return 'alt';
  return 'ust';
}

function DgKesilenHucre({
  baslik,
  alt,
  kurSatir,
}: {
  baslik: string;
  alt?: string;
  kurSatir?: boolean;
}) {
  const tamMetin = [baslik, alt].filter(Boolean).join(' · ');
  return (
    <div className="dg-zengin-metin dg-tooltip-kabuk dg-kesilen-hucre">
      <div className="dg-zengin-baslik">{baslik}</div>
      {alt ? <div className={kurSatir ? 'dg-zengin-kur' : 'dg-zengin-alt'}>{alt}</div> : null}
      <span className="dg-tooltip dg-tooltip--hucre" role="tooltip">
        {tamMetin}
      </span>
    </div>
  );
}

function HucreGoster<TRow>({
  satir,
  kolon,
}: {
  satir: TRow;
  kolon: KolonTanimi<TRow>;
}) {
  const deger = kolon.degerAl(satir);
  if (kolon.goster) return <>{kolon.goster(satir, deger)}</>;

  const paraPb = kolon.paraSembolu === false ? null : '₺';

  switch (kolon.tip) {
    case 'zengin': {
      const z = deger as { baslik: string; alt?: string; kur?: string };
      return <DgKesilenHucre baslik={z.baslik} alt={z.alt ?? z.kur} kurSatir={Boolean(z.kur)} />;
    }
    case 'birlesik': {
      const b = deger as { ust: string; alt?: string };
      const kurSatir = Boolean(b.alt?.includes('=') || b.alt?.startsWith('$'));
      return <DgKesilenHucre baslik={b.ust} alt={b.alt} kurSatir={kurSatir} />;
    }
    case 'badge':
      return <span className="dg-rozet">{String(deger)}</span>;
    case 'etiket': {
      const etiketler = (deger as { metin: string; renk: string }[]) ?? [];
      return <EtiketHucre etiketler={etiketler} />;
    }
    case 'toggle': {
      const acik = Boolean(deger);
      return (
        <button
          type="button"
          className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
          aria-pressed={acik}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <span className="dg-switch-thumb" />
        </button>
      );
    }
    case 'iskonto': {
      const i = deger as { yuzde: number; tutar: number };
      return (
        <div className="dg-iskonto-hucre">
          <span className="dg-iskonto-yuzde">{yuzdeFormatla(i.yuzde)}</span>
          <span className="dg-iskonto-tutar">{paraFormatla(i.tutar, paraPb)}</span>
        </div>
      );
    }
    case 'para':
      return paraFormatla(Number(deger), paraPb);
    case 'tarih':
      return tarihFormatla(deger);
    case 'sayi':
      return Number.isFinite(Number(deger))
        ? Number(deger).toLocaleString('tr-TR', { maximumFractionDigits: 2 })
        : bosGosterim(deger);
    default:
      return <>{bosGosterim(deger)}</>;
  }
}

export function DataGrid<TRow extends { id: string }>({
  tabloBaslik,
  tabloAltBaslik,
  kolonlar,
  satirlar,
  depolamaAnahtari,
  bosMesaj = 'Henüz kayıt bulunmamaktadır.',
  yukleniyor = false,
  hata,
  kdvDahil = true,
  kdvDahilGoster = false,
  onKdvDahilDegistir,
  onSatirlarDegistir,
  onSatirGuncelle,
  satirDuzenlePaneli,
  varsayilanGizliKolonlar = [],
  kompakt = false,
  hizliGirisKolonlari,
  hizliGirisModu = 'satir',
  hizliGirisKarti,
  onHizliGiris,
  onHizliGirisEnter,
  hizliGirisInputSinif,
  hizliGirisInputPlaceholder,
  hizliGirisApiRef,
  gridApiRef,
  onSecimDegistir,
  hizliGirisOnizleme,
  kolonBaslikEki,
  satirSinifAdi,
  kolonGenislikSurumu,
  onSatirTikla,
  onSatirDuzenle,
  onSatirSil,
  hizliGirisIstegeBagli = false,
  hizliGirisVarsayilanAlan = false,
  formulMenuGoster = true,
  ustSolAraclarGoster = true,
  ustSagAraclarGoster = true,
  topluBarModu = 'ust',
  satirPanelModu = 'sheet',
}: DataGridProps<TRow>) {
  const dg = useDataGridState(kolonlar, depolamaAnahtari, varsayilanGizliKolonlar, kolonGenislikSurumu);
  const [hoverSatirId, setHoverSatirId] = useState<string | null>(null);
  const [odak, setOdak] = useState<OdakHucre | null>(null);
  const [duzenleme, setDuzenleme] = useState<DuzenlemeHucre | null>(null);
  const [satirPanel, setSatirPanel] = useState<TRow | null>(null);
  const [silmeOnay, setSilmeOnay] = useState<SilmeOnayDurumu | null>(null);
  const [resize, setResize] = useState<{ kolonId: string; baslangicX: number; baslangicGenislik: number } | null>(null);
  const [hizliGiris, setHizliGiris] = useState<Record<string, string>>(() => {
    const baslangic: Record<string, string> = {};
    for (const k of hizliGirisKolonlari ?? []) {
      if (k.varsayilan !== undefined) baslangic[k.kolonId] = k.varsayilan;
    }
    return baslangic;
  });
  const [hizliGirisGenisletildi, setHizliGirisGenisletildi] = useState(true);
  const [hizliGirisAcik, setHizliGirisAcik] = useState(!hizliGirisIstegeBagli);
  const [sutunMenuKonum, setSutunMenuKonum] = useState({ top: 0, left: 0 });
  const [formulMenuAcik, setFormulMenuAcik] = useState(false);
  const [formulMenuKonum, setFormulMenuKonum] = useState({ top: 0, left: 0 });
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const yatayScrollRef = useRef<HTMLDivElement>(null);
  const scrollSenkronRef = useRef(false);
  const kabukRef = useRef<HTMLDivElement>(null);
  const [scrollYukseklik, setScrollYukseklik] = useState<number | null>(null);
  const [yatayScrollGerekli, setYatayScrollGerekli] = useState(false);
  const [tabloGenisligi, setTabloGenisligi] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const formulMenuRef = useRef<HTMLDivElement>(null);
  const sutunTusRef = useRef<HTMLButtonElement>(null);
  const sutunMenuAnchorRef = useRef<HTMLElement | null>(null);
  const formulTusRef = useRef<HTMLButtonElement>(null);
  const hizliGirisIlkRef = useRef<HTMLInputElement>(null);
  const girdiRef = useRef<HTMLElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const duzenlemeCommitRef = useRef(false);
  const [baslikYukseklik, setBaslikYukseklik] = useState(40);

  const hizliGirisKartModu = hizliGirisModu === 'kart' && Boolean(hizliGirisKolonlari?.length && onHizliGiris);
  const hizliGirisAktif = Boolean(hizliGirisKolonlari?.length && onHizliGiris);
  const hizliGirisSet = useMemo(
    () => new Set(hizliGirisKolonlari?.map((k) => k.kolonId) ?? []),
    [hizliGirisKolonlari]
  );
  const hizliGirisOnizle = useMemo(
    () => (hizliGirisOnizleme && hizliGirisAktif ? hizliGirisOnizleme(hizliGiris) : {}),
    [hizliGirisOnizleme, hizliGirisAktif, hizliGiris, kdvDahil]
  );

  const sutunMenuPortalStil = useMemo(() => {
    const koyu = document.querySelector('.admin-panel')?.getAttribute('data-tema') === 'koyu';
    return {
      top: sutunMenuKonum.top,
      left: sutunMenuKonum.left,
      backgroundColor: koyu ? '#1e293b' : '#ffffff',
      borderColor: koyu ? '#475569' : '#cbd5e1',
      color: koyu ? '#e2e8f0' : '#334155',
    };
  }, [sutunMenuKonum, dg.sutunMenuAcik]);

  const formulMenuPortalStil = useMemo(() => {
    const koyu = document.querySelector('.admin-panel')?.getAttribute('data-tema') === 'koyu';
    return {
      top: formulMenuKonum.top,
      left: formulMenuKonum.left,
      backgroundColor: koyu ? '#1e293b' : '#ffffff',
      borderColor: koyu ? '#475569' : '#cbd5e1',
      color: koyu ? '#e2e8f0' : '#334155',
    };
  }, [formulMenuKonum, formulMenuAcik]);

  const islenmis = useMemo(
    () =>
      satirlariIsle(
        satirlar,
        kolonlar,
        dg.siralama?.yon ? (dg.siralama as { kolonId: string; yon: 'asc' | 'desc' }) : null
      ),
    [satirlar, kolonlar, dg.siralama]
  );

  const sayfalama = useMemo(
    () => sayfala(islenmis, dg.sayfa, dg.ayar.sayfaBoyutu),
    [islenmis, dg.sayfa, dg.ayar.sayfaBoyutu]
  );

  const sabitLeftMap = useMemo(() => {
    const map = new Map<string, number>();
    const pinId = dg.ayar.sabitlenmisKolonlar[0];
    if (!pinId) return map;

    let left = 0;
    for (const k of dg.gorunurKolonlar) {
      map.set(k.id, left);
      left += dg.ayar.kolonGenislikleri[k.id] ?? k.genislik ?? 120;
      if (k.id === pinId) break;
    }
    return map;
  }, [dg.gorunurKolonlar, dg.ayar.sabitlenmisKolonlar, dg.ayar.kolonGenislikleri]);

  const sabitKolonMu = useCallback((kolonId: string) => sabitLeftMap.has(kolonId), [sabitLeftMap]);

  const sabitHucreSinifi = useCallback(
    (kolonId: string) => {
      const sabit = sabitKolonMu(kolonId);
      const sabitSinir = sabit && kolonId === dg.ayar.sabitlenmisKolonlar[0];
      return `${sabit ? ' dg-hucre--sabit' : ''}${sabitSinir ? ' dg-hucre--sabit-sinir' : ''}`;
    },
    [sabitKolonMu, dg.ayar.sabitlenmisKolonlar]
  );

  const sabitBaslikSinifi = useCallback(
    (kolonId: string) => {
      const sabit = sabitKolonMu(kolonId);
      const sabitSinir = sabit && kolonId === dg.ayar.sabitlenmisKolonlar[0];
      return `${sabit ? ' dg-baslik-hucre--sabit' : ''}${sabitSinir ? ' dg-baslik-hucre--sabit-sinir' : ''}`;
    },
    [sabitKolonMu, dg.ayar.sabitlenmisKolonlar]
  );

  const sabitHucreStili = useCallback(
    (kolonId: string, genislik: number) => {
      const sabit = sabitKolonMu(kolonId);
      const left = sabitLeftMap.get(kolonId);
      return {
        width: genislik,
        minWidth: genislik,
        maxWidth: genislik,
        ...(sabit && left !== undefined ? { left } : {}),
      };
    },
    [sabitKolonMu, sabitLeftMap]
  );

  useEffect(() => {
    if (!dg.sutunMenuAcik && !formulMenuAcik) return;
    const disTikla = (e: MouseEvent) => {
      const hedef = e.target as Node;
      if (
        menuRef.current?.contains(hedef) ||
        formulMenuRef.current?.contains(hedef) ||
        sutunTusRef.current?.contains(hedef) ||
        sutunMenuAnchorRef.current?.contains(hedef) ||
        formulTusRef.current?.contains(hedef)
      ) {
        return;
      }
      dg.setSutunMenuAcik(false);
      setFormulMenuAcik(false);
    };
    document.addEventListener('mousedown', disTikla);
    return () => document.removeEventListener('mousedown', disTikla);
  }, [dg.sutunMenuAcik, formulMenuAcik, dg]);

  useLayoutEffect(() => {
    const kabuk = kabukRef.current;
    if (!kabuk) return;

    const guncelle = () => {
      const ustBar = kabuk.querySelector('.dg-ust-bar') as HTMLElement | null;
      const topluBar = kabuk.querySelector('.dg-toplu-bar') as HTMLElement | null;
      const hataEl = kabuk.querySelector('.dg-hata') as HTMLElement | null;
      const yatayScroll = kabuk.querySelector('.dg-yatay-scroll') as HTMLElement | null;
      const alt = kabuk.querySelector('.dg-alt') as HTMLElement | null;
      const disHaric =
        (ustBar?.offsetHeight ?? 0) +
        (topluBar?.offsetHeight ?? 0) +
        (hataEl?.offsetHeight ?? 0) +
        (yatayScroll?.offsetHeight ?? 0) +
        (alt?.offsetHeight ?? 0);
      setScrollYukseklik(Math.max(160, kabuk.clientHeight - disHaric));
    };

    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(kabuk);
    window.addEventListener('resize', guncelle);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', guncelle);
    };
  }, [dg.seciliIdler.size, hata, hizliGirisGenisletildi, hizliGirisKartModu, yatayScrollGerekli]);

  const yatayScrollOlc = useCallback(() => {
    const scroll = scrollRef.current;
    const tablo = scroll?.querySelector('table');
    if (!scroll || !tablo) {
      setYatayScrollGerekli(false);
      setTabloGenisligi(0);
      return;
    }
    const genislik = tablo.scrollWidth;
    const gerekli = genislik > scroll.clientWidth + 1;
    setTabloGenisligi(genislik);
    setYatayScrollGerekli(gerekli);
    if (gerekli && yatayScrollRef.current) {
      yatayScrollRef.current.scrollLeft = scroll.scrollLeft;
    }
  }, []);

  useLayoutEffect(() => {
    yatayScrollOlc();
    const scroll = scrollRef.current;
    const tablo = scroll?.querySelector('table');
    if (!scroll || !tablo) return;
    const ro = new ResizeObserver(() => yatayScrollOlc());
    ro.observe(scroll);
    ro.observe(tablo);
    return () => ro.disconnect();
  }, [
    yatayScrollOlc,
    dg.gorunurKolonlar,
    dg.ayar.kolonGenislikleri,
    dg.ayar.kolonSirasi,
    satirlar.length,
    hizliGirisAcik,
  ]);

  const anaYatayScroll = useCallback(() => {
    if (scrollSenkronRef.current) return;
    const scroll = scrollRef.current;
    const yatay = yatayScrollRef.current;
    if (!scroll || !yatay) return;
    scrollSenkronRef.current = true;
    yatay.scrollLeft = scroll.scrollLeft;
    requestAnimationFrame(() => {
      scrollSenkronRef.current = false;
    });
  }, []);

  const yatayCubukScroll = useCallback(() => {
    if (scrollSenkronRef.current) return;
    const scroll = scrollRef.current;
    const yatay = yatayScrollRef.current;
    if (!scroll || !yatay) return;
    scrollSenkronRef.current = true;
    scroll.scrollLeft = yatay.scrollLeft;
    requestAnimationFrame(() => {
      scrollSenkronRef.current = false;
    });
  }, []);

  useLayoutEffect(() => {
    if (!theadRef.current) return;
    const guncelle = () => setBaslikYukseklik(theadRef.current?.offsetHeight ?? 40);
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(theadRef.current);
    return () => ro.disconnect();
  }, [dg.gorunurKolonlar.length]);

  const sutunMenuKonumGuncelle = useCallback(() => {
    const el = sutunMenuAnchorRef.current ?? sutunTusRef.current;
    setSutunMenuKonum(portalMenuKonumHesapla(el?.getBoundingClientRect(), 300, 420));
  }, []);

  const formulMenuKonumGuncelle = useCallback(() => {
    const rect = formulTusRef.current?.getBoundingClientRect();
    const genislik = formulMenuRef.current?.offsetWidth ?? Math.min(400, window.innerWidth - 16);
    setFormulMenuKonum(portalMenuKonumHesapla(rect, genislik, 560, 'sol'));
  }, []);

  useLayoutEffect(() => {
    if (!dg.sutunMenuAcik) return;
    sutunMenuKonumGuncelle();
    window.addEventListener('resize', sutunMenuKonumGuncelle);
    window.addEventListener('scroll', sutunMenuKonumGuncelle, true);
    return () => {
      window.removeEventListener('resize', sutunMenuKonumGuncelle);
      window.removeEventListener('scroll', sutunMenuKonumGuncelle, true);
    };
  }, [dg.sutunMenuAcik, sutunMenuKonumGuncelle]);

  useLayoutEffect(() => {
    if (!formulMenuAcik) return;
    formulMenuKonumGuncelle();
    const id = requestAnimationFrame(() => formulMenuKonumGuncelle());
    window.addEventListener('resize', formulMenuKonumGuncelle);
    window.addEventListener('scroll', formulMenuKonumGuncelle, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', formulMenuKonumGuncelle);
      window.removeEventListener('scroll', formulMenuKonumGuncelle, true);
    };
  }, [formulMenuAcik, formulMenuKonumGuncelle]);

  const hizliGirisSifirla = useCallback(() => {
    const baslangic: Record<string, string> = {};
    for (const k of hizliGirisKolonlari ?? []) {
      if (k.varsayilan !== undefined) baslangic[k.kolonId] = k.varsayilan;
      for (const b of k.birlesik ?? []) {
        if (baslangic[b.kolonId] === undefined) baslangic[b.kolonId] = '';
      }
      if (k.anaAlan && k.anaAlan !== k.kolonId && baslangic[k.anaAlan] === undefined) {
        baslangic[k.anaAlan] = '';
      }
    }
    if (hizliGirisVarsayilanAlan) baslangic.durum = baslangic.durum ?? 'true';
    setHizliGiris(baslangic);
  }, [hizliGirisKolonlari, hizliGirisVarsayilanAlan]);

  const hizliGirisDoluMu = useCallback(() => {
    if (hizliGirisVarsayilanAlan) {
      return Object.entries(hizliGiris).some(([id, deger]) => id !== 'durum' && deger.trim());
    }
    if (!hizliGirisKolonlari) return false;
    return hizliGirisKolonlari.some((k) => {
      const alanlar = [
        k.kolonId,
        ...(k.birlesik?.map((b) => b.kolonId) ?? []),
        ...(k.anaAlan && k.anaAlan !== k.kolonId ? [k.anaAlan] : []),
      ];
      return alanlar.some((id) => (hizliGiris[id] ?? '').trim());
    });
  }, [hizliGirisKolonlari, hizliGiris, hizliGirisVarsayilanAlan]);

  const hizliGirisGonder = useCallback(async () => {
    if (!onHizliGiris || !hizliGirisKolonlari) return;

    let engellendi = false;
    if (onHizliGirisEnter) {
      const urunAlani = (['urunKoduAdi', 'stokKodu', 'urun'] as const).find((id) => (hizliGiris[id] ?? '').trim());
      if (urunAlani) {
        onHizliGirisEnter({
          alanId: urunAlani,
          degerler: hizliGiris,
          engelle: () => {
            engellendi = true;
          },
        });
      }
    }
    if (engellendi) return;

    if (!hizliGirisDoluMu()) {
      if (hizliGirisIstegeBagli) setHizliGirisAcik(false);
      return;
    }

    const sonuc = onHizliGiris(hizliGiris);
    const beklenen = sonuc instanceof Promise ? await sonuc : sonuc;
    if (beklenen === false) return;

    hizliGirisSifirla();
    dg.setSayfa(0);
    if (hizliGirisIstegeBagli) {
      setHizliGirisAcik(false);
    } else {
      requestAnimationFrame(() => hizliGirisIlkRef.current?.focus());
    }
  }, [
    onHizliGiris,
    onHizliGirisEnter,
    hizliGirisKolonlari,
    hizliGiris,
    dg,
    hizliGirisSifirla,
    hizliGirisDoluMu,
    hizliGirisIstegeBagli,
  ]);

  useEffect(() => {
    onSecimDegistir?.([...dg.seciliIdler]);
  }, [dg.seciliIdler, onSecimDegistir]);

  useEffect(() => {
    const mevcut = new Set(satirlar.map((s) => s.id));
    const kalan = [...dg.seciliIdler].filter((id) => mevcut.has(id));
    if (kalan.length !== dg.seciliIdler.size) {
      dg.tumunuSec(kalan, kalan.length > 0);
    }
  }, [satirlar, dg.seciliIdler, dg.tumunuSec]);

  const hizliGirisApi = useMemo<HizliGirisApi>(
    () => ({
      degerler: hizliGiris,
      alanAyarla: (kolonId, deger) => setHizliGiris((o) => ({ ...o, [kolonId]: deger })),
      onEkle: hizliGirisGonder,
      sifirla: hizliGirisSifirla,
      onizleme: hizliGirisOnizle,
      kolonlar: hizliGirisKolonlari ?? [],
      genisletildi: hizliGirisGenisletildi,
      genisletToggle: () => setHizliGirisGenisletildi((a) => !a),
    }),
    [hizliGiris, hizliGirisGonder, hizliGirisSifirla, hizliGirisOnizle, hizliGirisKolonlari, hizliGirisGenisletildi]
  );

  useEffect(() => {
    if (!hizliGirisApiRef) return;
    hizliGirisApiRef.current = hizliGirisApi;
  }, [hizliGirisApi, hizliGirisApiRef]);

  useEffect(() => {
    if (duzenleme) girdiRef.current?.focus();
  }, [duzenleme]);

  useEffect(() => {
    if (!resize) return;
    const hareket = (e: MouseEvent) => {
      const fark = e.clientX - resize.baslangicX;
      dg.kolonGenislikAyarla(resize.kolonId, resize.baslangicGenislik + fark);
    };
    const birak = () => setResize(null);
    document.addEventListener('mousemove', hareket);
    document.addEventListener('mouseup', birak);
    return () => {
      document.removeEventListener('mousemove', hareket);
      document.removeEventListener('mouseup', birak);
    };
  }, [resize, dg]);

  const satirGuncelle = useCallback(
    (satir: TRow) => {
      const yeni = onSatirGuncelle ? onSatirGuncelle(satir) : satir;
      if (!onSatirlarDegistir) return;
      onSatirlarDegistir(satirlar.map((s) => (s.id === yeni.id ? yeni : s)));
    },
    [onSatirGuncelle, onSatirlarDegistir, satirlar]
  );

  const hucreDuzenlemeyiBitir = useCallback(
    (satir: TRow, kolon: KolonTanimi<TRow>, ham: string, birlesikKatman?: 'ust' | 'alt') => {
      if (kolon.tip === 'birlesik' && birlesikKatman === 'alt' && kolon.birlesikDuzenle?.altDegerYaz) {
        satirGuncelle(kolon.birlesikDuzenle.altDegerYaz(satir, ham));
        return;
      }
      if (!kolon.degerYaz) return;
      const formulaTip = kolonFormulaTipi(kolon);

      if (formulaTip === 'iskonto') {
        const yuzde = ifadeHesapla(ham, 'iskonto') ?? parseFloat(ham.replace(',', '.')) ?? 0;
        satirGuncelle(kolon.degerYaz(satir, yuzde));
        return;
      }
      if (formulaTip === 'sayi') {
        const sayi = ifadeHesapla(ham, 'sayi') ?? parseFloat(ham.replace(',', '.'));
        if (sayi !== null && !Number.isNaN(sayi)) satirGuncelle(kolon.degerYaz(satir, sayi));
        return;
      }
      satirGuncelle(kolon.degerYaz(satir, ham));
    },
    [satirGuncelle]
  );

  const gezinilebilirKolonMu = useCallback((kolon: KolonTanimi<TRow>) => {
    return kolon.id !== 'secim' && kolon.id !== 'islemler';
  }, []);

  const gezinilebilirKolonIndeksi = useCallback(
    (baslangic: number, yon: 1 | -1) => {
      let i = baslangic;
      while (i >= 0 && i < dg.gorunurKolonlar.length) {
        if (gezinilebilirKolonMu(dg.gorunurKolonlar[i])) return i;
        i += yon;
      }
      return -1;
    },
    [dg.gorunurKolonlar, gezinilebilirKolonMu]
  );

  const odakAyarla = useCallback((satirId: string, kolonId: string) => {
    setOdak({ satirId, kolonId });
  }, []);

  useLayoutEffect(() => {
    if (!odak || duzenleme) return;
    const kabuk = kabukRef.current;
    if (!kabuk) return;
    const el = kabuk.querySelector(
      `td.dg-hucre[data-satir-id="${CSS.escape(odak.satirId)}"][data-kolon-id="${CSS.escape(odak.kolonId)}"]`
    ) as HTMLElement | null;
    if (!el) return;
    if (document.activeElement === el || el.contains(document.activeElement)) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [odak, duzenleme, sayfalama.satirlar, dg.gorunurKolonlar]);

  const duzenlemeyiBaslat = (
    satir: TRow,
    kolon: KolonTanimi<TRow>,
    birlesikKatman: 'ust' | 'alt' = 'ust'
  ) => {
    if (!kolon.duzenlenebilir || kolon.tip === 'salt-okunur') return false;
    const deger = kolon.degerAl(satir);
    let ham = '';
    if (kolon.tip === 'iskonto') ham = String((deger as { yuzde: number }).yuzde);
    else if (kolon.tip === 'birlesik' && birlesikKatman === 'alt' && kolon.birlesikDuzenle?.altDegerAl) {
      ham = String(kolon.birlesikDuzenle.altDegerAl(satir) ?? '');
    } else if (kolon.tip === 'birlesik') ham = String((deger as { ust: string }).ust ?? '');
    else ham = String(deger ?? '');
    setDuzenleme({ satirId: satir.id, kolonId: kolon.id, hamDeger: ham, birlesikKatman });
    setOdak({ satirId: satir.id, kolonId: kolon.id });
    return true;
  };

  /** Hücre satır-içi düzenlenebilirse onu açar; değilse satır düzenleme paneli / sayfasına gider. */
  const hucreVeyaSatirDuzenle = (
    satir: TRow,
    kolon?: KolonTanimi<TRow> | null,
    birlesikKatman: 'ust' | 'alt' = 'ust'
  ) => {
    if (kolon && duzenlemeyiBaslat(satir, kolon, birlesikKatman)) return true;
    if (onSatirDuzenle) {
      onSatirDuzenle(satir);
      return true;
    }
    if (satirDuzenlePaneli) {
      setSatirPanel(satir);
      return true;
    }
    return false;
  };

  const klavyeNav = (e: KeyboardEvent, satir: TRow, kolonIdx: number) => {
    const satirIdx = sayfalama.satirlar.findIndex((s) => s.id === satir.id);
    const kolon = dg.gorunurKolonlar[kolonIdx];

    if ((e.key === 'Enter' || e.key === 'F2') && !duzenleme) {
      e.preventDefault();
      if (!kolon) return;
      if (e.key === 'Enter' && kolon.tip === 'toggle' && kolon.degerYaz) {
        satirGuncelle(kolon.degerYaz(satir, !Boolean(kolon.degerAl(satir))));
        return;
      }
      hucreVeyaSatirDuzenle(satir, kolon);
      return;
    }
    if (e.key === 'Escape' && duzenleme) {
      e.preventDefault();
      setDuzenleme(null);
      odakAyarla(satir.id, kolon?.id ?? dg.gorunurKolonlar[kolonIdx]?.id ?? '');
      return;
    }
    if (duzenleme) return;

    let yeniSatirIdx = satirIdx;
    let yeniKolonIdx = kolonIdx;

    if (e.key === 'ArrowDown') yeniSatirIdx = Math.min(satirIdx + 1, sayfalama.satirlar.length - 1);
    else if (e.key === 'ArrowUp') yeniSatirIdx = Math.max(satirIdx - 1, 0);
    else if (e.key === 'ArrowRight') {
      const sonraki = gezinilebilirKolonIndeksi(kolonIdx + 1, 1);
      if (sonraki < 0) return;
      yeniKolonIdx = sonraki;
    } else if (e.key === 'ArrowLeft') {
      const onceki = gezinilebilirKolonIndeksi(kolonIdx - 1, -1);
      if (onceki < 0) return;
      yeniKolonIdx = onceki;
    } else if (e.key === 'Home') {
      e.preventDefault();
      const ilk = gezinilebilirKolonIndeksi(0, 1);
      if (ilk < 0) return;
      yeniKolonIdx = ilk;
    } else if (e.key === 'End') {
      e.preventDefault();
      const son = gezinilebilirKolonIndeksi(dg.gorunurKolonlar.length - 1, -1);
      if (son < 0) return;
      yeniKolonIdx = son;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const yon: 1 | -1 = e.shiftKey ? -1 : 1;
      let aday = gezinilebilirKolonIndeksi(kolonIdx + yon, yon);
      let hedefSatirIdx = satirIdx;
      if (aday < 0) {
        hedefSatirIdx = satirIdx + yon;
        if (hedefSatirIdx < 0 || hedefSatirIdx >= sayfalama.satirlar.length) return;
        aday =
          yon === 1
            ? gezinilebilirKolonIndeksi(0, 1)
            : gezinilebilirKolonIndeksi(dg.gorunurKolonlar.length - 1, -1);
        if (aday < 0) return;
        yeniSatirIdx = hedefSatirIdx;
      }
      yeniKolonIdx = aday;
    } else return;

    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft'
    ) {
      e.preventDefault();
    }

    const hedefSatir = sayfalama.satirlar[yeniSatirIdx];
    const hedefKolon = dg.gorunurKolonlar[yeniKolonIdx];
    if (hedefSatir && hedefKolon && gezinilebilirKolonMu(hedefKolon)) {
      odakAyarla(hedefSatir.id, hedefKolon.id);
    }
  };

  const csvAktar = (sadeceSecili = false) => {
    const kaynak = sadeceSecili
      ? islenmis.filter((s) => dg.seciliIdler.has(s.id))
      : islenmis;
    const exportKolonlar = kolonlar.filter((k) => k.id !== 'secim' && k.id !== 'islemler' && !dg.ayar.gizliKolonlar.includes(k.id));
    const basliklar = exportKolonlar.map((k) => k.baslik);
    const satirVeri = kaynak.map((s) =>
      exportKolonlar.map((k) => {
        const d = k.degerAl(s);
        if (d && typeof d === 'object') return JSON.stringify(d);
        return String(d ?? '');
      })
    );
    csvIndir(
      (tabloBaslik.trim() || depolamaAnahtari || 'tablo').replace(/\s+/g, '-').toLowerCase(),
      basliklar,
      satirVeri
    );
  };

  useEffect(() => {
    if (!gridApiRef) return;
    gridApiRef.current = {
      satirDuzenleAc: (satirId) => {
        const satir = satirlar.find((s) => s.id === satirId);
        if (satir && satirDuzenlePaneli) setSatirPanel(satir);
      },
      csvIndir: (sadeceSecili) => csvAktar(sadeceSecili),
      sutunMenuToggle: (anchor) => {
        if (anchor) sutunMenuAnchorRef.current = anchor;
        else if (anchor === null) sutunMenuAnchorRef.current = null;
        setFormulMenuAcik(false);
        dg.setSutunMenuAcik((acik) => {
          const sonraki = !acik;
          if (!sonraki) sutunMenuAnchorRef.current = null;
          return sonraki;
        });
      },
      hizliGirisOdakla: () => {
        if (hizliGirisIstegeBagli) setHizliGirisAcik(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => hizliGirisIlkRef.current?.focus());
        });
      },
      hizliGirisKapat: () => {
        if (!hizliGirisIstegeBagli) return;
        setHizliGirisAcik(false);
        hizliGirisSifirla();
      },
      seciliIdler: () => [...dg.seciliIdler],
      secimAyarla: (idler) => dg.tumunuSec(idler, idler.length > 0),
    };
    return () => {
      gridApiRef.current = null;
    };
  }, [gridApiRef, satirlar, dg.seciliIdler, dg.tumunuSec, satirDuzenlePaneli, hizliGirisIstegeBagli, hizliGirisSifirla]);

  const topluDurum = (aktif: boolean) => {
    if (!onSatirlarDegistir) return;
    onSatirlarDegistir(
      satirlar.map((s) => {
        if (!dg.seciliIdler.has(s.id)) return s;
        const durumKolon = kolonlar.find((k) => k.id === 'durum');
        if (durumKolon?.degerYaz) return durumKolon.degerYaz(s, aktif);
        return s;
      })
    );
  };

  const satirSil = useCallback(
    (satirId: string) => {
      if (!onSatirlarDegistir) return;
      const satir = satirlar.find((s) => s.id === satirId);
      const urunKolon = kolonlar.find((k) => k.id === 'urunKoduAdi');
      const urunDegeri = satir && urunKolon ? urunKolon.degerAl(satir) : null;
      const urunMetni =
        urunDegeri && typeof urunDegeri === 'object' && 'ust' in (urunDegeri as Record<string, unknown>)
          ? String((urunDegeri as { alt?: string; ust?: string }).alt ?? (urunDegeri as { ust?: string }).ust ?? '').trim()
          : '';
      setSilmeOnay({
        satirId,
        metin: urunMetni || `Satır #${satirId}`,
      });
    },
    [onSatirlarDegistir, satirlar, kolonlar]
  );

  const satirSilOnayla = useCallback(() => {
    if (!silmeOnay || !onSatirlarDegistir) return;
    onSatirlarDegistir(satirlar.filter((s) => s.id !== silmeOnay.satirId));
    setSatirPanel((onceki) => (onceki?.id === silmeOnay.satirId ? null : onceki));
    setSilmeOnay(null);
  }, [silmeOnay, onSatirlarDegistir, satirlar]);

  const renderSatirlar = () => {
    if (yukleniyor) {
      return Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="dg-skeleton-satir">
          {dg.gorunurKolonlar.map((k) => (
            <td key={k.id} className="dg-hucre">
              <div className="dg-skeleton-cubuk" style={{ width: `${50 + (i * 13) % 40}%` }} />
            </td>
          ))}
        </tr>
      ));
    }

    if (!sayfalama.satirlar.length) {
      if (hizliGirisAktif) return null;
      return (
        <tr>
          <td colSpan={dg.gorunurKolonlar.length} className="dg-bos">
            {bosMesaj}
          </td>
        </tr>
      );
    }

    const satirlarEl: ReactNode[] = [];
    const ilkGezinilebilirIdx = gezinilebilirKolonIndeksi(0, 1);
    const ilkSatirId = sayfalama.satirlar[0]?.id;

    for (const satir of sayfalama.satirlar) {
      const secili = dg.seciliIdler.has(satir.id);
      const hover = hoverSatirId === satir.id;
      const ekSatirSinif = satirSinifAdi?.(satir) ?? '';
      const tiklanabilir = Boolean(onSatirTikla);

      satirlarEl.push(
        <tr
          key={satir.id}
          data-satir-id={satir.id}
          className={`dg-satir${secili ? ' dg-satir--secili' : ''}${hover ? ' dg-satir--hover' : ''}${duzenleme?.satirId === satir.id ? ' dg-satir--duzenleniyor' : ''}${tiklanabilir ? ' dg-satir--tiklanabilir' : ''}${ekSatirSinif ? ` ${ekSatirSinif}` : ''}`}
          onMouseEnter={() => setHoverSatirId(satir.id)}
          onMouseLeave={() => setHoverSatirId(null)}
          onClick={(e) => {
            if (!onSatirTikla) return;
            const hedef = e.target as HTMLElement;
            if (hedef.closest('button, input, a, .dg-islem-grup, .dg-secim-kabuk')) return;
            onSatirTikla(satir);
          }}
          onDoubleClick={() => {
            const ilk = dg.gorunurKolonlar.find(
              (k) => gezinilebilirKolonMu(k) && k.duzenlenebilir && k.tip !== 'salt-okunur'
            );
            hucreVeyaSatirDuzenle(satir, ilk ?? null);
          }}
        >
          {dg.gorunurKolonlar.map((kolon, kolonIdx) => {
            const sabit = sabitKolonMu(kolon.id);
            const left = sabitLeftMap.get(kolon.id);
            const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
            const odakta = odak?.satirId === satir.id && odak?.kolonId === kolon.id;
            const duzenliyor = duzenleme?.satirId === satir.id && duzenleme?.kolonId === kolon.id;
            const gezinilebilir = gezinilebilirKolonMu(kolon);
            const varsayilanOdak =
              !odak && satir.id === ilkSatirId && kolonIdx === ilkGezinilebilirIdx;
            const hucreTabIndex = gezinilebilir ? (odakta || varsayilanOdak ? 0 : -1) : undefined;

            if (kolon.id === 'secim') {
              return (
                <td
                  key={kolon.id}
                  data-kolon-id={kolon.id}
                  data-satir-id={satir.id}
                  className={`dg-hucre dg-hucre--secim${sabitHucreSinifi(kolon.id)}`}
                  style={{ width: genislik, left: sabit ? left : undefined }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="dg-secim-kabuk">
                    <input
                      type="checkbox"
                      className="dg-checkbox"
                      checked={secili}
                      onChange={() => dg.secimToggle(satir.id)}
                    />
                  </span>
                </td>
              );
            }

            if (kolon.id === 'islemler') {
              return (
                <td
                  key={kolon.id}
                  data-kolon-id={kolon.id}
                  data-satir-id={satir.id}
                  className="dg-hucre dg-hucre--sag-sabit"
                  style={{ width: genislik }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="dg-islem-grup">
                    {(satirDuzenlePaneli || onSatirDuzenle) && (
                      <button
                        type="button"
                        className="dg-islem-tus"
                        title={dgTooltipMetni('Satırı düzenle')}
                        aria-label="Satırı düzenle"
                        onClick={() =>
                          onSatirDuzenle ? onSatirDuzenle(satir) : setSatirPanel(satir)
                        }
                      >
                        ✎
                      </button>
                    )}
                    {(onSatirlarDegistir || onSatirSil) && (
                      <button
                        type="button"
                        className="dg-islem-tus dg-islem-tus--tehlike"
                        title={dgTooltipMetni('Satırı sil')}
                        aria-label="Satırı sil"
                        onClick={() =>
                          onSatirSil ? onSatirSil(satir) : satirSil(satir.id)
                        }
                      >
                        <DgIkon ad="sil" />
                      </button>
                    )}
                  </div>
                </td>
              );
            }

            if (kolon.tip === 'toggle') {
              const acik = Boolean(kolon.degerAl(satir));
              return (
                <td
                  key={kolon.id}
                  data-kolon-id={kolon.id}
                  data-satir-id={satir.id}
                  className={`dg-hucre dg-hucre--toggle${sabitHucreSinifi(kolon.id)}${odakta ? ' dg-hucre--odak' : ''}`}
                  style={{ width: genislik, minWidth: genislik, left: sabit ? left : undefined }}
                  tabIndex={hucreTabIndex}
                  onFocus={() => odakAyarla(satir.id, kolon.id)}
                  onKeyDown={(e) => klavyeNav(e, satir, kolonIdx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    odakAyarla(satir.id, kolon.id);
                    if (kolon.degerYaz) satirGuncelle(kolon.degerYaz(satir, !acik));
                  }}
                >
                  <span className="dg-toggle-ortala">
                    <button
                      type="button"
                      className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
                      aria-pressed={acik}
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (kolon.degerYaz) satirGuncelle(kolon.degerYaz(satir, !acik));
                      }}
                    >
                      <span className="dg-switch-thumb" />
                    </button>
                  </span>
                </td>
              );
            }

            const kesilebilir = kolon.tip === 'birlesik' || kolon.tip === 'zengin';
            const satirIciDuzenlenebilir = Boolean(
              kolon.duzenlenebilir && kolon.tip !== 'salt-okunur'
            );
            const satirDuzenlemeVar = Boolean(onSatirDuzenle || satirDuzenlePaneli);

            return (
              <td
                key={kolon.id}
                data-kolon-id={kolon.id}
                data-satir-id={satir.id}
                className={`dg-hucre${kesilebilir ? '' : ' dg-tooltip-kabuk'}${kolon.tip === 'etiket' ? ' dg-hucre--etiket' : ''}${kesilebilir ? ' dg-hucre--kesilebilir' : ''}${sabitHucreSinifi(kolon.id)}${kolon.tip === 'para' || kolon.tip === 'sayi' || kolon.tip === 'iskonto' ? ' dg-hucre--sayi' : ''}${odakta ? ' dg-hucre--odak' : ''}`}
                style={{ width: genislik, minWidth: genislik, left: sabit ? left : undefined }}
                tabIndex={hucreTabIndex}
                onFocus={() => odakAyarla(satir.id, kolon.id)}
                onKeyDown={(e) => klavyeNav(e, satir, kolonIdx)}
                onClick={() => odakAyarla(satir.id, kolon.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const katman =
                    kolon.tip === 'birlesik' && kolon.birlesikDuzenle
                      ? birlesikDuzenlemeKatmani(e, satir, kolon)
                      : 'ust';
                  hucreVeyaSatirDuzenle(satir, kolon, katman);
                }}
              >
                {hover && !duzenliyor && (satirIciDuzenlenebilir || satirDuzenlemeVar) && (
                  <span className="dg-tooltip">
                    {dgTooltipMetni(
                      satirIciDuzenlenebilir
                        ? 'Düzenlemek için çift tıklayın veya Enter'
                        : 'Düzenleme sayfası için çift tıklayın veya Enter'
                    )}
                  </span>
                )}
                {duzenliyor ? (
                  kolon.secenekler?.length ? (
                    <select
                      ref={girdiRef as React.RefObject<HTMLSelectElement>}
                      className="dg-hucre-girdi dg-hucre-secim"
                      value={duzenleme.hamDeger}
                      onChange={(e) => {
                        const yeni = e.target.value;
                        duzenlemeCommitRef.current = true;
                        hucreDuzenlemeyiBitir(satir, kolon, yeni);
                        setDuzenleme(null);
                        odakAyarla(satir.id, kolon.id);
                      }}
                      onBlur={() => {
                        if (duzenlemeCommitRef.current) {
                          duzenlemeCommitRef.current = false;
                          return;
                        }
                        setDuzenleme(null);
                        odakAyarla(satir.id, kolon.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          duzenlemeCommitRef.current = true;
                          setDuzenleme(null);
                          odakAyarla(satir.id, kolon.id);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {kolon.secenekler.map((s) => (
                        <option key={s.deger} value={s.deger}>
                          {s.etiket}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      ref={girdiRef as React.RefObject<HTMLInputElement>}
                      className="dg-hucre-girdi"
                      value={duzenleme.hamDeger}
                      title={(() => {
                        const ft = kolonFormulaTipi(kolon);
                        return ft ? dgTooltipMetni(formulaIpucuMetni(ft)) : undefined;
                      })()}
                      placeholder={(() => {
                        const ft = kolonFormulaTipi(kolon);
                        return ft === 'sayi' ? '1000+%10' : ft === 'iskonto' ? '20+20' : undefined;
                      })()}
                      onChange={(e) => setDuzenleme({ ...duzenleme, hamDeger: e.target.value })}
                      onBlur={() => {
                        if (duzenlemeCommitRef.current) {
                          duzenlemeCommitRef.current = false;
                          return;
                        }
                        hucreDuzenlemeyiBitir(satir, kolon, duzenleme.hamDeger, duzenleme.birlesikKatman);
                        setDuzenleme(null);
                        odakAyarla(satir.id, kolon.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          duzenlemeCommitRef.current = true;
                          hucreDuzenlemeyiBitir(satir, kolon, duzenleme.hamDeger, duzenleme.birlesikKatman);
                          setDuzenleme(null);
                          const satirIdx = sayfalama.satirlar.findIndex((s) => s.id === satir.id);
                          const altSatir = sayfalama.satirlar[satirIdx + 1];
                          if (altSatir) odakAyarla(altSatir.id, kolon.id);
                          else odakAyarla(satir.id, kolon.id);
                        }
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          duzenlemeCommitRef.current = true;
                          setDuzenleme(null);
                          odakAyarla(satir.id, kolon.id);
                        }
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          duzenlemeCommitRef.current = true;
                          hucreDuzenlemeyiBitir(satir, kolon, duzenleme.hamDeger, duzenleme.birlesikKatman);
                          setDuzenleme(null);
                          const yon: 1 | -1 = e.shiftKey ? -1 : 1;
                          const sonraki = gezinilebilirKolonIndeksi(kolonIdx + yon, yon);
                          if (sonraki >= 0) {
                            odakAyarla(satir.id, dg.gorunurKolonlar[sonraki].id);
                          } else {
                            odakAyarla(satir.id, kolon.id);
                          }
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                ) : (
                  <HucreGoster satir={satir} kolon={kolon} />
                )}
              </td>
            );
          })}
        </tr>
      );
    }

    return satirlarEl;
  };

  const renderHizliGirisSatiri = () => {
    if (!hizliGirisAktif || hizliGirisKartModu) return null;
    if (hizliGirisIstegeBagli && !hizliGirisAcik) return null;

    const colspanAtlanan = new Set<string>();
    for (const k of hizliGirisKolonlari ?? []) {
      const kolonSabit = sabitKolonMu(k.kolonId);
      const etkinColspan = kolonSabit ? 1 : (k.colspan ?? 1);
      if (etkinColspan <= 1) continue;
      const idx = dg.gorunurKolonlar.findIndex((c) => c.id === k.kolonId);
      if (idx < 0) continue;
      for (let i = 1; i < etkinColspan; i++) {
        const sonraki = dg.gorunurKolonlar[idx + i];
        if (sonraki) colspanAtlanan.add(sonraki.id);
      }
    }

    let ilkGirdi = true;

    const girdiDegistir = (kolonId: string, deger: string) =>
      setHizliGiris((onceki) => ({ ...onceki, [kolonId]: deger }));

    const metinGirdi = (
      kolonId: string,
      placeholder: string,
      ipucu: string,
      refAta: boolean,
      kucuk?: boolean,
      ozelTus?: (e: KeyboardEvent<HTMLInputElement>) => void
    ) => {
      const deger = hizliGiris[kolonId] ?? '';
      const gosterilenPlaceholder =
        hizliGirisInputPlaceholder?.(kolonId, deger, placeholder) ?? placeholder;
      const ekSinif = hizliGirisInputSinif?.(kolonId, deger);

      return (
        <input
          ref={refAta ? hizliGirisIlkRef : undefined}
          type="text"
          className={`dg-hizli-giris-girdi${kucuk ? ' dg-hizli-giris-girdi--kucuk' : ''}${ekSinif ? ` ${ekSinif}` : ''}`}
          placeholder={gosterilenPlaceholder}
          title={ipucu ? dgTooltipMetni(ipucu) : undefined}
          value={deger}
          onChange={(e) => girdiDegistir(kolonId, e.target.value)}
          onKeyDown={(e) => {
            ozelTus?.(e);
            if (e.defaultPrevented) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              let engellendi = false;
              onHizliGirisEnter?.({
                alanId: kolonId,
                degerler: hizliGiris,
                engelle: () => {
                  engellendi = true;
                },
              });
              if (engellendi) {
                e.stopPropagation();
                return;
              }
              hizliGirisGonder();
            }
          }}
        />
      );
    };

    const secimGirdi = (
      kolonId: string,
      girisAyar: NonNullable<typeof hizliGirisKolonlari>[number]
    ) => {
      const girdiDeger = hizliGiris[kolonId] ?? girisAyar.varsayilan ?? '';
      return (
        <select
          className="dg-hizli-giris-girdi dg-hizli-giris-secim"
          title={girisAyar.ipucu ? dgTooltipMetni(girisAyar.ipucu) : undefined}
          value={girdiDeger}
          onChange={(e) => girdiDegistir(kolonId, e.target.value)}
        >
          <option value="">{girisAyar.placeholder ?? 'Seçin'}</option>
          {girisAyar.secenekler?.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );
    };

    const hucreler = dg.gorunurKolonlar.flatMap((kolon) => {
      if (colspanAtlanan.has(kolon.id)) return [];

      const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
      const girisAyar = hizliGirisKolonlari?.find((k) => k.kolonId === kolon.id);
      const placeholder = girisAyar?.placeholder ?? kolon.baslik;
      const ipucu = girisAyar?.ipucu ?? placeholder;
      const anaAlanId = girisAyar?.anaAlan ?? kolon.id;
      const hucreStil = sabitHucreStili(kolon.id, genislik);

      if (kolon.id === 'secim' && !girisAyar) {
        return [
          <td
            key={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre dg-hucre--secim${sabitHucreSinifi(kolon.id)}`}
            style={hucreStil}
            aria-hidden
          />,
        ];
      }

      if (kolon.id === 'islemler') {
        return [
          <td
            key={kolon.id}
            className="dg-hucre dg-hizli-giris-hucre dg-hucre--sag-sabit"
            style={{ width: genislik }}
          >
            <div className="dg-hizli-giris-ekle-kabuk">
              <button
                type="button"
                className="dg-hizli-giris-ekle"
                onClick={hizliGirisGonder}
                title={dgTooltipMetni('Satır ekle (Enter)')}
                aria-label="Satır ekle"
              >
                +
              </button>
            </div>
          </td>,
        ];
      }

      if (!hizliGirisSet.has(kolon.id) && !girisAyar?.birlesik && !girisAyar?.colspan) {
        if (hizliGirisVarsayilanAlan && !HIZLI_GIRIS_SISTEM_KOLONLARI.has(kolon.id)) {
          const refAta = ilkGirdi;
          if (ilkGirdi) ilkGirdi = false;

          if (kolon.id === 'durum') {
            const acik = (hizliGiris[kolon.id] ?? 'true') === 'true';
            return [
              <td
                key={kolon.id}
                className={`dg-hucre dg-hizli-giris-hucre dg-hizli-giris-hucre--toggle dg-hucre--toggle${sabitHucreSinifi(kolon.id)}`}
                style={{ ...hucreStil, minWidth: genislik }}
              >
                <span className="dg-toggle-ortala">
                  <button
                    type="button"
                    className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
                    aria-pressed={acik}
                    title={dgTooltipMetni(acik ? 'Aktif' : 'Pasif')}
                    onClick={() => girdiDegistir(kolon.id, acik ? 'false' : 'true')}
                  >
                    <span className="dg-switch-thumb" />
                  </button>
                </span>
              </td>,
            ];
          }

          if (kolon.id === 'paraBirimi') {
            const paraSecenekleri =
              hizliGirisKolonlari?.find((k) => k.kolonId === 'paraBirimi')?.secenekler ?? [];
            if (paraSecenekleri.length) {
              return [
                <td
                  key={kolon.id}
                  className={`dg-hucre dg-hizli-giris-hucre${sabitHucreSinifi(kolon.id)}`}
                  style={hucreStil}
                >
                  {secimGirdi(kolon.id, {
                    kolonId: 'paraBirimi',
                    tip: 'secim',
                    varsayilan: 'TL',
                    secenekler: paraSecenekleri,
                  })}
                </td>,
              ];
            }
          }

          return [
            <td
              key={kolon.id}
              className={`dg-hucre dg-hizli-giris-hucre${sabitHucreSinifi(kolon.id)}${kolon.tip === 'para' || kolon.tip === 'iskonto' || kolon.tip === 'sayi' ? ' dg-hucre--sayi' : ''}`}
              style={hucreStil}
            >
              {metinGirdi(kolon.id, kolon.baslik, kolon.baslik, refAta, true)}
            </td>,
          ];
        }

        const onizleme = hizliGirisOnizle[kolon.id];
        return [
          <td
            key={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre${onizleme ? ' dg-hizli-giris-onizle' : ' dg-hizli-giris-hucre--pasif'}${sabitHucreSinifi(kolon.id)}${kolon.tip === 'para' || kolon.tip === 'iskonto' || kolon.tip === 'sayi' ? ' dg-hucre--sayi' : ''}`}
            style={hucreStil}
          >
            {onizleme ?? null}
          </td>,
        ];
      }

      const refAta = ilkGirdi;
      if (ilkGirdi) ilkGirdi = false;

      const kolonSabit = sabitKolonMu(kolon.id);
      const birlesikAlanlar = girisAyar?.birlesik;
      const birlesikAktif = Boolean(birlesikAlanlar?.length) && !kolonSabit;

      if (birlesikAktif && birlesikAlanlar && girisAyar) {
        const yatayYigin = !girisAyar.birlesikDikey && birlesikAlanlar.length <= 2;
        return [
          <td
            key={kolon.id}
            colSpan={girisAyar.colspan ?? 1}
            className={`dg-hucre dg-hizli-giris-hucre dg-hizli-giris-hucre--birlesik${sabitHucreSinifi(kolon.id)}`}
            style={hucreStil}
          >
            <div
              className={`dg-hizli-giris-yigin${yatayYigin ? ' dg-hizli-giris-yigin--yatay' : ''}`}
            >
              {birlesikAlanlar.map((b) =>
                metinGirdi(
                  b.kolonId,
                  b.placeholder ?? '',
                  b.placeholder ?? '',
                  refAta && b === birlesikAlanlar[0],
                  true
                )
              )}
              {girisAyar.tip === 'secim' && girisAyar.secenekler?.length ? (
                secimGirdi(anaAlanId, girisAyar)
              ) : null}
            </div>
          </td>,
        ];
      }

      if (girisAyar?.tip === 'secim' && girisAyar.secenekler?.length) {
        return [
          <td
            key={kolon.id}
            data-kolon-id={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre${sabitHucreSinifi(kolon.id)}`}
            style={hucreStil}
          >
            {secimGirdi(kolon.id, girisAyar)}
          </td>,
        ];
      }

      if (girisAyar?.tip === 'toggle') {
        const acik = (hizliGiris[kolon.id] ?? girisAyar.varsayilan ?? 'true') === 'true';
        return [
          <td
            key={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre dg-hizli-giris-hucre--toggle dg-hucre--toggle${sabitHucreSinifi(kolon.id)}`}
            style={{ ...hucreStil, minWidth: genislik }}
          >
            <span className="dg-toggle-ortala">
              <button
                type="button"
                className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
                aria-pressed={acik}
                title={dgTooltipMetni(acik ? 'Aktif' : 'Pasif')}
                onClick={() => girdiDegistir(kolon.id, acik ? 'false' : 'true')}
              >
                <span className="dg-switch-thumb" />
              </button>
            </span>
          </td>,
        ];
      }

      return [
        <td
          key={kolon.id}
          className={`dg-hucre dg-hizli-giris-hucre${sabitHucreSinifi(kolon.id)}${kolon.tip === 'para' || kolon.tip === 'iskonto' || kolon.tip === 'sayi' ? ' dg-hucre--sayi' : ''}`}
          style={hucreStil}
        >
          {metinGirdi(kolon.id, placeholder, ipucu, refAta)}
        </td>,
      ];
    });

    return (
      <tr
        className="dg-hizli-giris-satir"
        style={{ ['--dg-header-h' as string]: `${baslikYukseklik}px` }}
        onBlurCapture={(e) => {
          const satir = e.currentTarget;
          requestAnimationFrame(() => {
            if (!satir.contains(document.activeElement)) {
              if (hizliGirisDoluMu()) {
                void hizliGirisGonder();
              } else if (hizliGirisIstegeBagli) {
                setHizliGirisAcik(false);
              }
            }
          });
        }}
      >
        {hucreler}
      </tr>
    );
  };

  const sutunMenuPanel =
    dg.sutunMenuAcik &&
    createPortal(
      <div
        ref={menuRef}
        className="dg-sutun-menu dg-sutun-menu-portal"
        style={sutunMenuPortalStil}
        role="dialog"
        aria-label="Sütunlar"
      >
        <div className="dg-sutun-menu-baslik">
          <div>
            <h3>Sütunlar</h3>
            <p>{tabloAltBaslik ?? 'Görünür sütunlar ve sırası'}</p>
          </div>
          <button type="button" className="dg-sutun-menu-sifirla" onClick={dg.varsayilanaDon}>
            Varsayılana Dön
          </button>
        </div>
        <div className="dg-sutun-menu-liste ap-scroll">
          {dg.ayar.kolonSirasi
            .filter((id) => id !== 'secim' && id !== 'islemler')
            .map((id, idx, arr) => {
              const kolon = kolonlar.find((k) => k.id === id);
              if (!kolon) return null;
              const gizli = dg.ayar.gizliKolonlar.includes(id);
              const sabitli = dg.ayar.sabitlenmisKolonlar.includes(id);
              return (
                <div key={id} className="dg-sutun-satir">
                  <input
                    type="checkbox"
                    checked={!gizli}
                    disabled={kolon.zorunlu}
                    onChange={(e) => dg.kolonGizle(id, !e.target.checked)}
                  />
                  <label>
                    <span>{kolon.baslik}</span>
                  </label>
                  <button
                    type="button"
                    className={`dg-sutun-ok${sabitli ? ' dg-sutun-ok--aktif' : ''}`}
                    title={dgTooltipMetni(sabitli ? 'Sabitlemeyi kaldır' : 'Sütunu sabitle')}
                    aria-label={sabitli ? 'Sabitlemeyi kaldır' : 'Sütunu sabitle'}
                    onClick={() => dg.sabitlenmisToggle(id)}
                  >
                    •
                  </button>
                  <div className="dg-sutun-oklar">
                    <button
                      type="button"
                      className="dg-sutun-ok"
                      disabled={idx === 0 || kolon.sabitSag}
                      title={dgTooltipMetni('Sütunu yukarı taşı')}
                      aria-label="Sütunu yukarı taşı"
                      onClick={() => dg.kolonTasi(id, 'yukari')}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="dg-sutun-ok"
                      disabled={idx === arr.length - 1 || kolon.sabitSag}
                      title={dgTooltipMetni('Sütunu aşağı taşı')}
                      aria-label="Sütunu aşağı taşı"
                      onClick={() => dg.kolonTasi(id, 'asagi')}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>,
      portalKok
    );

  const formulMenuPanel =
    formulMenuGoster &&
    formulMenuAcik &&
    createPortal(
      <div
        ref={formulMenuRef}
        className="dg-sutun-menu dg-sutun-menu-portal dg-formul-menu-portal"
        style={formulMenuPortalStil}
        role="dialog"
        aria-label="Sayı Formülleri"
      >
        <div className="dg-sutun-menu-baslik">
          <div>
            <h3>Sayı Formülleri</h3>
            <p>Fiyat ve miktar alanında çift tıklayıp yazın; Enter veya dışarı tıklayınca hesaplanır.</p>
          </div>
        </div>
        <div className="dg-sutun-menu-liste dg-formul-menu-liste ap-scroll">
          <FormulaRehberiIcerik />
        </div>
      </div>,
      portalKok
    );

  const sayfaIdleri = Array.from({ length: sayfalama.sayfaSayisi }, (_, i) => i);
  const gosterilecekSayfalar = sayfaIdleri.filter(
    (i) => i === 0 || i === sayfalama.sayfaSayisi - 1 || Math.abs(i - sayfalama.sayfa) <= 1
  );

  const ustBarSolVar = Boolean(tabloBaslik) || ustSolAraclarGoster;
  const ustBarSagKdv = Boolean(kdvDahilGoster && onKdvDahilDegistir);
  const ustBarSagIkon = ustSagAraclarGoster;
  const ustBarGoster = ustBarSolVar || ustBarSagKdv || ustBarSagIkon;

  return (
    <div className={`dg-kabuk${kompakt ? ' dg-kompakt' : ''}`} ref={kabukRef}>
      {ustBarGoster ? (
      <div className="dg-ust-bar">
        <div className="dg-ust-sol">
          {tabloBaslik && (
            <div className="dg-ust-baslik-wrap">
              <span className="dg-ust-baslik-ikon">
                <DgIkon ad="tablo" />
              </span>
              <h2 className="dg-ust-baslik">{tabloBaslik}</h2>
            </div>
          )}
          {ustSolAraclarGoster ? (
            <div className="dg-arac-grup">
              <div className="dg-sayfa-boyutu">
                <select
                  value={dg.ayar.sayfaBoyutu}
                  onChange={(e) => dg.sayfaBoyutuAyarla(Number(e.target.value))}
                  aria-label="Sayfa başına kayıt"
                >
                  {SAYFA_BOYUTLARI.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>Kayıt</span>
              </div>
              <span className="dg-arac-ayrac" />
              <div className="dg-cizgi-grup">
                <span className="dg-cizgi-etiket">Çizgi:</span>
                <div className="dg-cizgi-secim" role="group" aria-label="Tablo çizgileri">
                  {CIZGI_MODLARI.map(({ mod, ikon, title }) => (
                    <button
                      key={mod}
                      type="button"
                      className={`dg-tus dg-tus-ikon${dg.ayar.cizgiModu === mod ? ' dg-tus-aktif' : ''}`}
                      title={dgTooltipMetni(title)}
                      aria-pressed={dg.ayar.cizgiModu === mod}
                      onClick={() => dg.cizgiModuAyarla(mod)}
                    >
                      <DgIkon ad={ikon} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="dg-ust-sag">
          {ustBarSagKdv && (
            <div className="dg-kdv-kapsul">
              <span className="dg-kdv-etiket">KDV Dahil</span>
              <button
                type="button"
                className={`dg-switch${kdvDahil ? ' dg-switch--acik' : ''}`}
                onClick={() => onKdvDahilDegistir!(!kdvDahil)}
                aria-pressed={kdvDahil}
                title={dgTooltipMetni(
                  kdvDahil ? 'Fiyatlar KDV dahil hesaplanıyor' : 'Fiyatlar KDV hariç hesaplanıyor'
                )}
              >
                <span className="dg-switch-thumb" />
              </button>
            </div>
          )}
          {ustSagAraclarGoster ? (
          <div className="dg-ikon-grup">
            {formulMenuGoster && (
            <div className="dg-menu-wrap">
              <button
                ref={formulTusRef}
                type="button"
                className={`dg-tus dg-tus-ikon dg-tus-formul${formulMenuAcik ? ' dg-tus-aktif' : ''}`}
                title={dgTooltipMetni('Sayı Formülleri')}
                aria-pressed={formulMenuAcik}
                onClick={() => {
                  if (formulMenuAcik) {
                    setFormulMenuAcik(false);
                    return;
                  }
                  dg.setSutunMenuAcik(false);
                  setFormulMenuAcik(true);
                }}
              >
                <span className="dg-formul-tus-metin" aria-hidden>
                  ƒx
                </span>
              </button>
            </div>
            )}
            <div className="dg-menu-wrap">
              <button
                ref={sutunTusRef}
                type="button"
                className={`dg-tus dg-tus-ikon${dg.sutunMenuAcik ? ' dg-tus-aktif' : ''}`}
                title={dgTooltipMetni('Sütun görünürlüğü')}
                onClick={() => {
                  sutunMenuAnchorRef.current = null;
                  if (!dg.sutunMenuAcik) sutunMenuKonumGuncelle();
                  setFormulMenuAcik(false);
                  dg.setSutunMenuAcik((a) => !a);
                }}
              >
                <DgIkon ad="sutun" />
              </button>
            </div>
            <button type="button" className="dg-tus dg-tus-ikon" title={dgTooltipMetni('CSV indir')} onClick={() => csvAktar(false)}>
              <DgIkon ad="indir" />
            </button>
          </div>
          ) : null}
        </div>
      </div>
      ) : null}

      {dg.seciliIdler.size > 0 &&
        (topluBarModu === 'cubuk' ? (
          <TopluBarCubukKapak>
            <span>{dg.seciliIdler.size} kayıt seçili</span>
            <button type="button" className="dg-tus" onClick={() => topluDurum(true)}>
              Aktif Yap
            </button>
            <button type="button" className="dg-tus" onClick={() => topluDurum(false)}>
              Pasif Yap
            </button>
            <button type="button" className="dg-tus" onClick={() => csvAktar(true)}>
              Dışa Aktar
            </button>
            <button type="button" className="dg-tus" onClick={dg.secimiTemizle}>
              Seçimi Temizle
            </button>
          </TopluBarCubukKapak>
        ) : (
          <div className="dg-toplu-bar">
            <span>{dg.seciliIdler.size} kayıt seçili</span>
            <button type="button" className="dg-tus" onClick={() => topluDurum(true)}>
              Aktif Yap
            </button>
            <button type="button" className="dg-tus" onClick={() => topluDurum(false)}>
              Pasif Yap
            </button>
            <button type="button" className="dg-tus" onClick={() => csvAktar(true)}>
              Dışa Aktar
            </button>
            <button type="button" className="dg-tus" onClick={dg.secimiTemizle}>
              Seçimi Temizle
            </button>
          </div>
        ))}

      {hata && <div className="dg-hata">{hata}</div>}

      {hizliGirisKartModu &&
        (hizliGirisKarti ? hizliGirisKarti(hizliGirisApi) : null)}

      <div className="dg-scroll-wrap">
        <div
          className="dg-scroll"
          ref={scrollRef}
          onScroll={yatayScrollGerekli ? anaYatayScroll : undefined}
          style={scrollYukseklik ? { height: scrollYukseklik, maxHeight: scrollYukseklik } : undefined}
        >
          <table className={`dg-tablo dg-tablo--cizgi-${dg.ayar.cizgiModu}`}>
          <colgroup>
            {dg.gorunurKolonlar.map((kolon) => {
              const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
              return <col key={kolon.id} style={{ width: genislik, minWidth: genislik }} />;
            })}
          </colgroup>
          <thead ref={theadRef}>
            <tr className="dg-baslik-satir">
              {dg.gorunurKolonlar.map((kolon) => {
                const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
                const siralamaAktif = dg.siralama?.kolonId === kolon.id;
                const pinGoster = kolon.id === dg.ayar.sabitlenmisKolonlar[0];

                if (kolon.id === 'secim') {
                  const tumSecili =
                    sayfalama.satirlar.length > 0 && sayfalama.satirlar.every((s) => dg.seciliIdler.has(s.id));
                  return (
                    <th
                      key={kolon.id}
                      data-kolon-id={kolon.id}
                      className={`dg-baslik-hucre dg-baslik-hucre--secim${sabitBaslikSinifi(kolon.id)}`}
                      style={sabitHucreStili(kolon.id, genislik)}
                    >
                      <span className="dg-secim-kabuk">
                        <input
                          type="checkbox"
                          className="dg-checkbox"
                          checked={tumSecili}
                          onChange={(e) =>
                            dg.tumunuSec(
                              sayfalama.satirlar.map((s) => s.id),
                              e.target.checked
                            )
                          }
                        />
                      </span>
                    </th>
                  );
                }

                return (
                  <th
                    key={kolon.id}
                    data-kolon-id={kolon.id}
                    className={`dg-baslik-hucre${kolon.tip === 'toggle' ? ' dg-baslik-hucre--toggle' : ''}${kolon.sabitSag ? ' dg-baslik-hucre--sag-sabit' : ''}${sabitBaslikSinifi(kolon.id)}${dg.suruklenenKolon === kolon.id ? ' dg-baslik-hucre--surukleniyor' : ''}`}
                    style={sabitHucreStili(kolon.id, genislik)}
                    draggable={!kolon.sabitSag}
                    onDragStart={() => !kolon.sabitSag && dg.setSuruklenenKolon(kolon.id)}
                    onDragEnd={() => dg.setSuruklenenKolon(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dg.suruklenenKolon && dg.suruklenenKolon !== kolon.id) {
                        dg.kolonSurukleBirak(dg.suruklenenKolon, kolon.id);
                      }
                      dg.setSuruklenenKolon(null);
                    }}
                  >
                    <div className="dg-baslik-icerik">
                      {!kolon.sabitSag && (
                        <span className="dg-surukle-tutamac" title={dgTooltipMetni('Sürükle')}>
                          ⠿
                        </span>
                      )}
                      <span title={kolon.baslikIpucu ?? kolon.baslik}>{kolon.baslik}</span>
                      {kolonBaslikEki?.(kolon.id)}
                      {kolon.siralama !== false && kolon.id !== 'islemler' && (
                        <button
                          type="button"
                          className={`dg-siralama-tus${siralamaAktif ? ' dg-siralama-tus--aktif' : ''}`}
                          onClick={() => dg.siralamaToggle(kolon.id)}
                          title={dgTooltipMetni('Sırala')}
                        >
                          {siralamaAktif ? (dg.siralama?.yon === 'asc' ? '▲' : '▼') : '↕'}
                        </button>
                      )}
                    </div>
                    {pinGoster && !kolon.sabitSag && (
                      <span className="dg-sabit-igne" title={dgTooltipMetni('Sabit sütun')} aria-hidden>
                        <DgIkon ad="igne" />
                      </span>
                    )}
                    {kolon.id !== 'islemler' && (
                      <span
                        className="dg-genislik-tutamac"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setResize({ kolonId: kolon.id, baslangicX: e.clientX, baslangicGenislik: genislik });
                        }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {renderHizliGirisSatiri()}
            {renderSatirlar()}
          </tbody>
        </table>
        </div>
        {yatayScrollGerekli ? (
          <div
            className="dg-yatay-scroll"
            ref={yatayScrollRef}
            onScroll={yatayCubukScroll}
            aria-label="Tablo yatay kaydırma"
            role="scrollbar"
            aria-orientation="horizontal"
          >
            <div className="dg-yatay-scroll-icerik" style={{ width: tabloGenisligi }} />
          </div>
        ) : null}
      </div>

      {sutunMenuPanel}
      {formulMenuPanel}

      <div className="dg-alt">
        <span>
          Toplam {sayfalama.toplam} Kayıttan {sayfalama.baslangic}-{sayfalama.bitis} Arası
        </span>
        <div className="dg-sayfalama">
          <button
            type="button"
            className="dg-tus"
            disabled={sayfalama.sayfa === 0}
            onClick={() => dg.setSayfa((s) => Math.max(0, s - 1))}
          >
            Önceki
          </button>
          {gosterilecekSayfalar.map((i) => (
            <button
              key={i}
              type="button"
              className={`dg-sayfa-no${i === sayfalama.sayfa ? ' dg-sayfa-no--aktif' : ''} dg-tus`}
              onClick={() => dg.setSayfa(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="dg-tus"
            disabled={sayfalama.sayfa >= sayfalama.sayfaSayisi - 1}
            onClick={() => dg.setSayfa((s) => s + 1)}
          >
            Sonraki
          </button>
        </div>
      </div>

      {satirPanel && satirDuzenlePaneli && (
        satirPanelModu === 'cubuk' ? (
          <SatirPanelCubukKapak onKapat={() => setSatirPanel(null)}>
            {satirDuzenlePaneli(
              satirPanel,
              (g) => {
                satirGuncelle(g);
                setSatirPanel(null);
              },
              () => setSatirPanel(null)
            )}
          </SatirPanelCubukKapak>
        ) : (
          createPortal(
            <div className="dg-satir-panel" role="dialog" aria-modal="true" aria-label="Satır düzenle">
              <div className="dg-satir-panel-backdrop" aria-hidden="true" />
              <div className="dg-satir-panel-icerik">
                {satirDuzenlePaneli(
                  satirPanel,
                  (g) => {
                    satirGuncelle(g);
                    setSatirPanel(null);
                  },
                  () => setSatirPanel(null)
                )}
              </div>
            </div>,
            portalKok
          )
        )
      )}

      {silmeOnay && (
        <SilmeOnayModal
          acik
          onKapat={() => setSilmeOnay(null)}
          onOnayla={satirSilOnayla}
          baslik="Bu satırı silmek istiyor musunuz?"
          hedefMetin={silmeOnay.metin}
          ariaLabel="Satır silme onayı"
        />
      )}
    </div>
  );
}
