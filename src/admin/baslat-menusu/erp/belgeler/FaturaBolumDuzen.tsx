import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

type BolumBoyutlari = { ust: number | null; alt: number | null };

const MIN_UST = 64;
const MIN_ALT = 96;

function sinirla(b: { ust: number; alt: number }): BolumBoyutlari {
  return {
    ust: Math.max(MIN_UST, b.ust),
    alt: Math.max(MIN_ALT, b.alt),
  };
}

function oku(depolamaAnahtari: string): BolumBoyutlari | null {
  try {
    const ham = localStorage.getItem(depolamaAnahtari);
    if (!ham) return null;
    const j = JSON.parse(ham) as Partial<BolumBoyutlari>;
    const ust = typeof j.ust === 'number' && j.ust > 0 ? Math.max(MIN_UST, j.ust) : null;
    const alt = typeof j.alt === 'number' && j.alt > 0 ? Math.max(MIN_ALT, j.alt) : null;
    if (ust == null && alt == null) return null;
    return { ust, alt };
  } catch {
    /* yoksay */
  }
  return null;
}

function yaz(depolamaAnahtari: string, boyut: BolumBoyutlari | null) {
  try {
    if (!boyut || (boyut.ust == null && boyut.alt == null)) {
      localStorage.removeItem(depolamaAnahtari);
      return;
    }
    localStorage.setItem(depolamaAnahtari, JSON.stringify(boyut));
  } catch {
    /* yoksay */
  }
}

type Props = {
  depolamaAnahtari: string;
  /** Üst accordion açık — kilitli yükseklik uygulanmaz, içerik kadar büyür */
  ustAcik?: boolean;
  /** Alt accordion açık */
  altAcik?: boolean;
  ust: ReactNode;
  orta: ReactNode;
  alt: ReactNode;
};

function AyiriciTutamac() {
  return (
    <span className="fatura-bolum-ayirici-tutamac" aria-hidden>
      <span className="fatura-bolum-ayirici-cizgi" />
      <span className="fatura-bolum-ayirici-kabza">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="fatura-bolum-ayirici-cizgi" />
    </span>
  );
}

/**
 * Belge formu: üst · hareketler · iskonto.
 * Accordion açıkken o bölme kilitli yüksekliği bırakır (açılma bozulmaz).
 * Sığmazsa sayfa içi scroll. Çift tık: varsayılan.
 */
export function FaturaBolumDuzen({
  depolamaAnahtari,
  ustAcik = false,
  altAcik = false,
  ust,
  orta,
  alt,
}: Props) {
  const kokRef = useRef<HTMLDivElement>(null);
  const ustRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<BolumBoyutlari | null>(() => oku(depolamaAnahtari));
  const [suruklenen, setSuruklenen] = useState<'ust' | 'alt' | null>(null);
  const ustAcikOnceki = useRef(ustAcik);
  const altAcikOnceki = useRef(altAcik);

  const varsayilanaDon = useCallback(() => {
    setBoyut(null);
    setSuruklenen(null);
  }, []);

  useEffect(() => {
    yaz(depolamaAnahtari, boyut);
  }, [boyut, depolamaAnahtari]);

  /* Accordion açılınca kilit kalksın — detay taşmasın / kesilmesin */
  useLayoutEffect(() => {
    if (ustAcikOnceki.current === ustAcik) return;
    ustAcikOnceki.current = ustAcik;
    if (!ustAcik) return;
    setBoyut((onceki) => {
      if (!onceki || onceki.ust == null) return onceki;
      return { ust: null, alt: onceki.alt };
    });
  }, [ustAcik]);

  useLayoutEffect(() => {
    if (altAcikOnceki.current === altAcik) return;
    altAcikOnceki.current = altAcik;
    if (!altAcik) return;
    setBoyut((onceki) => {
      if (!onceki || onceki.alt == null) return onceki;
      return { ust: onceki.ust, alt: null };
    });
  }, [altAcik]);

  const surukleBaslat = useCallback(
    (hangisi: 'ust' | 'alt', e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (e.detail >= 2) {
        e.preventDefault();
        e.stopPropagation();
        varsayilanaDon();
        return;
      }
      /* Accordion açıkken o ayırıcıyı kilitleme — açılmayı bozmasın */
      if (hangisi === 'ust' && ustAcik) return;
      if (hangisi === 'alt' && altAcik) return;

      e.preventDefault();
      const kok = kokRef.current;
      if (!kok) return;

      const baslangicY = e.clientY;
      const baslangicUst = boyut?.ust ?? ustRef.current?.offsetHeight ?? MIN_UST;
      const baslangicAlt = boyut?.alt ?? altRef.current?.offsetHeight ?? MIN_ALT;
      let surukledi = false;

      setSuruklenen(hangisi);
      const hedef = e.currentTarget;
      hedef.setPointerCapture(e.pointerId);

      const hareket = (ev: PointerEvent) => {
        const dy = ev.clientY - baslangicY;
        if (!surukledi && Math.abs(dy) < 3) return;
        surukledi = true;
        if (hangisi === 'ust') {
          const ustH = Math.max(MIN_UST, baslangicUst + dy);
          setBoyut(sinirla({ ust: ustH, alt: Math.max(MIN_ALT, baslangicAlt) }));
        } else {
          const altH = Math.max(MIN_ALT, baslangicAlt - dy);
          setBoyut(sinirla({ ust: Math.max(MIN_UST, baslangicUst), alt: altH }));
        }
      };

      const bitir = (ev: PointerEvent) => {
        try {
          hedef.releasePointerCapture(ev.pointerId);
        } catch {
          /* yoksay */
        }
        setSuruklenen(null);
        window.removeEventListener('pointermove', hareket);
        window.removeEventListener('pointerup', bitir);
        window.removeEventListener('pointercancel', bitir);
      };

      window.addEventListener('pointermove', hareket);
      window.addEventListener('pointerup', bitir);
      window.addEventListener('pointercancel', bitir);
    },
    [boyut, varsayilanaDon, ustAcik, altAcik]
  );

  const ustKilitli = !ustAcik && boyut?.ust != null;
  const altKilitli = !altAcik && boyut?.alt != null;

  return (
    <div
      ref={kokRef}
      className={`fatura-bolum-duzen${suruklenen ? ' fatura-bolum-duzen--surukleniyor' : ''}${
        ustAcik ? ' fatura-bolum-duzen--ust-acik' : ''
      }${altAcik ? ' fatura-bolum-duzen--alt-acik' : ''}`}
    >
      <div
        ref={ustRef}
        className={`fatura-bolum fatura-bolum--ust${ustAcik ? ' fatura-bolum--ust-acik' : ''}`}
        style={ustKilitli ? { height: boyut!.ust!, flex: '0 0 auto' } : undefined}
      >
        {ust}
      </div>

      <div
        className={`fatura-bolum-ayirici${suruklenen === 'ust' ? ' fatura-bolum-ayirici--aktif' : ''}${
          ustAcik ? ' fatura-bolum-ayirici--pasif' : ''
        }`}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Üst bilgi ile hareketler arasını boyutlandır. Çift tık: varsayılan."
        title={
          ustAcik
            ? 'Üst detay açıkken boyutlandırma kapalı'
            : 'Sürükle: boyutlandır · Çift tık: varsayılana dön'
        }
        onPointerDown={(e) => surukleBaslat('ust', e)}
        onDoubleClick={(e) => {
          e.preventDefault();
          varsayilanaDon();
        }}
      >
        <AyiriciTutamac />
      </div>

      <div className="fatura-bolum fatura-bolum--orta">{orta}</div>

      <div
        className={`fatura-bolum-ayirici${suruklenen === 'alt' ? ' fatura-bolum-ayirici--aktif' : ''}${
          altAcik ? ' fatura-bolum-ayirici--pasif' : ''
        }`}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Hareketler ile iskonto arasını boyutlandır. Çift tık: varsayılan."
        title={
          altAcik
            ? 'Alt detay açıkken boyutlandırma kapalı'
            : 'Sürükle: boyutlandır · Çift tık: varsayılana dön'
        }
        onPointerDown={(e) => surukleBaslat('alt', e)}
        onDoubleClick={(e) => {
          e.preventDefault();
          varsayilanaDon();
        }}
      >
        <AyiriciTutamac />
      </div>

      <div
        ref={altRef}
        className={`fatura-bolum fatura-bolum--alt${altAcik ? ' fatura-bolum--alt-acik' : ''}`}
        style={altKilitli ? { height: boyut!.alt!, flex: '0 0 auto' } : undefined}
      >
        {alt}
      </div>
    </div>
  );
}
