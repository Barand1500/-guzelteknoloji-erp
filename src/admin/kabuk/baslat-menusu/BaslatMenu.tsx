import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { sekmeAyarlariOku } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuKlasik } from './BaslatMenuKlasik';
import { BaslatMenuModern } from './BaslatMenuModern';
import { BaslatMenuKenarlikAnimasyon } from './BaslatMenuKenarlikAnimasyon';
import { useBaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuProps {
  acik: boolean;
  onKapat: () => void;
  onModulSec: (modul: AdminModul) => void;
  baslatButonRef?: RefObject<HTMLButtonElement | null>;
}

export function BaslatMenu({ acik, onKapat, onModulSec, baslatButonRef }: BaslatMenuProps) {
  const menuDurumu = useBaslatMenuDurumu();
  const [tasarim, setTasarim] = useState(() => sekmeAyarlariOku().baslatMenuTasarim);
  const [dockStil, setDockStil] = useState<CSSProperties>();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setTasarim(sekmeAyarlariOku().baslatMenuTasarim);
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  const dockAktif = Boolean(baslatButonRef);

  useLayoutEffect(() => {
    if (!acik || !dockAktif || !baslatButonRef?.current) {
      setDockStil(undefined);
      return;
    }

    const guncelle = () => {
      const btn = baslatButonRef.current?.getBoundingClientRect();
      if (!btn) return;
      setDockStil({ left: btn.left, top: btn.bottom - 1 });
    };

    guncelle();
    const raf = requestAnimationFrame(guncelle);
    window.addEventListener('resize', guncelle);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', guncelle);
    };
  }, [acik, dockAktif, baslatButonRef]);

  const menuProps = {
    ref: menuRef,
    menuDurumu,
    onModulSec,
    onKapat,
    kenarlikAnim: dockAktif && acik,
    dockStil: dockAktif && acik ? dockStil : undefined,
    dockYerlesim: 'dikdortgen' as const,
  };

  return (
    <>
      {acik && <div className="ap-baslat-overlay fixed inset-0 z-40 bg-black/25" onClick={onKapat} />}
      <div hidden={!acik} aria-hidden={!acik}>
        {tasarim === 'modern' ? <BaslatMenuModern {...menuProps} /> : <BaslatMenuKlasik {...menuProps} />}
      </div>
      {acik && dockAktif && baslatButonRef && (
        <BaslatMenuKenarlikAnimasyon butonRef={baslatButonRef} menuRef={menuRef} />
      )}
    </>
  );
}
