import { formInputSinifi } from '@/formlar/FormAlani';
import { MetinSayiHucre } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MetinSayiHucre';
import type { MenuUrunFiyat } from '@/admin/baslat-menusu/menu-tanimlari/tipler';
import { urunBul } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';

interface MenuUrunFiyatModalProps {
  acik: boolean;
  urunId: string | null;
  fiyatlar: MenuUrunFiyat[];
  onDegistir: (fiyatlar: MenuUrunFiyat[]) => void;
  onKapat: () => void;
}

export function MenuUrunFiyatModal({ acik, urunId, fiyatlar, onDegistir, onKapat }: MenuUrunFiyatModalProps) {
  if (!acik || !urunId) return null;

  const urun = urunBul(urunId);

  return (
    <div className="ap-admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-fiyat-baslik">
      <button type="button" className="ap-admin-modal-backdrop" aria-label="Kapat" onClick={onKapat} />
      <div className="ap-admin-modal ap-menu-tanim-fiyat-modal">
        <header className="ap-admin-modal-header">
          <div>
            <h2 id="menu-fiyat-baslik" className="ap-admin-modal-baslik">
              Fiyatlar
            </h2>
            {urun ? <p className="ap-admin-modal-alt">{urun.ad}</p> : null}
          </div>
          <button type="button" className="ap-admin-modal-kapat" onClick={onKapat}>
            ✕
          </button>
        </header>

        <div className="ap-admin-modal-icerik">
          <table className="ap-menu-tanim-fiyat-tablo">
            <thead>
              <tr>
                <th>Fiyat Listesi</th>
                <th>Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {fiyatlar.map((f, idx) => (
                <tr key={f.fiyatListesi}>
                  <td>{f.fiyatListesi}</td>
                  <td>
                    <MetinSayiHucre
                      deger={f.fiyat}
                      senkronAnahtar={`${urunId}-${f.fiyatListesi}`}
                      tip="ondalik"
                      className={formInputSinifi}
                      onDegistir={(fiyat) => {
                        const yeni = fiyatlar.map((satir, i) =>
                          i === idx ? { ...satir, fiyat: Math.max(0, fiyat) } : satir
                        );
                        onDegistir(yeni);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="ap-admin-modal-footer">
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={onKapat}>
            Tamam
          </button>
        </footer>
      </div>
    </div>
  );
}
