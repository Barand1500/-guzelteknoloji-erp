import { MetinSayiHucre } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MetinSayiHucre';
import { urunBul } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import type { MenuUrunSatiri } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

interface MenuUrunTabloProps {
  urunler: MenuUrunSatiri[];
  duzenlenebilir: boolean;
  onUrunSecAc: () => void;
  onFiyatAc: (satirId: string) => void;
  onFiyatFarkiDegistir: (satirId: string, fiyatFarki: number) => void;
  onUrunSil: (satirId: string) => void;
}

export function MenuUrunTablo({
  urunler,
  duzenlenebilir,
  onUrunSecAc,
  onFiyatAc,
  onFiyatFarkiDegistir,
  onUrunSil,
}: MenuUrunTabloProps) {
  return (
    <section className="ap-menu-tanim-urunler" aria-labelledby="menu-urun-baslik">
      <h3 id="menu-urun-baslik" className="ap-menu-tanim-bolum-baslik">
        Menü Ürün Listesi
      </h3>

      <div className="ap-menu-tanim-urun-tablo-wrap">
        <table className="ap-menu-tanim-urun-tablo">
          <thead>
            <tr>
              <th>Ürün Adı</th>
              <th>Fiyatı (+/-)</th>
              <th className="ap-menu-tanim-urun-islem" aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {urunler.map((satir) => {
              const urun = urunBul(satir.urunId);
              return (
                <tr key={satir.id}>
                  <td>
                    <span className="ap-menu-tanim-urun-ad">{urun?.ad ?? satir.urunId}</span>
                    {urun ? <span className="ap-menu-tanim-urun-grup">{urun.grup}</span> : null}
                  </td>
                  <td>
                    <MetinSayiHucre
                      deger={satir.fiyatFarki}
                      senkronAnahtar={`${satir.id}-fark`}
                      tip="isaretli-ondalik"
                      disabled={!duzenlenebilir}
                      className="ap-menu-tanim-urun-fark"
                      onDegistir={(fiyatFarki) => onFiyatFarkiDegistir(satir.id, fiyatFarki)}
                    />
                  </td>
                  <td className="ap-menu-tanim-urun-islem">
                    <button
                      type="button"
                      className="ap-menu-tanim-nokta-btn"
                      disabled={!duzenlenebilir}
                      title="Fiyat listeleri"
                      onClick={() => onFiyatAc(satir.id)}
                    >
                      …
                    </button>
                    {duzenlenebilir ? (
                      <button
                        type="button"
                        className="ap-menu-tanim-sil-btn"
                        title="Ürünü kaldır"
                        onClick={() => onUrunSil(satir.id)}
                      >
                        ✕
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            <tr className="ap-menu-tanim-urun-yeni-satir">
              <td colSpan={2}>
                <span className="ap-muted text-sm">[Yeni Ürün Seçiniz]</span>
              </td>
              <td className="ap-menu-tanim-urun-islem">
                <button
                  type="button"
                  className="ap-menu-tanim-nokta-btn"
                  disabled={!duzenlenebilir}
                  title="Ürün seç"
                  onClick={onUrunSecAc}
                >
                  …
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
