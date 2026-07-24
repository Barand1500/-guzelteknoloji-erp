import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { forwardRef, type CSSProperties } from 'react';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import { KATEGORI_IKON, type BaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuKlasikProps {
  menuDurumu: BaslatMenuDurumu;
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
  onOzelTanimlarAc?: () => void;
  kenarlikAnim?: boolean;
  dockStil?: CSSProperties;
  dockYerlesim?: 'kare' | 'dikdortgen';
}

export const BaslatMenuKlasik = forwardRef<HTMLDivElement, BaslatMenuKlasikProps>(function BaslatMenuKlasik(
  { menuDurumu, onModulSec, onKapat, onOzelTanimlarAc, kenarlikAnim = false, dockStil, dockYerlesim = 'dikdortgen' },
  ref
) {
  const { t } = usePanelDil();
  const { arama, setArama, kapaliKategoriler, kategoriToggle, sonuclar, gorunurModuller, kategoriler } =
    menuDurumu;

  const modulSec = (modul: AdminModul) => {
    onModulSec(modul);
    onKapat();
  };

  return (
    <div
      ref={ref}
      style={dockStil}
      className={`ap-baslat-menu-dock ap-baslat-menu-klasik z-50 flex max-h-[calc(100vh-3rem)] w-[min(440px,92vw)] flex-col overflow-hidden border border-[var(--ap-border)] border-l-0 bg-[var(--ap-surface)] shadow-2xl${kenarlikAnim ? ` ap-baslat-menu-dock--kenarlik-anim ap-baslat-menu-dock--bagli ap-baslat-menu-dock--${dockYerlesim}` : ''}`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-[var(--ap-border)] bg-[var(--ap-header-bg)] px-3 py-2">
        <div className="min-w-0">
          <p className="ap-heading text-xs font-bold">{t('header.baslatMenu', 'Başlat Menüsü')}</p>
          <p className="ap-muted text-[10px]">{t('header.modulAra', 'Modül veya Ayar Ara')}</p>
        </div>
        {onOzelTanimlarAc ? (
          <button
            type="button"
            className="ap-baslat-modern-ozel-tanimlar"
            onClick={onOzelTanimlarAc}
            aria-label="Özel Tanımlar"
            title="Özel Tanımlar"
          >
            ⚙
          </button>
        ) : null}
      </div>

      <BaslatMenuArama deger={arama} onDegistir={setArama} variant="klasik" />

      <div className="ap-scroll flex-1 overflow-y-auto p-2">
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
