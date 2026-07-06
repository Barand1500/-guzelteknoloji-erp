import { AdminAnahtarDugme } from '@/admin/ortak/AdminFormBilesenleri';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { EFaturaOtomatikServis, EFaturaServisAyarlari } from '@/admin/baslat-menusu/e-fatura-ayarlari/tipler';

interface EFaturaServisPanelProps {
  servis: EFaturaServisAyarlari;
  onServisDegistir: (servis: EFaturaServisAyarlari) => void;
  onVeritabaniKur: () => void;
}

function OtomatikServisKarti({
  baslik,
  aciklama,
  servis,
  guncelleEtiket,
  onDegistir,
  onGuncelle,
}: {
  baslik: string;
  aciklama: string;
  servis: EFaturaOtomatikServis;
  guncelleEtiket: string;
  onDegistir: (s: EFaturaOtomatikServis) => void;
  onGuncelle: () => void;
}) {
  return (
    <section className="ap-efatura-servis-kart">
      <h3 className="ap-efatura-panel-baslik">{baslik}</h3>
      <p className="ap-efatura-servis-aciklama">{aciklama}</p>
      <div className="ap-efatura-servis-durum">
        <AdminAnahtarDugme
          acik={servis.aktif}
          onDegistir={(v) => onDegistir({ ...servis, aktif: v })}
          etiket={servis.aktif ? 'Otomatik Gönderme Aktif' : 'Otomatik Gönderme Devre Dışı'}
        />
      </div>
      <div className="ap-efatura-servis-saat">
        <label className="ap-efatura-alan">
          <span className="ap-efatura-etiket">Saat</span>
          <input
            type="number"
            min={0}
            max={23}
            className={formInputSinifi}
            value={servis.saat}
            onChange={(e) => onDegistir({ ...servis, saat: e.target.value })}
          />
        </label>
        <label className="ap-efatura-alan">
          <span className="ap-efatura-etiket">Dakika</span>
          <input
            type="number"
            min={0}
            max={59}
            className={formInputSinifi}
            value={servis.dakika}
            onChange={(e) => onDegistir({ ...servis, dakika: e.target.value })}
          />
        </label>
      </div>
      <button type="button" className="ap-efatura-ikincil-btn" onClick={onGuncelle}>
        {guncelleEtiket}
      </button>
    </section>
  );
}

export function EFaturaServisPanel({ servis, onServisDegistir, onVeritabaniKur }: EFaturaServisPanelProps) {
  const sunucu = servis.sunucu;

  return (
    <div className="ap-efatura-servis-layout">
      <section className="ap-efatura-panel ap-efatura-servis-sunucu">
        <h3 className="ap-efatura-panel-baslik">Sunucu Bilgileri</h3>
        <div className="ap-efatura-form-grid">
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">SQL Server Adı</span>
            <input
              type="text"
              className={formInputSinifi}
              value={sunucu.sqlServerAdi}
              onChange={(e) =>
                onServisDegistir({ ...servis, sunucu: { ...sunucu, sqlServerAdi: e.target.value } })
              }
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">Katalog Adı</span>
            <input
              type="text"
              className={formInputSinifi}
              value={sunucu.katalogAdi}
              onChange={(e) =>
                onServisDegistir({ ...servis, sunucu: { ...sunucu, katalogAdi: e.target.value } })
              }
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">Kullanıcı Adı</span>
            <input
              type="text"
              className={formInputSinifi}
              value={sunucu.kullaniciAdi}
              onChange={(e) =>
                onServisDegistir({ ...servis, sunucu: { ...sunucu, kullaniciAdi: e.target.value } })
              }
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">Parola</span>
            <input
              type="password"
              className={formInputSinifi}
              value={sunucu.parola}
              onChange={(e) => onServisDegistir({ ...servis, sunucu: { ...sunucu, parola: e.target.value } })}
            />
          </label>
          <label className="ap-efatura-alan ap-efatura-alan-tam">
            <span className="ap-efatura-etiket">E Fatura Servis Adresi</span>
            <input
              type="text"
              className={formInputSinifi}
              value={sunucu.eFaturaServisAdresi}
              onChange={(e) =>
                onServisDegistir({ ...servis, sunucu: { ...sunucu, eFaturaServisAdresi: e.target.value } })
              }
            />
          </label>
        </div>
        <div className="ap-efatura-servis-sunucu-btns">
          <button type="button" className="ap-efatura-ikincil-btn" onClick={onVeritabaniKur}>
            E Fatura Veri Tabanı Kur
          </button>
        </div>
      </section>

      <div className="ap-efatura-servis-yan">
        <OtomatikServisKarti
          baslik="E Fatura Servisi"
          aciklama="Hergün otomatik fatura gönderen servisi açan/kapatan metoddur."
          servis={servis.eFaturaServisi}
          guncelleEtiket="Otomatik Fatura Gönderme Servisini Güncelle"
          onDegistir={(s) => onServisDegistir({ ...servis, eFaturaServisi: s })}
          onGuncelle={() => {}}
        />
        <OtomatikServisKarti
          baslik="E Adisyon Servisi"
          aciklama="Hergün otomatik adisyon gönderen servisi açan/kapatan metoddur."
          servis={servis.eAdisyonServisi}
          guncelleEtiket="Otomatik Adisyon Gönderme Servisini Güncelle"
          onDegistir={(s) => onServisDegistir({ ...servis, eAdisyonServisi: s })}
          onGuncelle={() => {}}
        />
      </div>
    </div>
  );
}
