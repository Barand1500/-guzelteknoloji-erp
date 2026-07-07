import { AdminAnahtarDugme } from '@/admin/ortak/AdminFormBilesenleri';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { E_ARSIV_CARI_SECENEKLERI } from '@/admin/baslat-menusu/e-fatura-ayarlari/varsayilanVeri';
import type { EFaturaFirmaBilgileri, EFaturaUstAyarlar } from '@/admin/baslat-menusu/e-fatura-ayarlari/tipler';
import { useState } from 'react';

interface EFaturaFirmaPanelProps {
  ust: EFaturaUstAyarlar;
  firma: EFaturaFirmaBilgileri;
  onUstDegistir: (ust: EFaturaUstAyarlar) => void;
  onFirmaDegistir: (firma: EFaturaFirmaBilgileri) => void;
  onMukellefGuncelle: () => void;
}

export function EFaturaFirmaPanel({ ust, firma, onUstDegistir, onFirmaDegistir, onMukellefGuncelle }: EFaturaFirmaPanelProps) {
  const [okcGirdi, setOkcGirdi] = useState('');

  const firmaAlan = <K extends keyof EFaturaFirmaBilgileri>(alan: K, etiket: string, tip: 'text' | 'password' = 'text') => (
    <label className="ap-efatura-alan">
      <span className="ap-efatura-etiket">{etiket}</span>
      <input
        type={tip}
        className={formInputSinifi}
        value={String(firma[alan])}
        onChange={(e) => onFirmaDegistir({ ...firma, [alan]: e.target.value })}
      />
    </label>
  );

  const okcEkle = () => {
    const no = okcGirdi.trim();
    if (!no) return;
    if (firma.okcSeriNolari.includes(no)) return;
    onFirmaDegistir({ ...firma, okcSeriNolari: [...firma.okcSeriNolari, no] });
    setOkcGirdi('');
  };

  return (
    <div className="ap-efatura-firma-layout">
      <section className="ap-efatura-panel ap-efatura-panel-sol">
        <h3 className="ap-efatura-panel-baslik">Seri ve Anahtarlar</h3>
        <div className="ap-efatura-toggle-grup">
          <AdminAnahtarDugme acik={ust.fis} onDegistir={(v) => onUstDegistir({ ...ust, fis: v })} etiket="Fiş" />
          <AdminAnahtarDugme
            acik={ust.normalFatura}
            onDegistir={(v) => onUstDegistir({ ...ust, normalFatura: v })}
            etiket="Normal Fatura"
          />
          <AdminAnahtarDugme
            acik={ust.eAdisyonKapali}
            onDegistir={(v) => onUstDegistir({ ...ust, eAdisyonKapali: v })}
            etiket="E Adisyon Kapalı"
          />
          <AdminAnahtarDugme
            acik={ust.eFaturaOffline}
            onDegistir={(v) => onUstDegistir({ ...ust, eFaturaOffline: v })}
            etiket="E Fatura Offline"
          />
          <AdminAnahtarDugme
            acik={ust.eFaturaServisSaglayiciDiger}
            onDegistir={(v) => onUstDegistir({ ...ust, eFaturaServisSaglayiciDiger: v })}
            etiket="E Fatura Servis Sağlayıcı DİĞER"
          />
        </div>
        <div className="ap-efatura-form-grid">
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">E Fatura Seri</span>
            <input
              type="text"
              className={formInputSinifi}
              value={ust.eFaturaSeri}
              onChange={(e) => onUstDegistir({ ...ust, eFaturaSeri: e.target.value })}
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">E Arşiv Seri</span>
            <input
              type="text"
              className={formInputSinifi}
              value={ust.eArsivSeri}
              onChange={(e) => onUstDegistir({ ...ust, eArsivSeri: e.target.value })}
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">E Adisyon Seri</span>
            <input
              type="text"
              className={formInputSinifi}
              value={ust.eAdisyonSeri}
              onChange={(e) => onUstDegistir({ ...ust, eAdisyonSeri: e.target.value })}
            />
          </label>
          <label className="ap-efatura-alan">
            <span className="ap-efatura-etiket">Geçiş Tarihi</span>
            <input
              type="date"
              className={formInputSinifi}
              value={ust.gecisTarihi}
              onChange={(e) => onUstDegistir({ ...ust, gecisTarihi: e.target.value })}
            />
          </label>
        </div>
        <button type="button" className="ap-efatura-ikincil-btn" onClick={onMukellefGuncelle}>
          Mükellef Bilgilerini Güncelle
        </button>
      </section>

      <section className="ap-efatura-panel ap-efatura-panel-sag">
        <h3 className="ap-efatura-panel-baslik">Firma Bilgileri</h3>
        <div className="ap-efatura-form-grid">
          <label className="ap-efatura-alan ap-efatura-alan-tam">
            <span className="ap-efatura-etiket">E Arşiv Cari Seçimi</span>
            <FormAcilirSecim
              aria-label="E Arşiv cari seçimi"
              value={firma.eArsivCariSecimi}
              onChange={(v) => onFirmaDegistir({ ...firma, eArsivCariSecimi: v })}
              secenekler={E_ARSIV_CARI_SECENEKLERI}
            />
          </label>
          {firmaAlan('firmaAdi', 'Firma Adı')}
          {firmaAlan('yetkiliAdi', 'Yetkili Adı')}
          {firmaAlan('yetkiliSoyadi', 'Yetkili Soyadı')}
          {firmaAlan('vergiDairesi', 'Vergi Dairesi')}
          {firmaAlan('vergiNumarasi', 'Vergi Numarası')}
          {firmaAlan('ticaretSicilNo', 'Ticaret Sicil No')}
          {firmaAlan('mersisNo', 'Mersis No')}
          {firmaAlan('donemYili', 'Dönem Yılı')}
          {firmaAlan('musteriKodu', 'Müşteri Kodu')}
          {firmaAlan('portalKullaniciAdi', 'Portal Kullanıcı Adı')}
          {firmaAlan('portalKullaniciParola', 'Portal Kullanıcı Parola', 'password')}
          {firmaAlan('gondericiBirimEposta', 'Gönderici Birim Eposta')}
          {firmaAlan('sehir', 'Şehir')}
          {firmaAlan('mahalle', 'Mahalle')}
          {firmaAlan('cadde', 'Cadde')}
          {firmaAlan('apartmanNo', 'Apartman No')}
          {firmaAlan('daire', 'Daire')}
        </div>

        <div className="ap-efatura-okc-bolum">
          <h4 className="ap-efatura-alt-baslik">ÖKC Seri Nolar</h4>
          <div className="ap-efatura-okc-layout">
            <textarea
              className={`${formInputSinifi} ap-efatura-okc-liste`}
              readOnly
              value={firma.okcSeriNolari.join('\n')}
              placeholder="ÖKC seri numarası yok"
            />
            <div className="ap-efatura-okc-ekle">
              <label className="ap-efatura-alan">
                <span className="ap-efatura-etiket">ÖKC Seri No</span>
                <input
                  type="text"
                  className={formInputSinifi}
                  value={okcGirdi}
                  onChange={(e) => setOkcGirdi(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), okcEkle())}
                />
              </label>
              <button type="button" className="ap-efatura-ikincil-btn" onClick={okcEkle}>
                ÖKC Seri No Ekle
              </button>
            </div>
          </div>
        </div>

        <p className="ap-efatura-not">
          E Arşiv fatura keserken bir cari seçilmemiş ise yukarıda belirtilen cari kullanılacaktır.
        </p>
      </section>
    </div>
  );
}
