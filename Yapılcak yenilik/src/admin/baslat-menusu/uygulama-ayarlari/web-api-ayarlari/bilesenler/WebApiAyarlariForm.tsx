import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { WebApiKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/tipler';

interface WebApiAyarlariFormProps {
  kayit: WebApiKayit;
  onKayitDegistir: (kayit: WebApiKayit) => void;
}

function metinAlani(etiket: string, deger: string, onChange: (v: string) => void) {
  return (
    <label className="ap-web-api-alan">
      <span className="ap-web-api-etiket">{etiket}</span>
      <input
        type="text"
        className={formInputSinifi}
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="on"
      />
    </label>
  );
}

function secenek(
  etiket: string,
  aciklama: string,
  acik: boolean,
  onDegistir: (v: boolean) => void
) {
  return (
    <label className="ap-web-api-secenek">
      <input
        type="checkbox"
        className="ap-tartilacak-checkbox"
        checked={acik}
        onChange={(e) => onDegistir(e.target.checked)}
      />
      <span className="ap-web-api-secenek-metin">
        <strong>{etiket}</strong>
        <span className="ap-web-api-secenek-aciklama">{aciklama}</span>
      </span>
    </label>
  );
}

export function WebApiAyarlariForm({ kayit, onKayitDegistir }: WebApiAyarlariFormProps) {
  const [parolaGoster, setParolaGoster] = useState(false);
  const guncelle = (parcalar: Partial<WebApiKayit>) => onKayitDegistir({ ...kayit, ...parcalar });

  return (
    <div className="ap-web-api-form">
      <header className="ap-web-api-baslik">
        <span className="ap-web-api-baslik-ikon" aria-hidden>
          🌐
        </span>
        <div>
          <h2 className="ap-web-api-baslik-metin">Web Api Ayarları</h2>
          <p className="ap-web-api-baslik-alt">Veritabanı, API adresleri ve entegrasyon seçeneklerini yapılandırın</p>
        </div>
      </header>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">Veritabanı Bağlantısı</h3>
        <div className="ap-web-api-alanlar">
          <div className="ap-web-api-satir">
            {metinAlani('Sunucu IP', kayit.sunucuIp, (v) => guncelle({ sunucuIp: v }))}
            {metinAlani('Veritabanı Adı', kayit.veritabaniAdi, (v) => guncelle({ veritabaniAdi: v }))}
          </div>
          <div className="ap-web-api-satir">
            {metinAlani('Kullanıcı Adı', kayit.kullaniciAdi, (v) => guncelle({ kullaniciAdi: v }))}
            <label className="ap-web-api-alan">
              <span className="ap-web-api-etiket">Kullanıcı Parola</span>
              <div className="ap-web-api-parola-sarmal">
                <input
                  type={parolaGoster ? 'text' : 'password'}
                  className={formInputSinifi}
                  value={kayit.kullaniciParola}
                  onChange={(e) => guncelle({ kullaniciParola: e.target.value })}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="ap-web-api-maymun-btn"
                  onClick={() => setParolaGoster((g) => !g)}
                  aria-label={parolaGoster ? 'Parolayı gizle' : 'Parolayı göster'}
                  aria-pressed={parolaGoster}
                  title={parolaGoster ? 'Parolayı gizle' : 'Parolayı göster'}
                >
                  {parolaGoster ? '🐵' : '🙈'}
                </button>
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">API Adresleri</h3>
        <div className="ap-web-api-alanlar">
          <div className="ap-web-api-satir">
            {metinAlani('Token URL', kayit.tokenUrl, (v) => guncelle({ tokenUrl: v }))}
            {metinAlani('Servis URL', kayit.servisUrl, (v) => guncelle({ servisUrl: v }))}
          </div>
          <div className="ap-web-api-satir ap-web-api-satir-tek">
            {metinAlani('vePosDB Adı', kayit.vePosDbAdi, (v) => guncelle({ vePosDbAdi: v }))}
          </div>
        </div>
      </section>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">Seçenekler</h3>
        <div className="ap-web-api-secenekler">
          {secenek(
            'Daily Bill Number With Date Prefix',
            'Fatura numarasına tarih öneki ekler.',
            kayit.dailyBillNumberWithDatePrefix,
            (v) => guncelle({ dailyBillNumberWithDatePrefix: v })
          )}
          {secenek(
            'Telsam Calls',
            'Telsam çağrı entegrasyonunu etkinleştirir.',
            kayit.telsamCalls,
            (v) => guncelle({ telsamCalls: v })
          )}
          {secenek(
            'Transfer Use Matching',
            'Seçili ise Yemeksepeti vb. eşleştirme kullanır; seçili değilse direkt aktarılır.',
            kayit.transferUseMatching,
            (v) => guncelle({ transferUseMatching: v })
          )}
          {secenek(
            'Transfer Options',
            'Seçili ise seçenekleri integrationoption tablosuna göre aktarır; seçili değilse aktarım yapmaz, açıklama kısmına yazar.',
            kayit.transferOptions,
            (v) => guncelle({ transferOptions: v })
          )}
        </div>
      </section>
    </div>
  );
}
