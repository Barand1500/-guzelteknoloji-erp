import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface AnimasyonluKenarlikProps {
  animasyonAnahtar: string | number;
  kapsayiciRef: RefObject<HTMLElement | null>;
  ustYaricap?: number;
}

function sekmeKenarlikYoluOlustur(genislik: number, yukseklik: number, ustYaricap: number) {
  const r = Math.min(ustYaricap, genislik / 2 - 1, yukseklik * 0.45);
  const p = 1;

  return [
    `M ${p} ${yukseklik - p}`,
    `L ${p} ${r + p}`,
    `Q ${p} ${p} ${r + p} ${p}`,
    `L ${genislik - r - p} ${p}`,
    `Q ${genislik - p} ${p} ${genislik - p} ${r + p}`,
    `L ${genislik - p} ${yukseklik - p}`,
  ].join(' ');
}

/** Sekme — sol alttan yukarı, üstten sağa, sağdan aşağı mavi kenarlık animasyonu */
export function AnimasyonluKenarlik({
  animasyonAnahtar,
  kapsayiciRef,
  ustYaricap = 8,
}: AnimasyonluKenarlikProps) {
  const [yol, setYol] = useState('');
  const [boyut, setBoyut] = useState({ w: 0, h: 0 });
  const [animBitti, setAnimBitti] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const ilkAnimRef = useRef(true);

  useLayoutEffect(() => {
    ilkAnimRef.current = true;
    setAnimBitti(false);
    setYol('');
    setBoyut({ w: 0, h: 0 });
  }, [animasyonAnahtar]);

  useLayoutEffect(() => {
    const el = kapsayiciRef.current;
    if (!el) return;

    const guncelle = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width < 2 || height < 2) return;

      const yeniYol = sekmeKenarlikYoluOlustur(width, height, ustYaricap);
      setBoyut({ w: width, h: height });

      if (pathRef.current && !ilkAnimRef.current) {
        pathRef.current.setAttribute('d', yeniYol);
      } else {
        setYol(yeniYol);
      }
    };

    guncelle();
    const raf = requestAnimationFrame(() => requestAnimationFrame(guncelle));
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    window.addEventListener('resize', guncelle);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', guncelle);
    };
  }, [kapsayiciRef, animasyonAnahtar, ustYaricap]);

  if (!yol || boyut.w < 2) return null;

  return (
    <svg
      className="ap-kenarlik-anim"
      viewBox={`0 0 ${boyut.w} ${boyut.h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        ref={pathRef}
        className={animBitti ? 'ap-kenarlik-anim-yol ap-kenarlik-anim-yol--sabit' : 'ap-kenarlik-anim-yol'}
        pathLength={1}
        d={yol}
        fill="none"
        vectorEffect="non-scaling-stroke"
        onAnimationEnd={() => {
          ilkAnimRef.current = false;
          setAnimBitti(true);
        }}
      />
    </svg>
  );
}
