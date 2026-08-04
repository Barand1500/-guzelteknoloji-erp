import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type BolumBoyutlari = { ust: number | null; alt: number | null };

const MIN_ALT = 96;

function oku(depolamaAnahtari: string): BolumBoyutlari | null {
  try {
    const ham = localStorage.getItem(depolamaAnahtari);
    if (!ham) return null;
    const j = JSON.parse(ham) as Partial<BolumBoyutlari>;
    const alt = typeof j.alt === 'number' && j.alt > 0 ? Math.max(MIN_ALT, j.alt) : null;
    if (alt == null) return null;
    return { ust: null, alt };
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
    localStorage.setItem(depolamaAnahtari, JSON.stringify({ ust: null, alt: boyut.alt }));
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

/**
 * Belge formu: üst · hareketler · iskonto.
 * Üst/alt arası eşit boşluk (CSS gap). Accordion açıkken kilitli yükseklik kalkar.
 */
export function FaturaBolumDuzen({
  depolamaAnahtari,
  ustAcik = false,
  altAcik = false,
  ust,
  orta,
  alt,
}: Props) {
  const altRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<BolumBoyutlari | null>(() => oku(depolamaAnahtari));
  const altAcikOnceki = useRef(altAcik);

  useEffect(() => {
    yaz(depolamaAnahtari, boyut);
  }, [boyut, depolamaAnahtari]);

  useLayoutEffect(() => {
    if (altAcikOnceki.current === altAcik) return;
    altAcikOnceki.current = altAcik;
    if (!altAcik) return;
    setBoyut((onceki) => {
      if (!onceki || onceki.alt == null) return onceki;
      return { ust: null, alt: null };
    });
  }, [altAcik]);

  const altKilitli = !altAcik && boyut?.alt != null;

  return (
    <div
      className={`fatura-bolum-duzen${ustAcik ? ' fatura-bolum-duzen--ust-acik' : ''}${
        altAcik ? ' fatura-bolum-duzen--alt-acik' : ''
      }`}
    >
      <div className={`fatura-bolum fatura-bolum--ust${ustAcik ? ' fatura-bolum--ust-acik' : ''}`}>
        {ust}
      </div>

      <div className="fatura-bolum fatura-bolum--orta">{orta}</div>

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
