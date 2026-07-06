import { forwardRef, useEffect, useRef, type CSSProperties } from 'react';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import { baslatMenuScrollKaydet, baslatMenuScrollOku } from './baslatMenuKategoriDurumu';
import { KATEGORI_IKON, type BaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuKlasikProps {
  acik: boolean;
  menuDurumu: BaslatMenuDurumu;
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
  kenarlikAnim?: boolean;
  dockStil?: CSSProperties;
  dockYerlesim?: 'kare' | 'dikdortgen';
}

export const BaslatMenuKlasik = forwardRef<HTMLDivElement, BaslatMenuKlasikProps>(function BaslatMenuKlasik(
  { acik, menuDurumu, onModulSec, onKapat, kenarlikAnim = false, dockStil, dockYerlesim = 'dikdortgen' },
  ref
) {
  const { t } = usePanelDil();
  const { arama, setArama, kapaliKategoriler, kategoriToggle, modulAcildi, sonuclar, gorunurModuller, kategoriler } =
    menuDurumu;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (acik) {
      const raf = requestAnimationFrame(() => {
        el.scrollTop = baslatMenuScrollOku();
      });
      return () => cancelAnimationFrame(raf);
    }

    baslatMenuScrollKaydet(el.scrollTop);
  }, [acik]);

  const modulSec = (modul: AdminModul) => {
    modulAcildi(modul.kategori);
    onModulSec(modul);
    onKapat();
  };

  return (
    <div
      ref={ref}
      style={dockStil}
      className={`ap-baslat-menu-dock ap-baslat-menu-klasik flex w-[min(440px,92vw)] flex-col overflow-hidden border border-[var(--ap-border)] border-l-0 bg-[var(--ap-surface)] shadow-2xl${kenarlikAnim ? ` ap-baslat-menu-dock--kenarlik-anim ap-baslat-menu-dock--bagli ap-baslat-menu-dock--${dockYerlesim}` : ''}`}
    >
      <div className="border-b border-[var(--ap-border)] bg-[var(--ap-header-bg)] px-3 py-2">
        <p className="ap-heading text-xs font-bold">{t('header.baslatMenu', 'Başlat Menüsü')}</p>
        <p className="ap-muted text-[10px]">{t('header.modulAra', 'Modül veya ayar ara')}</p>
      </div>

      <BaslatMenuArama deger={arama} onDegistir={setArama} variant="klasik" />

      <div ref={scrollRef} className="ap-scroll flex-1 overflow-y-auto p-2">
        {arama ? (
          <ModulListesi
            baslik={`Arama: "${arama}"`}
            kategori=""
            moduller={sonuclar}
            katlanmis={false}
            onKategoriToggle={undefined}
            onSec={modulSec}
          />
        ) : (
          kategoriler.map((kategori) => (
            <ModulListesi
              key={kategori}
              baslik={t(`kategori.${kategori}`, kategori)}
              kategori={kategori}
              moduller={gorunurModuller.filter((m) => m.kategori === kategori)}
              katlanmis={kapaliKategoriler.has(kategori)}
              onKategoriToggle={() => kategoriToggle(kategori)}
              onSec={modulSec}
            />
          ))
        )}
      </div>
    </div>
  );
});

function ModulListesi({
  baslik,
  kategori,
  moduller,
  katlanmis,
  onKategoriToggle,
  onSec,
}: {
  baslik: string;
  kategori: string;
  moduller: AdminModul[];
  katlanmis: boolean;
  onKategoriToggle?: () => void;
  onSec: (modul: AdminModul) => void;
}) {
  const { t } = usePanelDil();
  if (moduller.length === 0) return null;

  const katlanabilir = Boolean(kategori && onKategoriToggle);

  return (
    <div className={`ap-menu-kategori${katlanmis ? ' ap-menu-kategori-kapali' : ''}`}>
      {katlanabilir ? (
        <button
          type="button"
          className="ap-menu-kategori-baslik ap-menu-kategori-baslik-tus"
          onClick={onKategoriToggle}
          aria-expanded={!katlanmis}
        >
          <span className="ap-menu-kategori-baslik-ikon" aria-hidden>
            {KATEGORI_IKON[kategori] ?? '•'}
          </span>
          <span className="ap-menu-kategori-baslik-metin">{baslik}</span>
          <span className="ap-menu-kategori-ok" aria-hidden>
            ▼
          </span>
        </button>
      ) : (
        <p className="ap-menu-kategori-baslik">
          {kategori && <span>{KATEGORI_IKON[kategori] ?? '•'}</span>}
          {baslik}
        </p>
      )}

      {!katlanmis && (
        <ul className="ap-menu-kategori-liste space-y-0.5">
          {moduller.map((modul) => (
            <li key={modul.id}>
              <button type="button" onClick={() => onSec(modul)} className="ap-menu-oge">
                <span className="ap-menu-oge-ikon">{modul.ikon}</span>
                <span className="font-medium">{t(`modul.${modul.id}`, modul.baslik)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
