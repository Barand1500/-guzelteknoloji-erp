import { forwardRef, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { sekmeAyarlariOku } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import { KATEGORI_IKON, type BaslatMenuDurumu } from './baslatMenuOrtak';

interface BaslatMenuModernProps {
  acik: boolean;
  menuDurumu: BaslatMenuDurumu;
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
  kenarlikAnim?: boolean;
  dockStil?: CSSProperties;
  dockYerlesim?: 'kare' | 'dikdortgen';
}

export const BaslatMenuModern = forwardRef<HTMLDivElement, BaslatMenuModernProps>(function BaslatMenuModern(
  { menuDurumu, onModulSec, onKapat, kenarlikAnim = false, dockStil, dockYerlesim = 'dikdortgen' },
  ref
) {
  const { t } = usePanelDil();
  const { arama, setArama, seciliKategori, seciliKategoriAyarla, modulAcildi, sonuclar, gorunurModuller, kategoriler } =
    menuDurumu;
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
    const ilk = doluKategoriler[0];
    if (ilk) seciliKategoriAyarla(ilk);
  }, [arama, doluKategoriler, seciliKategori, seciliKategoriAyarla]);

  const modulSec = (modul: AdminModul) => {
    modulAcildi(modul.kategori);
    onModulSec(modul);
    onKapat();
  };

  const seciliModuller = seciliKategori
    ? gorunurModuller.filter((m) => m.kategori === seciliKategori)
    : [];

  const toplamModul = arama ? sonuclar.length : gorunurModuller.length;
  const tamEkran = modernAyar.kutuBoyutu === 'buyuk';

  return (
    <div
      ref={ref}
      style={dockStil}
      className={[
        'ap-baslat-menu-dock ap-baslat-menu-modern flex flex-col overflow-hidden border border-[var(--ap-border)] border-l-0 shadow-2xl',
        tamEkran
          ? 'ap-baslat-modern-tam-ekran w-full max-w-none rounded-none'
          : 'w-[min(720px,96vw)]',
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
            <p className="ap-baslat-modern-baslik">{t('header.baslatMenu', 'Başlat Menüsü')}</p>
            <p className="ap-baslat-modern-alt">
              {toplamModul} modül · {t('header.modulAra', 'Modül veya ayar ara')}
            </p>
          </div>
          <button
            type="button"
            className="ap-baslat-modern-kapat"
            onClick={onKapat}
            aria-label="Menüyü kapat"
          >
            ✕
          </button>
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
              <p className="ap-baslat-modern-bos">Eşleşen modül bulunamadı.</p>
            ) : (
              <ModulKutuGrid moduller={sonuclar} onSec={modulSec} />
            )}
          </div>
        ) : (
          <>
            <aside className="ap-baslat-modern-kategori-sutun ap-scroll">
              <p className="ap-baslat-modern-sutun-baslik">Kategoriler</p>
              <div className="ap-baslat-modern-kategori-kutular">
                {doluKategoriler.map((kategori) => {
                  const adet = gorunurModuller.filter((m) => m.kategori === kategori).length;
                  const aktif = seciliKategori === kategori;
                  return (
                    <button
                      key={kategori}
                      type="button"
                      className={`ap-baslat-modern-kategori-kutu${aktif ? ' ap-baslat-modern-kategori-kutu-aktif' : ''}`}
                      onClick={() => seciliKategoriAyarla(kategori)}
                      aria-pressed={aktif}
                    >
                      <span className="ap-baslat-modern-kategori-kutu-ikon" aria-hidden>
                        {KATEGORI_IKON[kategori] ?? '•'}
                      </span>
                      <span className="ap-baslat-modern-kategori-kutu-ad">
                        {t(`kategori.${kategori}`, kategori)}
                      </span>
                      <span className="ap-baslat-modern-kategori-kutu-sayi">{adet}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="ap-baslat-modern-modul-sutun ap-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
              {seciliKategori ? (
                <>
                  <p className="ap-baslat-modern-sutun-baslik">
                    {t(`kategori.${seciliKategori}`, seciliKategori)}
                    <span className="ap-baslat-modern-sayi">{seciliModuller.length}</span>
                  </p>
                  <ModulKutuGrid moduller={seciliModuller} onSec={modulSec} />
                </>
              ) : (
                <p className="ap-baslat-modern-bos">Bir kategori seçin.</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="ap-baslat-modern-alt-cubuk">
        <span>Modern görünüm · {tamEkran ? 'Tam ekran' : 'Panel'}</span>
        <span className="ap-muted">Sekme Yönetimi&apos;nden değiştirebilirsiniz</span>
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
            {modul.ikon}
          </span>
          <span className="ap-baslat-modern-modul-kutu-ad">{t(`modul.${modul.id}`, modul.baslik)}</span>
        </button>
      ))}
    </div>
  );
}
