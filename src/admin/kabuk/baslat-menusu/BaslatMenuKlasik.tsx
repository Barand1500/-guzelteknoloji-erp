import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { forwardRef, type CSSProperties } from 'react';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import { BaslatMenuIkon, type BaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuKlasikProps {
  menuDurumu: BaslatMenuDurumu;
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
  onProfilAc?: () => void;
  onOzelTanimlarAc?: () => void;
  kenarlikAnim?: boolean;
  dockStil?: CSSProperties;
  dockYerlesim?: 'kare' | 'dikdortgen';
}

export const BaslatMenuKlasik = forwardRef<HTMLDivElement, BaslatMenuKlasikProps>(function BaslatMenuKlasik(
  { menuDurumu, onModulSec, onKapat, onProfilAc, onOzelTanimlarAc, kenarlikAnim = false, dockStil, dockYerlesim = 'dikdortgen' },
  ref
) {
  const { t } = usePanelDil();
  const { arama, setArama, kapaliKategoriler, kategoriToggle, sonuclar, gorunurModuller, kategoriler, sadeceFavoriler, favoriFiltreToggle } =
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
          <p className="ap-heading text-xs font-bold">
            {sadeceFavoriler
              ? t('header.favoriMenu', 'Favori Sayfalar')
              : t('header.baslatMenu', 'Başlat Menüsü')}
          </p>
          <p className="ap-muted text-[10px]">
            {sadeceFavoriler
              ? 'Yalnızca favori modüller'
              : t('header.modulAra', 'Modül veya Ayar Ara')}
          </p>
        </div>
        <div className="ap-baslat-modern-ust-aksiyonlar">
          <button
            type="button"
            className={`ap-baslat-modern-favori${sadeceFavoriler ? ' ap-baslat-modern-favori--aktif' : ''}`}
            onClick={favoriFiltreToggle}
            aria-label={sadeceFavoriler ? 'Tüm menüyü göster' : 'Sadece favorileri göster'}
            title={sadeceFavoriler ? 'Tüm menüyü göster' : 'Sadece favorileri göster'}
            aria-pressed={sadeceFavoriler}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9 6.75 19.7l1-5.85L3.5 9.7l5.9-.9L12 3.5z"
                fill={sadeceFavoriler ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
          {onProfilAc ? (
            <button
              type="button"
              className="ap-baslat-modern-profil"
              onClick={onProfilAc}
              aria-label={t('header.profil', 'Profil')}
              title={t('header.profil', 'Profil')}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M5.5 18.25c1.35-2.6 3.55-3.9 6.5-3.9s5.15 1.3 6.5 3.9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <BaslatMenuArama deger={arama} onDegistir={setArama} variant="klasik" />

      <div className="ap-scroll flex-1 overflow-y-auto p-2">
        {arama ? (
          sonuclar.length === 0 ? (
            <p className="ap-baslat-modern-bos px-2 py-3">
              {sadeceFavoriler ? 'Favori sayfa bulunamadı.' : 'Eşleşen modül bulunamadı.'}
            </p>
          ) : (
            <ModulListesi
              baslik={`Arama: "${arama}"`}
              kategori=""
              moduller={sonuclar}
              katlanmis={false}
              onKategoriToggle={undefined}
              onSec={modulSec}
            />
          )
        ) : sadeceFavoriler && gorunurModuller.length === 0 ? (
          <p className="ap-baslat-modern-bos px-2 py-3">
            Henüz favori yok. Aksiyon çubuğundan yıldız ile ekleyin.
          </p>
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
            <BaslatMenuIkon kategori={kategori} boyut={16} />
          </span>
          <span className="ap-menu-kategori-baslik-metin">{baslik}</span>
          <span className="ap-menu-kategori-ok" aria-hidden>
            ▼
          </span>
        </button>
      ) : (
        <p className="ap-menu-kategori-baslik">
          {kategori && (
            <span>
              <BaslatMenuIkon kategori={kategori} boyut={16} />
            </span>
          )}
          {baslik}
        </p>
      )}

      {!katlanmis && (
        <ul className="ap-menu-kategori-liste space-y-0.5">
          {moduller.map((modul) => (
            <li key={modul.id}>
              <button type="button" onClick={() => onSec(modul)} className="ap-menu-oge">
                <span className="ap-menu-oge-ikon">
                  <BaslatMenuIkon modulId={modul.id} boyut={16} />
                </span>
                <span className="font-medium">{t(`modul.${modul.id}`, modul.baslik)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
