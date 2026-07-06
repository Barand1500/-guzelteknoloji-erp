import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { LisansKaydi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/tipler';
import { LISANS_URUNLERI, yeniSeriNo } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/varsayilanVeri';

interface LisansFormPanelProps {
  kayit: LisansKaydi;
  duzenleme: boolean;
  onKayitDegistir: (kayit: LisansKaydi) => void;
  onGeri: () => void;
}

export function LisansFormPanel({
  kayit,
  duzenleme,
  onKayitDegistir,
  onGeri,
}: LisansFormPanelProps) {
  const urunDegistir = (urun: string) => {
    const seriNo = duzenleme && kayit.urun === urun ? kayit.seriNo : yeniSeriNo(urun);
    onKayitDegistir({ ...kayit, urun, seriNo });
  };

  return (
    <div className="ap-lisans-form-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>

      <header className="ap-lisans-form-baslik-band">
        <h3 className="ap-lisans-form-baslik-metin">Lisans Bilgileri</h3>
      </header>

      <div className="ap-lisans-form-alanlar">
        <label className="ap-lisans-form-alan ap-lisans-form-alan-tam">
          <span className="ap-lisans-form-etiket">Ürün Seçiniz</span>
          <select className={formSelectSinifi} value={kayit.urun} onChange={(e) => urunDegistir(e.target.value)}>
            <option value="">Seçiniz</option>
            {LISANS_URUNLERI.map((u) => (
              <option key={u.id} value={u.id}>
                {u.ad}
              </option>
            ))}
          </select>
        </label>

        <label className="ap-lisans-form-alan ap-lisans-form-alan-tam">
          <span className="ap-lisans-form-etiket">Seri No</span>
          <input type="text" className={formInputSinifi} value={kayit.seriNo} readOnly disabled />
        </label>

        <label className="ap-lisans-form-alan ap-lisans-form-alan-tam">
          <span className="ap-lisans-form-etiket">Kullanıcı Adı</span>
          <input
            type="text"
            className={formInputSinifi}
            value={kayit.kullaniciAdi}
            onChange={(e) => onKayitDegistir({ ...kayit, kullaniciAdi: e.target.value })}
          />
        </label>

        <div className="ap-lisans-form-ikili">
          <label className="ap-lisans-form-alan">
            <span className="ap-lisans-form-etiket">Parola</span>
            <input
              type="password"
              className={formInputSinifi}
              value={kayit.parola}
              onChange={(e) => onKayitDegistir({ ...kayit, parola: e.target.value })}
              autoComplete="off"
            />
          </label>
          <label className="ap-lisans-form-alan">
            <span className="ap-lisans-form-etiket">İşletme Kodu</span>
            <input
              type="text"
              className={formInputSinifi}
              value={kayit.isletmeKodu}
              onChange={(e) => onKayitDegistir({ ...kayit, isletmeKodu: e.target.value })}
            />
          </label>
        </div>

        <label className="ap-lisans-form-alan ap-lisans-form-alan-tam">
          <span className="ap-lisans-form-etiket">Lisans Anahtarı</span>
          <input
            type="text"
            className={formInputSinifi}
            value={kayit.lisansAnahtari}
            onChange={(e) => onKayitDegistir({ ...kayit, lisansAnahtari: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
