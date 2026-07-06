import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { TanimlarMasaGrubu, TanimlarMasaGrubuAyarlar } from '@/admin/baslat-menusu/tanimlar/masa-gruplari/tipler';

interface TanimlarMasaGrubuAyarlarPanelProps {
  grup: TanimlarMasaGrubu;
  ayarlar: TanimlarMasaGrubuAyarlar;
  onAyarlarDegistir: (ayarlar: TanimlarMasaGrubuAyarlar) => void;
  onGeri: () => void;
}

export function TanimlarMasaGrubuAyarlarPanel({
  grup,
  ayarlar,
  onAyarlarDegistir,
  onGeri,
}: TanimlarMasaGrubuAyarlarPanelProps) {
  return (
    <div className="ap-tanimlar-masa-ayar-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>
      <header className="ap-tanimlar-panel-baslik">
        <h3 className="ap-tanimlar-yetki-baslik">Ayarlar</h3>
        <p className="ap-tanimlar-yetki-alt">{grup.grup} masa grubu</p>
      </header>

      <label className="ap-tanimlar-masa-ayar-checkbox">
        <input
          type="checkbox"
          checked={ayarlar.girisCariSec}
          onChange={(e) => onAyarlarDegistir({ ...ayarlar, girisCariSec: e.target.checked })}
        />
        <span>Girişte cari seç</span>
      </label>

      <section className="ap-tanimlar-masa-ayar-bolum">
        <h4 className="ap-tanimlar-masa-ayar-bolum-baslik">Masa açılışında eklenecek ürünler</h4>
        <textarea
          className="ap-tanimlar-masa-ayar-textarea"
          rows={10}
          value={ayarlar.masaAcilisUrunleri}
          onChange={(e) => onAyarlarDegistir({ ...ayarlar, masaAcilisUrunleri: e.target.value })}
          spellCheck={false}
        />
        <p className="ap-tanimlar-masa-ayar-yardim">Her satıra bir ürün yazınız.</p>
        <p className="ap-tanimlar-masa-ayar-yardim">Ürün isimlerini doğru yazdığınızdan emin olunuz.</p>
      </section>
    </div>
  );
}
