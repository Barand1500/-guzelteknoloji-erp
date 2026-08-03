import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

type BolumBoyutlari = { ust: number; alt: number };

const MIN_UST = 64;
const MIN_ALT = 48;
const MIN_ORTA = 180;
const AYIRICI = 14;

function oku(depolamaAnahtari: string): BolumBoyutlari | null {
  try {
    const ham = localStorage.getItem(depolamaAnahtari);
    if (!ham) return null;
    const j = JSON.parse(ham) as Partial<BolumBoyutlari>;
    if (typeof j.ust === 'number' && typeof j.alt === 'number' && j.ust > 0 && j.alt > 0) {
      return { ust: j.ust, alt: j.alt };
    }
  } catch {
    /* yoksay */
  }
  return null;
}

function yaz(depolamaAnahtari: string, boyut: BolumBoyutlari) {
  try {
    localStorage.setItem(depolamaAnahtari, JSON.stringify(boyut));
  } catch {
    /* yoksay */
  }
}

type Props = {
  depolamaAnahtari: string;
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
 * Belge formu: üst bilgi · hareketler · iskonto — aralarında sürüklenerek yükseklik ayarı.
 * Çift tık: varsayılan boyuta dön.
 */
export function FaturaBolumDuzen({ depolamaAnahtari, ust, orta, alt }: Props) {
  const kokRef = useRef<HTMLDivElement>(null);
  const ustRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<BolumBoyutlari | null>(() => oku(depolamaAnahtari));
  const [suruklenen, setSuruklenen] = useState<'ust' | 'alt' | null>(null);

  const varsayilanaDon = useCallback(() => {
    setBoyut(null);
    setSuruklenen(null);
  }, []);

  useEffect(() => {
    if (boyut) yaz(depolamaAnahtari, boyut);
    else {
      try {
        localStorage.removeItem(depolamaAnahtari);
      } catch {
        /* yoksay */
      }
    }
  }, [boyut, depolamaAnahtari]);

  const surukleBaslat = useCallback(
    (hangisi: 'ust' | 'alt', e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      /* Çift tık → varsayılan (pointerdown detail; dblclick sürükleme ile çakışmasın) */
      if (e.detail >= 2) {
        e.preventDefault();
        e.stopPropagation();
        varsayilanaDon();
        return;
      }

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
        const toplamSimdi = kok.getBoundingClientRect().height;
        if (hangisi === 'ust') {
          const maxUst = Math.max(MIN_UST, toplamSimdi - MIN_ORTA - baslangicAlt - AYIRICI * 2);
          const ustH = Math.min(maxUst, Math.max(MIN_UST, baslangicUst + dy));
          setBoyut({ ust: ustH, alt: baslangicAlt });
        } else {
          const maxAlt = Math.max(MIN_ALT, toplamSimdi - MIN_ORTA - baslangicUst - AYIRICI * 2);
          const altH = Math.min(maxAlt, Math.max(MIN_ALT, baslangicAlt - dy));
          setBoyut({ ust: baslangicUst, alt: altH });
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
    [boyut, varsayilanaDon]
  );

  return (
    <div
      ref={kokRef}
      className={`fatura-bolum-duzen${suruklenen ? ' fatura-bolum-duzen--surukleniyor' : ''}`}
    >
      <div
        ref={ustRef}
        className="fatura-bolum fatura-bolum--ust"
        style={boyut ? { height: boyut.ust, flex: '0 0 auto' } : undefined}
      >
        {ust}
      </div>

      <div
        className={`fatura-bolum-ayirici${suruklenen === 'ust' ? ' fatura-bolum-ayirici--aktif' : ''}`}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Üst bilgi ile hareketler arasını boyutlandır. Çift tık: varsayılan."
        title="Sürükle: boyutlandır · Çift tık: varsayılana dön"
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
        className={`fatura-bolum-ayirici${suruklenen === 'alt' ? ' fatura-bolum-ayirici--aktif' : ''}`}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Hareketler ile iskonto arasını boyutlandır. Çift tık: varsayılan."
        title="Sürükle: boyutlandır · Çift tık: varsayılana dön"
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
        className="fatura-bolum fatura-bolum--alt"
        style={boyut ? { height: boyut.alt, flex: '0 0 auto' } : undefined}
      >
        {alt}
      </div>
    </div>
  );
}
