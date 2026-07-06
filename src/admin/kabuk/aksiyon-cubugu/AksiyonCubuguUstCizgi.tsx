import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

const CIZGI_KALINLIK = 5;
const PANEL_YARICAP = 10;

function ustCizgiYoluOlustur(
  footerGenislik: number,
  lineY: number,
  pLeft: number,
  pRight: number,
  pTop: number
) {
  const panelGenislik = pRight - pLeft;
  const r = Math.min(PANEL_YARICAP, panelGenislik / 4, lineY / 3);
  const guvenliR = Math.max(r, 4);
  const l = Math.round(pLeft);
  const rr = Math.round(pRight);
  const ly = Math.round(lineY);

  return [
    `M 0 ${ly}`,
    `H ${Math.max(0, l)}`,
    `V ${pTop + guvenliR}`,
    `Q ${l} ${pTop} ${l + guvenliR} ${pTop}`,
    `H ${rr - guvenliR}`,
    `Q ${rr} ${pTop} ${rr} ${pTop + guvenliR}`,
    `V ${ly}`,
    `H ${Math.round(footerGenislik)}`,
  ].join(' ');
}

interface AksiyonCubuguUstCizgiProps {
  footerRef: RefObject<HTMLElement | null>;
  panelEl: HTMLElement | null;
  panelAktif: boolean;
}

export function AksiyonCubuguUstCizgi({ footerRef, panelEl, panelAktif }: AksiyonCubuguUstCizgiProps) {
  const [geometri, setGeometri] = useState<{
    yol: string;
    genislik: number;
    yukseklik: number;
    ustOfset: number;
  } | null>(null);
  const [animBitti, setAnimBitti] = useState(false);
  const [animAnahtar, setAnimAnahtar] = useState(0);
  const oncekiPanelRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (panelEl !== oncekiPanelRef.current) {
      oncekiPanelRef.current = panelEl;
      setAnimBitti(false);
      if (panelEl) {
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimAnahtar((k) => k + 1)));
      }
    }
  }, [panelEl]);

  useLayoutEffect(() => {
    const guncelle = () => {
      const footer = footerRef.current;
      if (!footer) return;

      const fr = footer.getBoundingClientRect();
      const lineY = CIZGI_KALINLIK / 2;

      if (!panelEl) {
        setGeometri({
          yol: `M 0 ${lineY} H ${Math.round(fr.width)}`,
          genislik: fr.width,
          yukseklik: CIZGI_KALINLIK + 2,
          ustOfset: 0,
        });
        return;
      }

      const pr = panelEl.getBoundingClientRect();
      const pLeft = pr.left - fr.left;
      const pRight = pr.right - fr.left;
      const footerLineY = fr.top - pr.top + CIZGI_KALINLIK / 2;
      const yukseklik = footerLineY + CIZGI_KALINLIK + 2;
      const yol = ustCizgiYoluOlustur(fr.width, footerLineY, pLeft, pRight, 0);

      setGeometri({
        yol,
        genislik: fr.width,
        yukseklik,
        ustOfset: pr.top - fr.top,
      });
    };

    guncelle();
    const raf = requestAnimationFrame(guncelle);
    const ro = new ResizeObserver(guncelle);
    if (footerRef.current) ro.observe(footerRef.current);
    if (panelEl) ro.observe(panelEl);
    window.addEventListener('resize', guncelle);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', guncelle);
    };
  }, [footerRef, panelEl, animAnahtar]);

  if (!geometri) return null;

  const animSinif =
    panelAktif && !animBitti
      ? 'ap-gorev-cubugu-ust-cizgi-yol--anim'
      : 'ap-gorev-cubugu-ust-cizgi-yol--sabit';

  return (
    <svg
      className="ap-gorev-cubugu-ust-cizgi"
      style={{
        top: geometri.ustOfset,
        height: geometri.yukseklik,
      }}
      viewBox={`0 0 ${geometri.genislik} ${geometri.yukseklik}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        key={animAnahtar}
        className={`ap-gorev-cubugu-ust-cizgi-yol ${animSinif}`}
        pathLength={1}
        d={geometri.yol}
        fill="none"
        vectorEffect="non-scaling-stroke"
        onAnimationEnd={() => setAnimBitti(true)}
      />
    </svg>
  );
}
