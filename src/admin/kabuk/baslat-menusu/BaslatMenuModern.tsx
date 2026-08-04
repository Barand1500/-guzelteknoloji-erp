import { forwardRef, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { sekmeAyarlariOku } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import { BaslatMenuIkon, type BaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuModernProps {
  menuDurumu: BaslatMenuDurumu;
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
  onOzelTanimlarAc?: () => void;
  kenarlikAnim?: boolean;
  dockStil?: CSSProperties;
  dockYerlesim?: 'kare' | 'dikdortgen';
}

export const BaslatMenuModern = forwardRef<HTMLDivElement, BaslatMenuModernProps>(function BaslatMenuModern(
  { menuDurumu, onModulSec, onKapat, onOzelTanimlarAc, kenarlikAnim = false, dockStil, dockYerlesim = 'dikdortgen' },
  ref
) {
  const { t } = usePanelDil();
  const { arama, setArama, sonuclar, gorunurModuller, kategoriler, sadeceFavoriler, favoriFiltreToggle } =
    menuDurumu;
  const [seciliKategori, setSeciliKategori] = useState<string | null>(null);
  const [modernAyar, setModernAyar] = useState(() => {
    const ayar = sekmeAyarlariOku();
    return {
      kategoriGorunum: ayar.baslatMenuKategoriGorunum,
      kutuBoyutu: ayar.baslatMenuKutuBoyutu,
    };
  });

  useEffect(() => {
    const handler = () => {
      const ayar = sekmeAyarlariOku();
      setModernAyar({
        kategoriGorunum: ayar.baslatMenuKategoriGorunum,
        kutuBoyutu: ayar.baslatMenuKutuBoyutu,
      });
    };
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  const doluKategoriler = useMemo(
    () => kategoriler.filter((k) => gorunurModuller.some((m) => m.kategori === k)),
    [kategoriler, gorunurModuller]
  );

  useEffect(() => {
    if (arama) return;
    if (seciliKategori && doluKategoriler.some((k) => k === seciliKategori)) return;
    setSeciliKategori(doluKategoriler[0] ?? null);
  }, [arama, doluKategoriler, seciliKategori]);

  const modulSec = (modul: AdminModul) => {
    onModulSec(modul);
    onKapat();
  };

  const seciliModuller = seciliKategori
    ? gorunurModuller.filter((m) => m.kategori === seciliKategori)
    : [];

  const tamEkran = modernAyar.kutuBoyutu === 'buyuk';

  return (
    <div
      ref={ref}
      style={dockStil}
      className={[
        'ap-baslat-menu-dock ap-baslat-menu-modern z-50 flex flex-col overflow-hidden border border-[var(--ap-border)] border-l-0 shadow-2xl',
        tamEkran
          ? 'ap-baslat-modern-tam-ekran h-[calc(100vh-3rem)] w-full max-w-none rounded-none'
          : 'max-h-[calc(100vh-3rem)] w-[min(720px,96vw)]',
        `ap-baslat-modern-kutu-${modernAyar.kutuBoyutu}`,
        `ap-baslat-modern-kategori-${modernAyar.kategoriGorunum}`,
        kenarlikAnim
          ? `ap-baslat-menu-dock--kenarlik-anim ap-baslat-menu-dock--bagli ap-baslat-menu-dock--${dockYerlesim}`
          : '',
      ].join(' ')}
    >
      <div className="ap-baslat-modern-ust">
        <div className="ap-baslat-modern-ust-icerik">
          <div className="ap-baslat-modern-baslik-alan">
            <p className="ap-baslat-modern-baslik">
              {sadeceFavoriler
                ? t('header.favoriMenu', 'Favori Sayfalar')
                : t('header.baslatMenu', 'Başlat Menüsü')}
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
            <button
              type="button"
              className="ap-baslat-modern-kapat"
              onClick={onKapat}
              aria-label="Menüyü kapat"
            >
              ✕
            </button>
          </div>
        </div>
        <BaslatMenuArama deger={arama} onDegistir={setArama} variant="modern" />
      </div>

      <div className="ap-baslat-modern-govde flex min-h-0 flex-1">
        {arama ? (
          <div className="ap-scroll ap-baslat-modern-icerik ap-baslat-modern-icerik-tam flex-1 overflow-y-auto">
            <p className="ap-baslat-modern-arama-etiket">
              Arama sonuçları <span className="ap-baslat-modern-sayi">{sonuclar.length}</span>
            </p>
            {sonuclar.length === 0 ? (
              <p className="ap-baslat-modern-bos">
                {sadeceFavoriler ? 'Favori sayfa bulunamadı.' : 'Eşleşen modül bulunamadı.'}
              </p>
            ) : (
              <ModulKutuGrid moduller={sonuclar} onSec={modulSec} />
            )}
          </div>
        ) : (
          <>
            <aside className="ap-baslat-modern-kategori-sutun ap-scroll">
              <p className="ap-baslat-modern-sutun-baslik">
                {sadeceFavoriler ? 'Favori kategoriler' : 'Kategoriler'}
              </p>
              <div className="ap-baslat-modern-kategori-kutular">
                {doluKategoriler.length === 0 ? (
                  <p className="ap-baslat-modern-bos ap-baslat-modern-bos--sutun">
                    {sadeceFavoriler
                      ? 'Henüz favori yok. Aksiyon çubuğundan yıldız ile ekleyin.'
                      : 'Gösterilecek kategori yok.'}
                  </p>
                ) : (
                  doluKategoriler.map((kategori) => {
                    const adet = gorunurModuller.filter((m) => m.kategori === kategori).length;
                    const aktif = seciliKategori === kategori;
                    return (
                      <button
                        key={kategori}
                        type="button"
                        className={`ap-baslat-modern-kategori-kutu${aktif ? ' ap-baslat-modern-kategori-kutu-aktif' : ''}`}
                        onClick={() => setSeciliKategori(kategori)}
                        aria-pressed={aktif}
                      >
                        <span className="ap-baslat-modern-kategori-kutu-ikon" aria-hidden>
                          <BaslatMenuIkon kategori={kategori} boyut={18} />
                        </span>
                        <span className="ap-baslat-modern-kategori-kutu-ad">
                          {t(`kategori.${kategori}`, kategori)}
                        </span>
                        <span className="ap-baslat-modern-kategori-kutu-sayi">{adet}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <div className="ap-baslat-modern-modul-sutun ap-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
              {seciliKategori ? (
                <>
                  <p className="ap-baslat-modern-sutun-baslik">
                    {t(`kategori.${seciliKategori}`, seciliKategori)}
                    <span className="ap-baslat-modern-sayi">{seciliModuller.length}</span>
                  </p>
                  {seciliModuller.length === 0 ? (
                    <p className="ap-baslat-modern-bos">
                      {sadeceFavoriler ? 'Bu kategoride favori yok.' : 'Modül yok.'}
                    </p>
                  ) : (
                    <ModulKutuGrid moduller={seciliModuller} onSec={modulSec} />
                  )}
                </>
              ) : (
                <p className="ap-baslat-modern-bos">
                  {sadeceFavoriler
                    ? 'Henüz favori yok. Aksiyon çubuğundan yıldız ile ekleyin.'
                    : 'Bir kategori seçin.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="ap-baslat-modern-alt-cubuk">
        <span>Modern Görünüm · {tamEkran ? 'Tam ekran' : 'Panel'}</span>
        <span className="ap-muted">Sekme Yönetimi&apos;nden Değiştirebilirsiniz</span>
      </div>
    </div>
  );
});

function ModulKutuGrid({
  moduller,
  onSec,
}: {
  moduller: AdminModul[];
  onSec: (modul: AdminModul) => void;
}) {
  const { t } = usePanelDil();
  return (
    <div className="ap-baslat-modern-modul-kutular">
      {moduller.map((modul) => (
        <button
          key={modul.id}
          type="button"
          className="ap-baslat-modern-modul-kutu"
          onClick={() => onSec(modul)}
          title={t(`modul.${modul.id}`, modul.baslik)}
        >
          <span className="ap-baslat-modern-modul-kutu-ikon" aria-hidden>
            <BaslatMenuIkon modulId={modul.id} boyut={28} />
          </span>
          <span className="ap-baslat-modern-modul-kutu-ad">{t(`modul.${modul.id}`, modul.baslik)}</span>
        </button>
      ))}
    </div>
  );
}
