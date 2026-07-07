import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface BaslatMenuKenarlikAnimasyonProps {
  butonRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
}

function kenarlikYoluOlustur(btn: DOMRect, menu: DOMRect) {
  const p = 1;
  const r = Math.min(10, btn.width * 0.14, btn.height * 0.14);
  const menuR = Math.min(12, menu.width * 0.02);
  const solX = btn.left + p;
  const sagBtnX = btn.right - p;
  const ustBtnY = btn.top + p;
  const birlesikY = menu.top + p;
  const menuSagX = menu.right - p;
  const menuAltY = menu.bottom - p;

  return [
    `M ${solX} ${menuAltY}`,
    `L ${solX} ${ustBtnY + r}`,
    `Q ${solX} ${ustBtnY} ${solX + r} ${ustBtnY}`,
    `L ${sagBtnX - r} ${ustBtnY}`,
    `Q ${sagBtnX} ${ustBtnY} ${sagBtnX} ${ustBtnY + r}`,
    `L ${sagBtnX} ${birlesikY}`,
    `L ${menuSagX - menuR} ${birlesikY}`,
    `Q ${menuSagX} ${birlesikY} ${menuSagX} ${birlesikY + menuR}`,
    `L ${menuSagX} ${menuAltY - menuR}`,
    `Q ${menuSagX} ${menuAltY} ${menuSagX - menuR} ${menuAltY}`,
    `L ${solX} ${menuAltY}`,
  ].join(' ');
}

/** Başlat butonundan menü paneline akan mavi kenarlık animasyonu */
export function BaslatMenuKenarlikAnimasyon({ butonRef, menuRef }: BaslatMenuKenarlikAnimasyonProps) {
  const [yol, setYol] = useState('');
  const [animBitti, setAnimBitti] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const animAktifRef = useRef(true);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const btn = butonRef.current;
    if (!menu || !btn) return;

    const guncelle = () => {
      const b = butonRef.current;
      const m = menuRef.current;
      if (!b || !m) return;

      const yeniYol = kenarlikYoluOlustur(b.getBoundingClientRect(), m.getBoundingClientRect());

      if (pathRef.current && !animAktifRef.current) {
        pathRef.current.setAttribute('d', yeniYol);
        return;
      }

      setYol(yeniYol);
    };

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(guncelle);
    });

    const ro = new ResizeObserver(() => {
      if (!animAktifRef.current) guncelle();
    });
    ro.observe(menu);
    ro.observe(btn);

    const resizeHandler = () => {
      if (!animAktifRef.current) guncelle();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      cancelAnimationFrame(raf1);
      ro.disconnect();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [butonRef, menuRef]);

  if (!yol) return null;

  return (
    <svg className="ap-baslat-kenarlik-svg" aria-hidden>
      <path
        ref={pathRef}
        className={animBitti ? 'ap-baslat-kenarlik-yol ap-baslat-kenarlik-yol--sabit' : 'ap-baslat-kenarlik-yol'}
        pathLength={1}
        d={yol}
        fill="none"
        vectorEffect="non-scaling-stroke"
        onAnimationEnd={() => {
          animAktifRef.current = false;
          setAnimBitti(true);
        }}
      />
    </svg>
  );
}
