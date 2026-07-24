import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  OZEL_TANIM_MODULLERI,
  OZEL_TANIM_VARSAYILAN_MODUL,
  type OzelTanimModulId,
} from '@/admin/baslat-menusu/ozel-tanimlar/katalog';
import {
  otAramaOdakla,
  otAramaOdaktanCik,
  otEkleButonunuTikla,
  otKlavyeYoksayMi,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/otKlavye';
import { OzelTanimlarSifreKapisi } from '@/admin/baslat-menusu/ozel-tanimlar/sifre/OzelTanimlarSifreKapisi';
import { ParaBirimleriSayfasi } from '@/admin/baslat-menusu/ozel-tanimlar/para-birimleri/sayfa';
import { BankalarKartlarSayfasi } from '@/admin/baslat-menusu/ozel-tanimlar/bankalar-kartlar/sayfa';
import { VergilerHubSayfasi } from '@/admin/baslat-menusu/ozel-tanimlar/vergiler/sayfa';
import { CariStokHubSayfasi } from '@/admin/baslat-menusu/ozel-tanimlar/cari-stok/sayfa';
import { ResmiTatillerSayfasi } from '@/admin/baslat-menusu/ozel-tanimlar/resmi-tatiller/sayfa';
import '@/admin/baslat-menusu/ozel-tanimlar/ozel-tanimlar.css';

export function OzelTanimlarSayfasi() {
  // Sekme açık kaldıkça state korunur; sekme kapanıp yeniden açılınca sıfırdan login
  const [girisOk, setGirisOk] = useState(false);
  const [aktifModul, setAktifModul] = useState<OzelTanimModulId>(OZEL_TANIM_VARSAYILAN_MODUL);
  const hubRef = useRef<HTMLDivElement>(null);

  const modulSec = useCallback((id: OzelTanimModulId) => {
    setAktifModul(id);
  }, []);

  useEffect(() => {
    if (!girisOk) return;

    function onKey(e: KeyboardEvent) {
      // Ara kutusundayken Esc → odaktan çık (modal kapatmaz)
      if (e.key === 'Escape' && otAramaOdaktanCik(hubRef.current, e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (otKlavyeYoksayMi(e, hubRef.current)) return;

      const adet = OZEL_TANIM_MODULLERI.length;
      const idx = OZEL_TANIM_MODULLERI.findIndex((m) => m.id === aktifModul);

      if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (otEkleButonunuTikla(hubRef.current)) {
          e.preventDefault();
        }
        return;
      }

      if (e.key.toLowerCase() === 's' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (otAramaOdakla(hubRef.current)) {
          e.preventDefault();
        }
        return;
      }

      if (e.key >= '1' && e.key <= String(adet) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const hedef = OZEL_TANIM_MODULLERI[Number(e.key) - 1];
        if (!hedef) return;
        e.preventDefault();
        modulSec(hedef.id);
        return;
      }

      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      if (idx < 0) return;

      e.preventDefault();
      const sonraki =
        e.key === 'ArrowDown' ? (idx + 1) % adet : (idx - 1 + adet) % adet;
      modulSec(OZEL_TANIM_MODULLERI[sonraki]!.id);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aktifModul, girisOk, modulSec]);

  if (!girisOk) {
    return (
      <AdminModulKabuk baslik="Özel Tanımlar" aciklama="Yönetim tanımlarına erişim">
        <OzelTanimlarSifreKapisi onGiris={() => setGirisOk(true)} />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk
      baslik="Özel Tanımlar"
      aciklama="Site genelinde kullanılan tanımları buradan yönetin"
    >
      <div className="ot-hub" ref={hubRef}>
        <aside className="ot-hub-nav">
          <p className="ot-hub-nav-baslik">Tanımlar</p>
          <nav className="ot-hub-nav-liste" aria-label="Özel tanımlar">
            {OZEL_TANIM_MODULLERI.map((modul, i) => {
              const aktif = modul.id === aktifModul;
              const no = i + 1;
              return (
                <button
                  key={modul.id}
                  type="button"
                  className={`ot-hub-nav-oge${aktif ? ' ot-hub-nav-oge-aktif' : ''}`}
                  onClick={() => modulSec(modul.id)}
                  aria-current={aktif ? 'page' : undefined}
                  aria-keyshortcuts={String(no)}
                  title={`${modul.baslik} (${no})`}
                >
                  <span className="ot-hub-nav-ikon" aria-hidden>
                    {modul.ikon}
                  </span>
                  <span className="ot-hub-nav-metin">
                    <span className="ot-hub-nav-ad">{modul.baslik}</span>
                    <span className="ot-hub-nav-alt">{modul.aciklama}</span>
                  </span>
                  <span className="ot-hub-nav-kisayol" aria-hidden>
                    {no}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <AdminPanelKarti>
          {aktifModul === 'para-birimleri' ? <ParaBirimleriSayfasi /> : null}
          {aktifModul === 'bankalar-kartlar' ? <BankalarKartlarSayfasi /> : null}
          {aktifModul === 'vergiler' ? <VergilerHubSayfasi /> : null}
          {aktifModul === 'cari-stok' ? <CariStokHubSayfasi /> : null}
          {aktifModul === 'resmi-tatiller' ? <ResmiTatillerSayfasi /> : null}
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
