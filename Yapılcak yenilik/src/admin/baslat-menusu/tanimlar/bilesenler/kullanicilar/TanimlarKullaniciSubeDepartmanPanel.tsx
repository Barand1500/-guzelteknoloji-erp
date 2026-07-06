import { formInputSinifi } from '@/formlar/FormAlani';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { TanimlarKullanici } from '@/admin/baslat-menusu/tanimlar/kullanicilar/tipler';
import type { TanimlarSubeDepartmanKaydi } from '@/admin/baslat-menusu/tanimlar/kullanicilar/subeDepartmanTipler';

interface TanimlarKullaniciSubeDepartmanPanelProps {
  kullanici: TanimlarKullanici;
  kayit: TanimlarSubeDepartmanKaydi;
  onKayitDegistir: (kayit: TanimlarSubeDepartmanKaydi) => void;
  onAta: () => void;
  onGeri: () => void;
}

export function TanimlarKullaniciSubeDepartmanPanel({
  kullanici,
  kayit,
  onKayitDegistir,
  onAta,
  onGeri,
}: TanimlarKullaniciSubeDepartmanPanelProps) {
  const kilitli = kayit.atanmis;

  return (
    <div className="ap-tanimlar-sube-dep-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>
      <header className="ap-tanimlar-panel-baslik">
        <h3 className="ap-tanimlar-yetki-baslik">{kullanici.kullaniciAdi} — Şube / Departman</h3>
        <p className="ap-tanimlar-yetki-alt">Personel şube ve departman ataması</p>
      </header>

      <div className="ap-tanimlar-sube-dep-uyari" role="note">
        <strong>Uyarı:</strong> Şube ve departman ataması bir kere yapıldıktan sonra değiştirilemez.
      </div>

      <section className="ap-tanimlar-sube-dep-form-kart">
        <div className="ap-tanimlar-sube-dep-alan">
          <label htmlFor={`sube-no-${kullanici.id}`}>Şube No</label>
          <input
            id={`sube-no-${kullanici.id}`}
            type="text"
            inputMode="numeric"
            className={formInputSinifi}
            value={kayit.subeNo}
            disabled={kilitli}
            onChange={(e) => onKayitDegistir({ ...kayit, subeNo: e.target.value })}
            placeholder="Örn. 1"
          />
        </div>
        <div className="ap-tanimlar-sube-dep-alan">
          <label htmlFor={`departman-no-${kullanici.id}`}>Departman No</label>
          <input
            id={`departman-no-${kullanici.id}`}
            type="text"
            inputMode="numeric"
            className={formInputSinifi}
            value={kayit.departmanNo}
            disabled={kilitli}
            onChange={(e) => onKayitDegistir({ ...kayit, departmanNo: e.target.value })}
            placeholder="Örn. 2"
          />
        </div>

        {kilitli && (
          <p className="ap-tanimlar-sube-dep-kilit-notu">
            Bu kullanıcı için atama tamamlandı. Alanlar salt okunurdur.
          </p>
        )}
      </section>

      <footer className="ap-tanimlar-sube-dep-alt">
        {!kilitli && (
          <button type="button" className="ap-tanimlar-tablo-btn ap-tanimlar-tablo-btn-birincil" onClick={onAta}>
            Departman Ata
          </button>
        )}
      </footer>
    </div>
  );
}
