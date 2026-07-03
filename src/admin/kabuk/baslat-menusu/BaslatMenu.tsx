import { useEffect, useState } from 'react';
import { sekmeAyarlariOku } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuKlasik } from './BaslatMenuKlasik';
import { BaslatMenuModern } from './BaslatMenuModern';

interface BaslatMenuProps {
  acik: boolean;
  onKapat: () => void;
  onModulSec: (modul: AdminModul) => void;
}

export function BaslatMenu({ acik, onKapat, onModulSec }: BaslatMenuProps) {
  const [tasarim, setTasarim] = useState(() => sekmeAyarlariOku().baslatMenuTasarim);

  useEffect(() => {
    const handler = () => setTasarim(sekmeAyarlariOku().baslatMenuTasarim);
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  if (!acik) return null;

  return (
    <>
      <div className="ap-baslat-overlay fixed inset-0 z-40 bg-black/25" onClick={onKapat} />
      {tasarim === 'modern' ? (
        <BaslatMenuModern onModulSec={onModulSec} onKapat={onKapat} />
      ) : (
        <BaslatMenuKlasik onModulSec={onModulSec} onKapat={onKapat} />
      )}
    </>
  );
}
