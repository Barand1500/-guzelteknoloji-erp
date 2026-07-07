import { useEffect, useMemo, useRef, useState, useCallback, type DragEvent, type MouseEvent } from 'react';
import type { AdminSekme } from '@/admin/ortak/tipler/admin';
import { modulBul } from '@/admin/veri/adminMenuYapisi';
import {
  sekmeAyarlariOku,
  sekmeTabCssDegiskenleri,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import { SekmeHoverOnizleme } from './SekmeHoverOnizleme';
import { sekmeOnizlemeAl } from './sekmeOnizlemeOnbellek';
import { sekmeOnizlemeGuncelle } from './sekmeOnizlemeYakala';
import { SekmeSagTikMenu, type SekmeSagTikMenuDurum } from './SekmeSagTikMenu';
import { AnimasyonluKenarlik } from './AnimasyonluKenarlik';
import type { SekmeSagTikIslem } from './sekmeSagTikYardimci';

interface UstSekmeCubuguProps {
  sekmeler: AdminSekme[];
  aktifSekmeId: string;
  kapananGecmisSayisi?: number;
  onSekmeSec: (id: string) => void;
  onSekmeKapat: (id: string) => void;
  onSekmeTasi: (kaynakId: string, hedefId: string, mod: 'once' | 'sonra') => void;
  onSekmeBirlestir: (kaynakId: string, hedefId: string) => void;
  sekmeAyarlari?: SekmePanelAyarlari;
  onSekmeAyir?: (sekmeId: string) => void;
  onSekmeSagTikIslem?: (sekmeId: string, islem: SekmeSagTikIslem) => void;
  baslatMenuAcik?: boolean;
}

type GrupOgesi =
  | { tip: 'tek'; sekme: AdminSekme }
  | { tip: 'grup'; grupId: string; sekmeler: AdminSekme[] };

type DropMod = 'once' | 'sonra' | 'grup';

const SURUKLE_AYIR_ESIK = 48;

function sekmeleriGrupla(sekmeler: AdminSekme[]): GrupOgesi[] {
  const ogeler: GrupOgesi[] = [];
  const islenenGrup = new Set<string>();

  for (const sekme of sekmeler) {
    if (sekme.grupId) {
      if (islenenGrup.has(sekme.grupId)) continue;
      islenenGrup.add(sekme.grupId);
      ogeler.push({
        tip: 'grup',
        grupId: sekme.grupId,
        sekmeler: sekmeler.filter((s) => s.grupId === sekme.grupId),
      });
    } else {
      ogeler.push({ tip: 'tek', sekme });
    }
  }
  return ogeler;
}

function dropModHesapla(e: DragEvent, hedefId: string, surukleniyor: string | null): DropMod | null {
  if (!surukleniyor || surukleniyor === hedefId) return null;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const oran = (e.clientX - rect.left) / rect.width;
  if (oran < 0.28) return 'once';
  if (oran > 0.72) return 'sonra';
  return 'grup';
}

function SekmeButonu({
  sekme,
  aktif,
  gruplu,
  surukleniyor,
  dropHedef,
  dropMod,
  hoverOnizleme,
  gorunumModu,
  yerlesim,
  onSekmeSec,
  onSekmeKapat,
  sekmelerUzunluk,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSagTik,
  onHoverBasla,
  onHoverBitir,
  baslatMenuAcik = false,
  kenarlikAnimKey,
}: {
  sekme: AdminSekme;
  aktif: boolean;
  gruplu?: boolean;
  surukleniyor: string | null;
  dropHedef: string | null;
  dropMod: DropMod | null;
  hoverOnizleme: boolean;
  gorunumModu: SekmePanelAyarlari['sekmeGorunumModu'];
  yerlesim: SekmePanelAyarlari['sekmeYerlesim'];
  onSekmeSec: (id: string) => void;
  onSekmeKapat: (id: string) => void;
  sekmelerUzunluk: number;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragOver: (e: DragEvent, id: string) => void;
  onDrop: (e: DragEvent, id: string) => void;
  onDragEnd: () => void;
  onPointerDown: (e: MouseEvent, id: string) => void;
  onPointerMove: (e: MouseEvent) => void;
  onPointerUp: () => void;
  onSagTik: (e: MouseEvent, sekmeId: string) => void;
  onHoverBasla?: (sekme: AdminSekme, el: HTMLElement) => void;
  onHoverBitir?: () => void;
  baslatMenuAcik?: boolean;
  kenarlikAnimKey: number;
}) {
  const tasinan = surukleniyor === sekme.id;
  const hedef = dropHedef === sekme.id;
  const modul = modulBul(sekme.modulId);
  const ikon = modul?.ikon ?? '📄';
  const isimGoster = gorunumModu === 'isim' || gorunumModu === 'ikon-isim';
  const ikonGoster = gorunumModu === 'ikon' || gorunumModu === 'ikon-isim';
  const tabRef = useRef<HTMLDivElement>(null);
  const sekmeVurgulu = aktif && !baslatMenuAcik;

  function sekmeSecTikla(e: MouseEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSekmeSec(sekme.id);
  }

  return (
    <div
      ref={tabRef}
      draggable
      onDragStart={(e) => {
        if ((e.target as HTMLElement).closest('.ap-sekme-tab-sec')) {
          e.preventDefault();
          return;
        }
        onDragStart(e, sekme.id);
      }}
      onDragOver={(e) => onDragOver(e, sekme.id)}
      onDrop={(e) => onDrop(e, sekme.id)}
      onDragEnd={onDragEnd}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.ap-sekme-tab-sec')) return;
        onPointerDown(e, sekme.id);
      }}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSagTik(e, sekme.id);
      }}
      onMouseEnter={() => {
        if (!hoverOnizleme || !tabRef.current) return;
        onHoverBasla?.(sekme, tabRef.current);
      }}
      onMouseLeave={() => {
        if (!hoverOnizleme) return;
        onHoverBitir?.();
      }}
      title={hoverOnizleme ? undefined : sekme.baslik}
      className={`ap-sekme-tab group relative shrink-0 cursor-grab active:cursor-grabbing ${
        yerlesim === 'kare'
          ? `ap-sekme-kare-tab flex shrink-0 flex-col items-center justify-center rounded-lg border ${
              sekmeVurgulu
                ? 'ap-sekme-kare-tab-aktif ap-sekme-tab--kenarlik-aktif border-[var(--ap-border)] bg-[color-mix(in_srgb,var(--ap-accent)_10%,var(--ap-surface))] text-[var(--ap-heading)]'
                : 'border-[var(--ap-border)] bg-[var(--ap-tab-idle)] text-[var(--ap-text-muted)] hover:bg-[var(--ap-hover)]'
            }`
          : `flex max-w-[200px] items-center rounded-t-md border border-b-0 ${
              gruplu ? 'rounded-none first:rounded-tl-md last:rounded-tr-md' : ''
            } ${
              sekmeVurgulu
                ? 'ap-sekme-tab--kenarlik-aktif border-[var(--ap-border)] bg-[var(--ap-tab-active)] text-[var(--ap-heading)] shadow-sm'
                : aktif
                  ? 'border-[var(--ap-border)] bg-[var(--ap-tab-active)] text-[var(--ap-heading)] shadow-sm'
                  : 'border-transparent bg-[var(--ap-tab-idle)] text-[var(--ap-text-muted)] hover:bg-[var(--ap-hover)]'
            }`
      } ${tasinan ? 'opacity-50' : ''} ${
        hedef && dropMod === 'grup' ? 'ap-sekme-drop-grup' : ''
      } ${hedef && dropMod === 'once' ? 'ap-sekme-drop-once' : ''} ${
        hedef && dropMod === 'sonra' ? 'ap-sekme-drop-sonra' : ''
      }`}
      style={
        yerlesim === 'kare'
          ? { fontSize: 'var(--ap-tab-font-size, 0.75rem)' }
          : { minHeight: 'var(--ap-tab-height, 2rem)', fontSize: 'var(--ap-tab-font-size, 0.75rem)' }
      }
    >
      {sekmeVurgulu && (
        <AnimasyonluKenarlik
          animasyonAnahtar={`${sekme.id}-${kenarlikAnimKey}`}
          kapsayiciRef={tabRef}
          ustYaricap={yerlesim === 'kare' ? 8 : 6}
        />
      )}
      <button
        type="button"
        draggable={false}
        className={
          yerlesim === 'kare'
            ? 'ap-sekme-kare-tab-sec flex w-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-1.5 py-2 text-center'
            : 'ap-sekme-tab-sec flex min-h-[inherit] min-w-0 flex-1 cursor-pointer items-center gap-1 truncate px-3 py-1.5'
        }
        onMouseDown={sekmeSecTikla}
      >
        {sekme.kaydedilmedi && (
          <span
            className={`shrink-0 rounded-full bg-amber-400 ${yerlesim === 'kare' ? 'absolute right-1 top-1 h-1.5 w-1.5' : 'h-1.5 w-1.5'}`}
            title="Kaydedilmemiş değişiklik"
          />
        )}
        {ikonGoster && (
          <span className={`shrink-0 leading-none ${yerlesim === 'kare' ? 'ap-sekme-kare-tab-ikon' : 'text-sm'}`}>{ikon}</span>
        )}
        {isimGoster && (
          <span className={yerlesim === 'kare' ? 'ap-sekme-kare-tab-isim line-clamp-2 w-full leading-tight' : 'truncate'}>
            {sekme.baslik}
          </span>
        )}
        {!isimGoster && !ikonGoster && (
          <span className={yerlesim === 'kare' ? 'ap-sekme-kare-tab-isim line-clamp-2 w-full leading-tight' : 'truncate'}>
            {sekme.baslik}
          </span>
        )}
      </button>
      {sekmelerUzunluk > 1 && (
        <button
          type="button"
          draggable={false}
          onClick={(e) => {
            e.stopPropagation();
            onSekmeKapat(sekme.id);
          }}
          className={yerlesim === 'kare' ? 'ap-sekme-kare-tab-kapat' : 'ap-sekme-tab-kapat'}
          aria-label="Sekmeyi kapat"
        >
          {yerlesim === 'kare' ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            '×'
          )}
        </button>
      )}
    </div>
  );
}

export function UstSekmeCubugu({
  sekmeler,
  aktifSekmeId,
  kapananGecmisSayisi = 0,
  onSekmeSec,
  onSekmeKapat,
  onSekmeTasi,
  onSekmeBirlestir,
  sekmeAyarlari: disAyarlari,
  onSekmeAyir,
  onSekmeSagTikIslem,
  baslatMenuAcik = false,
}: UstSekmeCubuguProps) {
  const [ayarlar, setAyarlar] = useState<SekmePanelAyarlari>(() => disAyarlari ?? sekmeAyarlariOku());
  const [sagTikMenu, setSagTikMenu] = useState<SekmeSagTikMenuDurum | null>(null);
  const [surukleniyor, setSurukleniyor] = useState<string | null>(null);
  const [dropHedef, setDropHedef] = useState<string | null>(null);
  const [dropMod, setDropMod] = useState<DropMod | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const solOkRef = useRef(false);
  const sagOkRef = useRef(false);
  const kaydirmaRafRef = useRef<number | null>(null);
  const [kaydirmaSurumu, setKaydirmaSurumu] = useState(0);
  const kareMod = ayarlar.sekmeYerlesim === 'kare';
  const surukleBaslangic = useRef<{ x: number; y: number; id: string } | null>(null);
  const onizlemeAcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onizlemeKapatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [onizlemeSekme, setOnizlemeSekme] = useState<AdminSekme | null>(null);
  const [onizlemeRect, setOnizlemeRect] = useState<DOMRect | null>(null);
  const [onizlemeGorsel, setOnizlemeGorsel] = useState<string | null>(null);
  const [onizlemeGorselYukleniyor, setOnizlemeGorselYukleniyor] = useState(false);
  const [kenarlikAnimKey, setKenarlikAnimKey] = useState(0);
  const onizlemeSekmeRef = useRef<string | null>(null);

  const onizlemeIptal = useCallback(() => {
    if (onizlemeAcTimer.current) clearTimeout(onizlemeAcTimer.current);
    if (onizlemeKapatTimer.current) clearTimeout(onizlemeKapatTimer.current);
    onizlemeAcTimer.current = null;
    onizlemeKapatTimer.current = null;
  }, []);

  const sekmeHoverBasla = useCallback(
    (sekme: AdminSekme, el: HTMLElement) => {
      if (!ayarlar.hoverOnizleme || surukleniyor) return;
      onizlemeIptal();
      onizlemeSekmeRef.current = sekme.id;
      const onbellekGorsel = sekmeOnizlemeAl(sekme.id);
      onizlemeAcTimer.current = setTimeout(() => {
        setOnizlemeSekme(sekme);
        setOnizlemeRect(el.getBoundingClientRect());
        setOnizlemeGorsel(onbellekGorsel);
        setOnizlemeGorselYukleniyor(!onbellekGorsel);
        void sekmeOnizlemeGuncelle(sekme.id).then((url) => {
          if (onizlemeSekmeRef.current !== sekme.id) return;
          if (url) setOnizlemeGorsel(url);
          setOnizlemeGorselYukleniyor(false);
        });
      }, 420);
    },
    [ayarlar.hoverOnizleme, surukleniyor, onizlemeIptal]
  );

  const sekmeHoverBitir = useCallback(() => {
    if (onizlemeAcTimer.current) clearTimeout(onizlemeAcTimer.current);
    onizlemeSekmeRef.current = null;
    onizlemeKapatTimer.current = setTimeout(() => {
      setOnizlemeSekme(null);
      setOnizlemeRect(null);
      setOnizlemeGorsel(null);
      setOnizlemeGorselYukleniyor(false);
    }, 180);
  }, []);

  useEffect(() => () => onizlemeIptal(), [onizlemeIptal]);

  useEffect(() => {
    if (surukleniyor) {
      onizlemeIptal();
      onizlemeSekmeRef.current = null;
      setOnizlemeSekme(null);
      setOnizlemeRect(null);
      setOnizlemeGorsel(null);
      setOnizlemeGorselYukleniyor(false);
    }
  }, [surukleniyor, onizlemeIptal]);

  useEffect(() => {
    if (!ayarlar.hoverOnizleme) {
      onizlemeIptal();
      onizlemeSekmeRef.current = null;
      setOnizlemeSekme(null);
      setOnizlemeRect(null);
      setOnizlemeGorsel(null);
      setOnizlemeGorselYukleniyor(false);
    }
  }, [ayarlar.hoverOnizleme, onizlemeIptal]);

  useEffect(() => {
    if (disAyarlari) setAyarlar(disAyarlari);
  }, [disAyarlari]);

  useEffect(() => {
    const handler = () => setAyarlar(sekmeAyarlariOku());
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  const tabCss = useMemo(
    () => sekmeTabCssDegiskenleri(ayarlar),
    [ayarlar.sekmeYukseklik, ayarlar.sekmeGorunumModu, ayarlar.sekmeYerlesim]
  );

  const ogeler = useMemo(() => sekmeleriGrupla(sekmeler), [sekmeler]);

  const sekmeListeAnahtari = useMemo(
    () => sekmeler.map((s) => `${s.id}:${s.grupId ?? ''}:${s.kaydedilmedi ? 1 : 0}`).join('|'),
    [sekmeler]
  );

  const kaydirmaGuncelle = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const yeniSol = el.scrollLeft > 4;
    const yeniSag = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    if (solOkRef.current === yeniSol && sagOkRef.current === yeniSag) return;
    solOkRef.current = yeniSol;
    sagOkRef.current = yeniSag;
    setKaydirmaSurumu((n) => n + 1);
  }, []);

  const kaydirmaGuncelleCerceve = useCallback(() => {
    if (kaydirmaRafRef.current !== null) return;
    kaydirmaRafRef.current = requestAnimationFrame(() => {
      kaydirmaRafRef.current = null;
      kaydirmaGuncelle();
    });
  }, [kaydirmaGuncelle]);

  const solOk = solOkRef.current;
  const sagOk = sagOkRef.current;
  void kaydirmaSurumu;

  useEffect(() => {
    kaydirmaGuncelle();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', kaydirmaGuncelleCerceve, { passive: true });
    const gozlemci = new ResizeObserver(kaydirmaGuncelleCerceve);
    gozlemci.observe(el);
    return () => {
      if (kaydirmaRafRef.current !== null) cancelAnimationFrame(kaydirmaRafRef.current);
      el.removeEventListener('scroll', kaydirmaGuncelleCerceve);
      gozlemci.disconnect();
    };
  }, [
    sekmeListeAnahtari,
    ayarlar.sekmeGorunumModu,
    ayarlar.sekmeYerlesim,
    ayarlar.sekmeYukseklik,
    kaydirmaGuncelle,
    kaydirmaGuncelleCerceve,
  ]);

  useEffect(() => {
    const alan = scrollTrackRef.current;
    if (!alan) return;

    const tekerlekKaydir = (e: WheelEvent) => {
      const el = scrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth + 1) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      e.preventDefault();
      el.scrollBy({ left: delta, behavior: 'auto' });
    };

    alan.addEventListener('wheel', tekerlekKaydir, { passive: false });
    return () => alan.removeEventListener('wheel', tekerlekKaydir);
  }, [sekmeListeAnahtari, ayarlar.sekmeGorunumModu, ayarlar.sekmeYerlesim]);

  function kaydir(yon: 'sol' | 'sag') {
    const el = scrollRef.current;
    if (!el) return;
    const miktar = Math.max(200, Math.round(el.clientWidth * 0.65));
    el.scrollBy({ left: yon === 'sol' ? -miktar : miktar, behavior: 'smooth' });
  }

  function onDragStart(e: DragEvent, id: string) {
    setSurukleniyor(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function onPointerDown(e: MouseEvent, id: string) {
    if ((e.target as HTMLElement).closest('button[aria-label="Sekmeyi kapat"]')) return;
    surukleBaslangic.current = { x: e.clientX, y: e.clientY, id };
  }

  function onPointerMove(e: MouseEvent) {
    if (!surukleBaslangic.current || !onSekmeAyir) return;
    const dy = e.clientY - surukleBaslangic.current.y;
    if (dy > SURUKLE_AYIR_ESIK && e.clientY > 100) {
      onSekmeAyir(surukleBaslangic.current.id);
      surukleBaslangic.current = null;
    }
  }

  function onPointerUp() {
    surukleBaslangic.current = null;
  }

  function onDragOver(e: DragEvent, hedefId: string) {
    e.preventDefault();
    const mod = dropModHesapla(e, hedefId, surukleniyor);
    setDropHedef(hedefId);
    setDropMod(mod);
  }

  function onDrop(e: DragEvent, hedefId: string) {
    e.preventDefault();
    const kaynakId = surukleniyor ?? e.dataTransfer.getData('text/plain');
    if (!kaynakId || kaynakId === hedefId) {
      suruklemeSifirla();
      return;
    }

    const mod = dropMod ?? dropModHesapla(e, hedefId, kaynakId) ?? 'sonra';
    if (mod === 'grup') {
      onSekmeBirlestir(kaynakId, hedefId);
    } else {
      onSekmeTasi(kaynakId, hedefId, mod);
    }

    suruklemeSifirla();
  }

  function suruklemeSifirla() {
    setSurukleniyor(null);
    setDropHedef(null);
    setDropMod(null);
  }

  function sekmeSagTik(e: MouseEvent, sekmeId: string) {
    setSagTikMenu({ x: e.clientX, y: e.clientY, sekmeId });
  }

  function sekmeSagTikIslem(sekmeId: string, islem: SekmeSagTikIslem) {
    onSekmeSagTikIslem?.(sekmeId, islem);
  }

  const sagTikMenuKapat = useCallback(() => setSagTikMenu(null), []);

  const sekmeSecAnim = useCallback(
    (id: string) => {
      onSekmeSec(id);
      setKenarlikAnimKey((n) => n + 1);
    },
    [onSekmeSec]
  );

  const ortakSekmeProps = {
    surukleniyor,
    dropHedef,
    dropMod,
    hoverOnizleme: ayarlar.hoverOnizleme,
    gorunumModu: ayarlar.sekmeGorunumModu,
    yerlesim: ayarlar.sekmeYerlesim,
    baslatMenuAcik,
    kenarlikAnimKey,
    onSekmeSec: sekmeSecAnim,
    onSekmeKapat,
    sekmelerUzunluk: sekmeler.length,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd: suruklemeSifirla,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onSagTik: sekmeSagTik,
    onHoverBasla: sekmeHoverBasla,
    onHoverBitir: sekmeHoverBitir,
  };

  return (
    <div
      className={`ap-sekme-scroll-wrap ${kareMod ? 'ap-sekme-scroll-wrap--kare' : ''}`}
      style={tabCss}
      data-ap-kesif="sekme-cubugu"
    >
      <div ref={scrollTrackRef} className="ap-sekme-scroll-rail">
        <button
          type="button"
          className="ap-sekme-scroll-btn ap-sekme-scroll-btn--sabit ap-sekme-scroll-sol"
          onClick={() => kaydir('sol')}
          disabled={!solOk}
          aria-label="Sola kaydır"
        >
          <svg viewBox="0 0 24 24" className="ap-sekme-scroll-btn-ikon" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="ap-sekme-scroll-ayrac" aria-hidden />

        <div ref={scrollRef} className="ap-sekme-scroll ap-sekme-scroll--ortada">
          {ogeler.map((oge) => {
            if (oge.tip === 'tek') {
              return (
                <SekmeButonu
                  key={oge.sekme.id}
                  sekme={oge.sekme}
                  aktif={oge.sekme.id === aktifSekmeId}
                  {...ortakSekmeProps}
                />
              );
            }

            return (
              <div
                key={oge.grupId}
                className={
                  kareMod
                    ? 'ap-sekme-grup ap-sekme-grup--kare flex shrink-0 items-center gap-1 rounded-lg border border-[var(--ap-border)] bg-[var(--ap-tab-idle)] p-1'
                    : 'ap-sekme-grup flex shrink-0 items-end rounded-t-lg border border-b-0 border-[var(--ap-border)] bg-[var(--ap-tab-idle)] p-0.5 shadow-sm'
                }
              >
                {oge.sekmeler.map((sekme) => (
                  <SekmeButonu
                    key={sekme.id}
                    sekme={sekme}
                    aktif={sekme.id === aktifSekmeId}
                    gruplu
                    {...ortakSekmeProps}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="ap-sekme-scroll-ayrac" aria-hidden />

        <button
          type="button"
          className="ap-sekme-scroll-btn ap-sekme-scroll-btn--sabit ap-sekme-scroll-sag"
          onClick={() => kaydir('sag')}
          disabled={!sagOk}
          aria-label="Sağa kaydır"
        >
          <svg viewBox="0 0 24 24" className="ap-sekme-scroll-btn-ikon" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <SekmeSagTikMenu
        menu={sagTikMenu}
        sekmeler={sekmeler}
        kapananGecmisSayisi={kapananGecmisSayisi}
        onKapat={sagTikMenuKapat}
        onIslem={sekmeSagTikIslem}
      />

      {ayarlar.hoverOnizleme && (
        <SekmeHoverOnizleme
          sekme={onizlemeSekme}
          anchorRect={onizlemeRect}
          aktif={onizlemeSekme?.id === aktifSekmeId}
          gorselUrl={onizlemeGorsel}
          gorselYukleniyor={onizlemeGorselYukleniyor}
        />
      )}
    </div>
  );
}
