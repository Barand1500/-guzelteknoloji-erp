import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { DataGridProps, HizliGirisApi, KolonTanimi } from './types';
import { useDataGridState, satirlariIsle, sayfala } from './useDataGridState';
import { ifadeHesapla } from './formulaYardimci';
import { bosGosterim, csvIndir, paraFormatla, tarihFormatla, yuzdeFormatla } from './formatYardimci';
import { DgIkon } from './DgIkonlar';
import { EtiketHucre } from './EtiketHucre';
import './datagrid.css';

const SAYFA_BOYUTLARI = [5, 10, 25, 50];

interface OdakHucre {
  satirId: string;
  kolonId: string;
}

interface DuzenlemeHucre extends OdakHucre {
  hamDeger: string;
}

function HucreGoster<TRow>({
  satir,
  kolon,
  kdvDahil,
}: {
  satir: TRow;
  kolon: KolonTanimi<TRow>;
  kdvDahil?: boolean;
}) {
  const deger = kolon.degerAl(satir);
  if (kolon.goster) return <>{kolon.goster(satir, deger)}</>;

  switch (kolon.tip) {
    case 'zengin': {
      const z = deger as { baslik: string; alt?: string; kur?: string };
      return (
        <div className="dg-zengin-metin">
          <div className="dg-zengin-baslik">{z.baslik}</div>
          {z.alt && <div className="dg-zengin-alt">{z.alt}</div>}
          {z.kur && <div className="dg-zengin-kur">{z.kur}</div>}
        </div>
      );
    }
    case 'birlesik': {
      const b = deger as { ust: string; alt?: string };
      const kurSatir = b.alt?.includes('=') || b.alt?.startsWith('$');
      return (
        <div className="dg-zengin-metin">
          <div className="dg-zengin-baslik">{b.ust}</div>
          {b.alt && <div className={kurSatir ? 'dg-zengin-kur' : 'dg-zengin-alt'}>{b.alt}</div>}
        </div>
      );
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
          <span>{paraFormatla(i.tutar)}</span>
        </div>
      );
    }
    case 'para':
      return paraFormatla(Number(deger), kdvDahil ? '₺' : '₺');
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
  hizliGirisOnizleme,
  kolonBaslikEki,
  satirSinifAdi,
}: DataGridProps<TRow>) {
  const dg = useDataGridState(kolonlar, depolamaAnahtari, varsayilanGizliKolonlar);
  const [hoverSatirId, setHoverSatirId] = useState<string | null>(null);
  const [odak, setOdak] = useState<OdakHucre | null>(null);
  const [duzenleme, setDuzenleme] = useState<DuzenlemeHucre | null>(null);
  const [satirPanel, setSatirPanel] = useState<TRow | null>(null);
  const [resize, setResize] = useState<{ kolonId: string; baslangicX: number; baslangicGenislik: number } | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [hizliGiris, setHizliGiris] = useState<Record<string, string>>(() => {
    const baslangic: Record<string, string> = {};
    for (const k of hizliGirisKolonlari ?? []) {
      if (k.varsayilan !== undefined) baslangic[k.kolonId] = k.varsayilan;
    }
    return baslangic;
  });
  const [hizliGirisGenisletildi, setHizliGirisGenisletildi] = useState(true);
  const [sutunMenuKonum, setSutunMenuKonum] = useState({ top: 0, left: 0 });
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const kabukRef = useRef<HTMLDivElement>(null);
  const [scrollYukseklik, setScrollYukseklik] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sutunTusRef = useRef<HTMLButtonElement>(null);
  const hizliGirisIlkRef = useRef<HTMLInputElement>(null);
  const girdiRef = useRef<HTMLInputElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
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

  const islenmis = useMemo(
    () =>
      satirlariIsle(
        satirlar,
        kolonlar,
        dg.filtreler,
        dg.siralama?.yon ? (dg.siralama as { kolonId: string; yon: 'asc' | 'desc' }) : null
      ),
    [satirlar, kolonlar, dg.filtreler, dg.siralama]
  );

  const sayfalama = useMemo(
    () => sayfala(islenmis, dg.sayfa, dg.ayar.sayfaBoyutu),
    [islenmis, dg.sayfa, dg.ayar.sayfaBoyutu]
  );

  const tumKolonlarSecimHaric = dg.gorunurKolonlar.filter((k) => k.id !== 'secim' && k.id !== 'islemler');
  const filtreVarMi = tumKolonlarSecimHaric.some((k) => k.filtre);

  const sabitLeftMap = useMemo(() => {
    let left = 40;
    const map = new Map<string, number>();
    for (const k of dg.gorunurKolonlar) {
      if (dg.ayar.sabitlenmisKolonlar.includes(k.id)) {
        map.set(k.id, left);
        left += dg.ayar.kolonGenislikleri[k.id] ?? k.genislik ?? 120;
      }
    }
    return map;
  }, [dg.gorunurKolonlar, dg.ayar.sabitlenmisKolonlar, dg.ayar.kolonGenislikleri]);

  useEffect(() => {
    if (!dg.sutunMenuAcik) return;
    const disTikla = (e: MouseEvent) => {
      const hedef = e.target as Node;
      if (menuRef.current?.contains(hedef) || sutunTusRef.current?.contains(hedef)) return;
      dg.setSutunMenuAcik(false);
    };
    document.addEventListener('mousedown', disTikla);
    return () => document.removeEventListener('mousedown', disTikla);
  }, [dg.sutunMenuAcik, dg]);

  useLayoutEffect(() => {
    const kabuk = kabukRef.current;
    if (!kabuk) return;

    const guncelle = () => {
      const ustBar = kabuk.querySelector('.dg-ust-bar') as HTMLElement | null;
      const topluBar = kabuk.querySelector('.dg-toplu-bar') as HTMLElement | null;
      const hataEl = kabuk.querySelector('.dg-hata') as HTMLElement | null;
      const alt = kabuk.querySelector('.dg-alt') as HTMLElement | null;
      const disHaric =
        (ustBar?.offsetHeight ?? 0) +
        (topluBar?.offsetHeight ?? 0) +
        (hataEl?.offsetHeight ?? 0) +
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
  }, [dg.seciliIdler.size, filtreAcik, hata, hizliGirisGenisletildi, hizliGirisKartModu]);

  useLayoutEffect(() => {
    if (!theadRef.current) return;
    const guncelle = () => setBaslikYukseklik(theadRef.current?.offsetHeight ?? 40);
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(theadRef.current);
    return () => ro.disconnect();
  }, [filtreAcik, dg.gorunurKolonlar.length]);

  const sutunMenuKonumGuncelle = useCallback(() => {
    const rect = sutunTusRef.current?.getBoundingClientRect();
    if (!rect) return;
    const genislik = 300;
    let left = rect.right - genislik;
    if (left < 8) left = 8;
    if (left + genislik > window.innerWidth - 8) left = window.innerWidth - genislik - 8;
    let top = rect.bottom + 6;
    const maxH = 420;
    if (top + maxH > window.innerHeight - 8) top = Math.max(8, rect.top - maxH - 6);
    setSutunMenuKonum({ top, left });
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
    setHizliGiris(baslangic);
  }, [hizliGirisKolonlari]);

  const hizliGirisGonder = useCallback(() => {
    if (!onHizliGiris || !hizliGirisKolonlari) return;
    const dolu = hizliGirisKolonlari.some((k) => {
      const alanlar = [
        k.kolonId,
        ...(k.birlesik?.map((b) => b.kolonId) ?? []),
        ...(k.anaAlan && k.anaAlan !== k.kolonId ? [k.anaAlan] : []),
      ];
      return alanlar.some((id) => (hizliGiris[id] ?? '').trim());
    });
    if (!dolu) return;
    onHizliGiris(hizliGiris);
    hizliGirisSifirla();
    dg.setSayfa(0);
    requestAnimationFrame(() => hizliGirisIlkRef.current?.focus());
  }, [onHizliGiris, hizliGirisKolonlari, hizliGiris, dg, hizliGirisSifirla]);

  const hizliGirisApi = useMemo<HizliGirisApi>(
    () => ({
      degerler: hizliGiris,
      alanAyarla: (kolonId, deger) => setHizliGiris((o) => ({ ...o, [kolonId]: deger })),
      onEkle: hizliGirisGonder,
      onizleme: hizliGirisOnizle,
      kolonlar: hizliGirisKolonlari ?? [],
      genisletildi: hizliGirisGenisletildi,
      genisletToggle: () => setHizliGirisGenisletildi((a) => !a),
    }),
    [hizliGiris, hizliGirisGonder, hizliGirisOnizle, hizliGirisKolonlari, hizliGirisGenisletildi]
  );

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
    (satir: TRow, kolon: KolonTanimi<TRow>, ham: string) => {
      if (!kolon.degerYaz) return;
      const formulaTip =
        kolon.formulaTip ??
        (kolon.tip === 'iskonto' ? 'iskonto' : kolon.tip === 'para' || kolon.tip === 'sayi' ? 'sayi' : null);

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

  const duzenlemeyiBaslat = (satir: TRow, kolon: KolonTanimi<TRow>) => {
    if (!kolon.duzenlenebilir || kolon.tip === 'salt-okunur') return;
    const deger = kolon.degerAl(satir);
    let ham = '';
    if (kolon.tip === 'iskonto') ham = String((deger as { yuzde: number }).yuzde);
    else if (kolon.tip === 'birlesik') ham = String((deger as { ust: string }).ust ?? '');
    else ham = String(deger ?? '');
    setDuzenleme({ satirId: satir.id, kolonId: kolon.id, hamDeger: ham });
    setOdak({ satirId: satir.id, kolonId: kolon.id });
  };

  const klavyeNav = (e: KeyboardEvent, satir: TRow, kolonIdx: number) => {
    const satirIdx = sayfalama.satirlar.findIndex((s) => s.id === satir.id);

    if (e.key === 'Enter' && !duzenleme) {
      e.preventDefault();
      const kolon = dg.gorunurKolonlar[kolonIdx];
      if (kolon?.duzenlenebilir) duzenlemeyiBaslat(satir, kolon);
      return;
    }
    if (e.key === 'Escape' && duzenleme) {
      e.preventDefault();
      setDuzenleme(null);
      return;
    }
    if (duzenleme) return;

    let yeniSatirIdx = satirIdx;
    let yeniKolonIdx = kolonIdx;

    if (e.key === 'ArrowDown') yeniSatirIdx = Math.min(satirIdx + 1, sayfalama.satirlar.length - 1);
    else if (e.key === 'ArrowUp') yeniSatirIdx = Math.max(satirIdx - 1, 0);
    else if (e.key === 'ArrowRight') yeniKolonIdx = Math.min(kolonIdx + 1, dg.gorunurKolonlar.length - 1);
    else if (e.key === 'ArrowLeft') yeniKolonIdx = Math.max(kolonIdx - 1, 0);
    else return;

    e.preventDefault();
    const hedefSatir = sayfalama.satirlar[yeniSatirIdx];
    const hedefKolon = dg.gorunurKolonlar[yeniKolonIdx];
    if (hedefSatir && hedefKolon) setOdak({ satirId: hedefSatir.id, kolonId: hedefKolon.id });
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
    csvIndir(tabloBaslik.replace(/\s+/g, '-').toLowerCase(), basliklar, satirVeri);
  };

  const topluSil = () => {
    if (!onSatirlarDegistir || !dg.seciliIdler.size) return;
    if (!confirm(`${dg.seciliIdler.size} kayıt silinsin mi?`)) return;
    onSatirlarDegistir(satirlar.filter((s) => !dg.seciliIdler.has(s.id)));
    dg.secimiTemizle();
  };

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

  const gruplamaKolon = kolonlar.find((k) => k.id === dg.ayar.gruplamaKolonId);

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
    let oncekiGrup: string | null = null;

    for (const satir of sayfalama.satirlar) {
      if (gruplamaKolon) {
        const grupHam = gruplamaKolon.degerAl(satir);
        const grupMetin = String(grupHam ?? '—');
        if (grupMetin !== oncekiGrup) {
          oncekiGrup = grupMetin;
          satirlarEl.push(
            <tr key={`grup-${grupMetin}`} className="dg-grup-satir">
              <td colSpan={dg.gorunurKolonlar.length} className="dg-hucre">
                {gruplamaKolon.baslik}: {grupMetin || '—'}
              </td>
            </tr>
          );
        }
      }

      const secili = dg.seciliIdler.has(satir.id);
      const hover = hoverSatirId === satir.id;
      const ekSatirSinif = satirSinifAdi?.(satir) ?? '';

      satirlarEl.push(
        <tr
          key={satir.id}
          className={`dg-satir${secili ? ' dg-satir--secili' : ''}${hover ? ' dg-satir--hover' : ''}${duzenleme?.satirId === satir.id ? ' dg-satir--duzenleniyor' : ''}${ekSatirSinif ? ` ${ekSatirSinif}` : ''}`}
          onMouseEnter={() => setHoverSatirId(satir.id)}
          onMouseLeave={() => setHoverSatirId(null)}
          onDoubleClick={() => {
            const ilk = dg.gorunurKolonlar.find((k) => k.duzenlenebilir);
            if (ilk) duzenlemeyiBaslat(satir, ilk);
          }}
        >
          {dg.gorunurKolonlar.map((kolon, kolonIdx) => {
            const sabit = dg.ayar.sabitlenmisKolonlar.includes(kolon.id);
            const left = sabitLeftMap.get(kolon.id);
            const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
            const odakta = odak?.satirId === satir.id && odak?.kolonId === kolon.id;
            const duzenliyor = duzenleme?.satirId === satir.id && duzenleme?.kolonId === kolon.id;

            if (kolon.id === 'secim') {
              return (
                <td
                  key={kolon.id}
                  className={`dg-hucre${sabit ? ' dg-hucre--sabit' : ''}`}
                  style={{ width: genislik, left: sabit ? left : undefined }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="dg-checkbox"
                    checked={secili}
                    onChange={() => dg.secimToggle(satir.id)}
                  />
                </td>
              );
            }

            if (kolon.id === 'islemler') {
              return (
                <td
                  key={kolon.id}
                  className="dg-hucre dg-hucre--sag-sabit"
                  style={{ width: genislik }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="dg-islem-tus"
                    title="Satırı düzenle"
                    onClick={() => setSatirPanel(satir)}
                  >
                    ✎
                  </button>
                </td>
              );
            }

            if (kolon.tip === 'toggle') {
              const acik = Boolean(kolon.degerAl(satir));
              return (
                <td
                  key={kolon.id}
                  className={`dg-hucre${sabit ? ' dg-hucre--sabit' : ''}${odakta ? ' dg-hucre--odak' : ''}`}
                  style={{ width: genislik, left: sabit ? left : undefined }}
                  tabIndex={0}
                  onKeyDown={(e) => klavyeNav(e, satir, kolonIdx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (kolon.degerYaz) satirGuncelle(kolon.degerYaz(satir, !acik));
                  }}
                >
                  <button
                    type="button"
                    className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
                    aria-pressed={acik}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (kolon.degerYaz) satirGuncelle(kolon.degerYaz(satir, !acik));
                    }}
                  >
                    <span className="dg-switch-thumb" />
                  </button>
                </td>
              );
            }

            return (
              <td
                key={kolon.id}
                className={`dg-hucre dg-tooltip-kabuk${kolon.tip === 'etiket' ? ' dg-hucre--etiket' : ''}${sabit ? ' dg-hucre--sabit' : ''}${kolon.tip === 'para' || kolon.tip === 'sayi' || kolon.tip === 'iskonto' ? ' dg-hucre--sayi' : ''}${odakta ? ' dg-hucre--odak' : ''}`}
                style={{ width: genislik, minWidth: genislik, left: sabit ? left : undefined }}
                tabIndex={0}
                onKeyDown={(e) => klavyeNav(e, satir, kolonIdx)}
                onClick={() => setOdak({ satirId: satir.id, kolonId: kolon.id })}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  duzenlemeyiBaslat(satir, kolon);
                }}
              >
                {kolon.duzenlenebilir && hover && !duzenliyor && (
                  <span className="dg-tooltip">Düzenlemek için çift tıklayın</span>
                )}
                {duzenliyor ? (
                  <input
                    ref={girdiRef}
                    className="dg-hucre-girdi"
                    value={duzenleme.hamDeger}
                    onChange={(e) => setDuzenleme({ ...duzenleme, hamDeger: e.target.value })}
                    onBlur={() => {
                      hucreDuzenlemeyiBitir(satir, kolon, duzenleme.hamDeger);
                      setDuzenleme(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        hucreDuzenlemeyiBitir(satir, kolon, duzenleme.hamDeger);
                        setDuzenleme(null);
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setDuzenleme(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <HucreGoster satir={satir} kolon={kolon} kdvDahil={kdvDahil} />
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

    const colspanAtlanan = new Set<string>();
    for (const k of hizliGirisKolonlari ?? []) {
      if (!k.colspan || k.colspan <= 1) continue;
      const idx = dg.gorunurKolonlar.findIndex((c) => c.id === k.kolonId);
      if (idx < 0) continue;
      for (let i = 1; i < k.colspan; i++) {
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
      kucuk?: boolean
    ) => (
      <input
        ref={refAta ? hizliGirisIlkRef : undefined}
        type="text"
        className={`dg-hizli-giris-girdi${kucuk ? ' dg-hizli-giris-girdi--kucuk' : ''}`}
        placeholder={placeholder}
        title={ipucu}
        value={hizliGiris[kolonId] ?? ''}
        onChange={(e) => girdiDegistir(kolonId, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            hizliGirisGonder();
          }
        }}
      />
    );

    const secimGirdi = (
      kolonId: string,
      girisAyar: NonNullable<typeof hizliGirisKolonlari>[number]
    ) => {
      const girdiDeger = hizliGiris[kolonId] ?? girisAyar.varsayilan ?? '';
      return (
        <select
          className="dg-hizli-giris-girdi dg-hizli-giris-secim"
          title={girisAyar.ipucu}
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

      const sabit = dg.ayar.sabitlenmisKolonlar.includes(kolon.id);
      const left = sabitLeftMap.get(kolon.id);
      const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
      const girisAyar = hizliGirisKolonlari?.find((k) => k.kolonId === kolon.id);
      const placeholder = girisAyar?.placeholder ?? kolon.baslik;
      const ipucu = girisAyar?.ipucu ?? placeholder;
      const anaAlanId = girisAyar?.anaAlan ?? kolon.id;
      const hucreStil = {
        width: genislik,
        minWidth: genislik,
        left: sabit ? left : undefined,
      };

      if (kolon.id === 'secim' && !girisAyar) {
        return [];
      }

      if (kolon.id === 'islemler') {
        return [
          <td
            key={kolon.id}
            className="dg-hucre dg-hizli-giris-hucre dg-hucre--sag-sabit"
            style={{ width: genislik }}
          >
            <button
              type="button"
              className="dg-hizli-giris-ekle"
              onClick={hizliGirisGonder}
              title="Satır ekle (Enter)"
              aria-label="Satır ekle"
            >
              +
            </button>
          </td>,
        ];
      }

      if (!hizliGirisSet.has(kolon.id) && !girisAyar?.birlesik && !girisAyar?.colspan) {
        const onizleme = hizliGirisOnizle[kolon.id];
        return [
          <td
            key={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre${onizleme ? ' dg-hizli-giris-onizle' : ' dg-hizli-giris-hucre--pasif'}${kolon.tip === 'para' || kolon.tip === 'iskonto' || kolon.tip === 'sayi' ? ' dg-hucre--sayi' : ''}${sabit ? ' dg-hucre--sabit' : ''}`}
            style={hucreStil}
          >
            {onizleme ?? null}
          </td>,
        ];
      }

      const refAta = ilkGirdi;
      if (ilkGirdi) ilkGirdi = false;

      if (girisAyar?.birlesik?.length) {
        return [
          <td
            key={kolon.id}
            colSpan={girisAyar.colspan}
            className={`dg-hucre dg-hizli-giris-hucre dg-hizli-giris-hucre--birlesik${sabit ? ' dg-hucre--sabit' : ''}`}
            style={hucreStil}
          >
            <div className="dg-hizli-giris-yigin">
              {girisAyar.birlesik.map((b) =>
                metinGirdi(
                  b.kolonId,
                  b.placeholder ?? '',
                  b.placeholder ?? '',
                  refAta && b === girisAyar.birlesik![0],
                  true
                )
              )}
              {girisAyar.tip === 'secim' && girisAyar.secenekler?.length
                ? secimGirdi(anaAlanId, girisAyar)
                : metinGirdi(anaAlanId, placeholder, ipucu, refAta && !girisAyar.birlesik.length)}
            </div>
          </td>,
        ];
      }

      if (girisAyar?.tip === 'secim' && girisAyar.secenekler?.length) {
        return [
          <td
            key={kolon.id}
            className={`dg-hucre dg-hizli-giris-hucre${sabit ? ' dg-hucre--sabit' : ''}`}
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
            className={`dg-hucre dg-hizli-giris-hucre dg-hizli-giris-hucre--toggle${sabit ? ' dg-hucre--sabit' : ''}`}
            style={hucreStil}
          >
            <button
              type="button"
              className={`dg-switch${acik ? ' dg-switch--acik' : ''}`}
              aria-pressed={acik}
              title={acik ? 'Aktif' : 'Pasif'}
              onClick={() => girdiDegistir(kolon.id, acik ? 'false' : 'true')}
            >
              <span className="dg-switch-thumb" />
            </button>
          </td>,
        ];
      }

      return [
        <td
          key={kolon.id}
          className={`dg-hucre dg-hizli-giris-hucre${sabit ? ' dg-hucre--sabit' : ''}${kolon.tip === 'para' || kolon.tip === 'iskonto' || kolon.tip === 'sayi' ? ' dg-hucre--sayi' : ''}`}
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
        aria-label="Sütun ayarları"
      >
        <div className="dg-sutun-menu-baslik">
          <div>
            <h3>{tabloBaslik} sütunları</h3>
            <p>{tabloAltBaslik ?? 'Görünür sütunlar ve sırası'}</p>
          </div>
          <button type="button" className="dg-sutun-menu-sifirla" onClick={dg.varsayilanaDon}>
            Varsayılana dön
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
                    title={sabitli ? 'Sabitlemeyi kaldır' : 'Sütunu sabitle'}
                    onClick={() => dg.sabitlenmisToggle(id)}
                  >
                    •
                  </button>
                  <div className="dg-sutun-oklar">
                    <button
                      type="button"
                      className="dg-sutun-ok"
                      disabled={idx === 0 || kolon.sabitSag}
                      onClick={() => dg.kolonTasi(id, 'yukari')}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="dg-sutun-ok"
                      disabled={idx === arr.length - 1 || kolon.sabitSag}
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

  const sayfaIdleri = Array.from({ length: sayfalama.sayfaSayisi }, (_, i) => i);
  const gosterilecekSayfalar = sayfaIdleri.filter(
    (i) => i === 0 || i === sayfalama.sayfaSayisi - 1 || Math.abs(i - sayfalama.sayfa) <= 1
  );

  return (
    <div className={`dg-kabuk${kompakt ? ' dg-kompakt' : ''}`} ref={kabukRef}>
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
              <span>kayıt</span>
            </div>
            <span className="dg-arac-ayrac" />
            <button
              type="button"
              className={`dg-tus dg-tus--ikonlu${dg.ayar.cizgilerAcik ? ' dg-tus-aktif' : ''}`}
              onClick={dg.cizgiToggle}
              title="Tablo çizgileri"
            >
              <DgIkon ad="cizgi" />
              <span>Çizgi</span>
            </button>
            {filtreVarMi && (
              <button
                type="button"
                className={`dg-tus dg-tus--ikonlu${filtreAcik ? ' dg-tus-aktif' : ''}`}
                onClick={() => setFiltreAcik((a) => !a)}
                title="Sütun filtreleri"
              >
                <DgIkon ad="filtre" />
                <span>Filtre</span>
              </button>
            )}
          </div>
        </div>
        <div className="dg-ust-sag">
          {kdvDahilGoster && onKdvDahilDegistir && (
            <div className="dg-kdv-kapsul">
              <span className="dg-kdv-etiket">KDV Dahil</span>
              <button
                type="button"
                className={`dg-switch${kdvDahil ? ' dg-switch--acik' : ''}`}
                onClick={() => onKdvDahilDegistir(!kdvDahil)}
                aria-pressed={kdvDahil}
                title={kdvDahil ? 'Fiyatlar KDV dahil hesaplanıyor' : 'Fiyatlar KDV hariç hesaplanıyor'}
              >
                <span className="dg-switch-thumb" />
              </button>
            </div>
          )}
          <div className="dg-ikon-grup">
            <button
              type="button"
              className={`dg-tus dg-tus-ikon${dg.ayar.gruplamaKolonId ? ' dg-tus-aktif' : ''}`}
              title="Gruplama"
              onClick={() => {
                const ilk = kolonlar.find((k) => k.gruplama);
                dg.gruplamaAyarla(dg.ayar.gruplamaKolonId ? null : (ilk?.id ?? null));
              }}
            >
              <DgIkon ad="grup" />
            </button>
            <div className="dg-menu-wrap">
              <button
                ref={sutunTusRef}
                type="button"
                className={`dg-tus dg-tus-ikon${dg.sutunMenuAcik ? ' dg-tus-aktif' : ''}`}
                title="Sütun görünürlüğü"
                onClick={() => {
                  if (!dg.sutunMenuAcik) sutunMenuKonumGuncelle();
                  dg.setSutunMenuAcik((a) => !a);
                }}
              >
                <DgIkon ad="sutun" />
              </button>
            </div>
            <button type="button" className="dg-tus dg-tus-ikon" title="CSV indir" onClick={() => csvAktar(false)}>
              <DgIkon ad="indir" />
            </button>
          </div>
        </div>
      </div>

      {dg.seciliIdler.size > 0 && (
        <div className="dg-toplu-bar">
          <span>{dg.seciliIdler.size} kayıt seçili</span>
          <button type="button" className="dg-tus" onClick={() => topluDurum(true)}>
            Aktif yap
          </button>
          <button type="button" className="dg-tus" onClick={() => topluDurum(false)}>
            Pasif yap
          </button>
          <button type="button" className="dg-tus" onClick={() => csvAktar(true)}>
            Dışa aktar
          </button>
          <button type="button" className="dg-tus dg-tus-tehlike" onClick={topluSil}>
            Sil
          </button>
          <button type="button" className="dg-tus" onClick={dg.secimiTemizle}>
            Seçimi temizle
          </button>
        </div>
      )}

      {hata && <div className="dg-hata">{hata}</div>}

      {hizliGirisKartModu &&
        (hizliGirisKarti ? hizliGirisKarti(hizliGirisApi) : null)}

      <div
        className="dg-scroll"
        ref={scrollRef}
        style={scrollYukseklik ? { height: scrollYukseklik, maxHeight: scrollYukseklik } : undefined}
      >
        <table className={`dg-tablo${dg.ayar.cizgilerAcik ? ' dg-tablo--cizgili' : ' dg-tablo--cizgisiz'}`}>
          <thead ref={theadRef}>
            <tr className="dg-baslik-satir">
              {dg.gorunurKolonlar.map((kolon) => {
                const sabit = dg.ayar.sabitlenmisKolonlar.includes(kolon.id);
                const left = sabitLeftMap.get(kolon.id);
                const genislik = dg.ayar.kolonGenislikleri[kolon.id] ?? kolon.genislik ?? 120;
                const siralamaAktif = dg.siralama?.kolonId === kolon.id;

                if (kolon.id === 'secim') {
                  const tumSecili =
                    sayfalama.satirlar.length > 0 && sayfalama.satirlar.every((s) => dg.seciliIdler.has(s.id));
                  return (
                    <th
                      key={kolon.id}
                      className={`dg-baslik-hucre${sabit ? ' dg-baslik-hucre--sabit' : ''}`}
                      style={{ width: genislik, left: sabit ? left : undefined }}
                    >
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
                    </th>
                  );
                }

                return (
                  <th
                    key={kolon.id}
                    className={`dg-baslik-hucre${kolon.sabitSag ? ' dg-baslik-hucre--sag-sabit' : ''}${sabit ? ' dg-baslik-hucre--sabit' : ''}${dg.suruklenenKolon === kolon.id ? ' dg-baslik-hucre--surukleniyor' : ''}`}
                    style={{ width: genislik, minWidth: genislik, left: sabit ? left : undefined }}
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
                        <span className="dg-surukle-tutamac" title="Sürükle">
                          ⠿
                        </span>
                      )}
                      <span>{kolon.baslik}</span>
                      {kolonBaslikEki?.(kolon.id)}
                      {kolon.siralama !== false && kolon.id !== 'islemler' && (
                        <button
                          type="button"
                          className={`dg-siralama-tus${siralamaAktif ? ' dg-siralama-tus--aktif' : ''}`}
                          onClick={() => dg.siralamaToggle(kolon.id)}
                          title="Sırala"
                        >
                          {siralamaAktif ? (dg.siralama?.yon === 'asc' ? '▲' : '▼') : '↕'}
                        </button>
                      )}
                    </div>
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
            {filtreVarMi && filtreAcik && (
              <tr className="dg-filtre-satir">
                {dg.gorunurKolonlar.map((kolon) => (
                  <th key={`f-${kolon.id}`} className="dg-baslik-hucre">
                    {kolon.filtre ? (
                      <input
                        className="dg-filtre-girdi"
                        placeholder="Filtre..."
                        value={dg.filtreler[kolon.id] ?? ''}
                        onChange={(e) => dg.filtreAyarla(kolon.id, e.target.value)}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {renderHizliGirisSatiri()}
            {renderSatirlar()}
          </tbody>
        </table>
      </div>

      {sutunMenuPanel}

      <div className="dg-alt">
        <span>
          Toplam {sayfalama.toplam} kayıttan {sayfalama.baslangic}-{sayfalama.bitis} arası
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

      {satirPanel &&
        satirDuzenlePaneli &&
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
        )}
    </div>
  );
}
