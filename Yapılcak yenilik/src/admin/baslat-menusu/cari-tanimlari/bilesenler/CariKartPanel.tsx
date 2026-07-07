import { formInputSinifi } from '@/formlar/FormAlani';
import { IskontoIfadeAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { CariTanim } from '@/admin/baslat-menusu/cari-tanimlari/tipler';

interface CariKartPanelProps {
  cari: CariTanim;
  onCariDegistir: (cari: CariTanim) => void;
  onGeri: () => void;
  onGeciciIslem: (mesaj: string) => void;
}

function alanGuncelle(cari: CariTanim, alan: keyof CariTanim, deger: string | boolean): CariTanim {
  return { ...cari, [alan]: deger };
}

export function CariKartPanel({ cari, onCariDegistir, onGeri, onGeciciIslem }: CariKartPanelProps) {
  const kodAdTelefon = `${cari.kod} - ${cari.ad || 'Yeni'} / ${cari.telefon}`;

  return (
    <div className="ap-cari-kart-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>

      <section className="ap-cari-kart-bolum">
        <h3 className="ap-cari-kart-bolum-baslik">Müşteri Bilgileri</h3>
        <div className="ap-cari-kart-form">
          <label className="ap-cari-kart-alan ap-cari-kart-alan-tam">
            <span className="ap-cari-kart-etiket">Kod - Ad / Telefon</span>
            <input
              type="text"
              className={`${formInputSinifi} ap-cari-kart-vurgu`}
              value={kodAdTelefon}
              readOnly
            />
          </label>

          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Ad</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.ad}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'ad', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Telefon</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.telefon}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'telefon', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan ap-cari-kart-alan-tam">
            <span className="ap-cari-kart-etiket">Ünvan</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.unvan}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'unvan', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Vergi No</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.vergiNo}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'vergiNo', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Vergi Dairesi</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.vergiDairesi}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'vergiDairesi', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Kart No</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.kartNo}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'kartNo', e.target.value))}
            />
          </label>
          <div className="ap-cari-kart-alan">
            <IskontoIfadeAlani
              etiket="İskonto Oranı"
              deger={cari.iskontoOrani}
              onDegistir={(v) => onCariDegistir(alanGuncelle(cari, 'iskontoOrani', v))}
            />
          </div>

          <label className="ap-cari-kart-alan ap-cari-kart-alan-2">
            <span className="ap-cari-kart-etiket">Adres</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.adres}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'adres', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">İlçe</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.ilce}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'ilce', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">İl</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.il}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'il', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Kategori</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.kategori}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'kategori', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Ticari Sicil No</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.ticariSicilNo}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'ticariSicilNo', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Fatura Adı</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.faturaAdi}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'faturaAdi', e.target.value))}
            />
          </label>
          <label className="ap-cari-kart-alan">
            <span className="ap-cari-kart-etiket">Fatura Soyadı</span>
            <input
              type="text"
              className={formInputSinifi}
              value={cari.faturaSoyadi}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'faturaSoyadi', e.target.value))}
            />
          </label>

          <label className="ap-cari-kart-alan ap-cari-kart-alan-tam">
            <span className="ap-cari-kart-etiket">E Posta</span>
            <input
              type="email"
              className={formInputSinifi}
              value={cari.eposta}
              onChange={(e) => onCariDegistir(alanGuncelle(cari, 'eposta', e.target.value))}
            />
          </label>
        </div>
      </section>

      <div className="ap-cari-kart-orta">
        <section className="ap-cari-kart-tablo-bolum">
          <h4 className="ap-cari-kart-tablo-baslik">Detay</h4>
          <div className="ap-cari-kart-tablo-scroll">
            <table className="ap-cari-kart-tablo">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Masa</th>
                  <th>İşlem</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="ap-cari-kart-tablo-bos">
                    Henüz işlem kaydı yok.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="ap-cari-kart-tablo-bolum ap-cari-kart-tablo-bolum-genis">
          <h4 className="ap-cari-kart-tablo-baslik">Ödemeler</h4>
          <div className="ap-cari-kart-tablo-scroll">
            <table className="ap-cari-kart-tablo">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Tarih</th>
                  <th>Nakit</th>
                  <th>Kredi K.</th>
                  <th>Y.Çeki</th>
                  <th>İndirim</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="ap-cari-kart-tablo-bos">
                    Henüz ödeme kaydı yok.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="ap-cari-kart-alt">
        <section className="ap-cari-kart-adisyon-bolum">
          <h4 className="ap-cari-kart-tablo-baslik">Adisyon Detayı</h4>
          <div className="ap-cari-kart-tablo-scroll ap-cari-kart-tablo-scroll-kisa">
            <table className="ap-cari-kart-tablo">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Miktar</th>
                  <th>Fiyat</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="ap-cari-kart-tablo-bos">
                    Açık adisyon yok.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="ap-cari-kart-adisyon-alt">
            <button type="button" className="ap-cari-kart-yazdir-btn" onClick={() => onGeciciIslem('Yazdırma yakında.')}>
              Yazdır
            </button>
            <div className="ap-cari-kart-adisyon-checkboxlar">
              <label className="ap-cari-kart-checkbox">
                <input
                  type="checkbox"
                  checked={cari.normalFaturaKullanicisi}
                  onChange={(e) => onCariDegistir(alanGuncelle(cari, 'normalFaturaKullanicisi', e.target.checked))}
                />
                <span>Normal Fatura Kullanıcısı</span>
              </label>
              <label className="ap-cari-kart-checkbox">
                <input
                  type="checkbox"
                  checked={cari.kdvTevkifati}
                  onChange={(e) => onCariDegistir(alanGuncelle(cari, 'kdvTevkifati', e.target.checked))}
                />
                <span>KDV Tevkifatı</span>
              </label>
            </div>
          </div>
        </section>

        <section className="ap-cari-kart-odeme">
          <h4 className="ap-cari-kart-tablo-baslik">Ödeme</h4>
          <div className="ap-cari-kart-odeme-ozet">
            <div>
              <span>Toplam Borç</span>
              <strong>0,00</strong>
            </div>
            <div>
              <span>Toplam Ödeme</span>
              <strong>0,00</strong>
            </div>
            <div className="ap-cari-kart-bakiye">
              <span>Bakiye</span>
              <strong>0,00</strong>
            </div>
            <div className="ap-cari-kart-acik-masa">
              <span>Açık Masa</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Kredi</span>
              <strong>0,00</strong>
            </div>
          </div>
          <div className="ap-cari-kart-odeme-girdiler">
            <label>
              <span>Nakit</span>
              <input type="text" className={formInputSinifi} defaultValue="0" />
            </label>
            <label>
              <span>K.K.</span>
              <input type="text" className={formInputSinifi} defaultValue="0" />
            </label>
            <label>
              <span>Y. Çeki</span>
              <input type="text" className={formInputSinifi} defaultValue="0" />
            </label>
            <label>
              <span>İndirim</span>
              <input type="text" className={formInputSinifi} defaultValue="0" />
            </label>
            <label className="ap-cari-kart-not">
              <span>Not</span>
              <input type="text" className={formInputSinifi} />
            </label>
          </div>
          <label className="ap-cari-kart-checkbox">
            <input type="checkbox" />
            <span>Yazar Kasa Avans Kullan</span>
          </label>
          <div className="ap-cari-kart-odeme-aksiyonlar">
            <button type="button" className="ap-cari-kart-odeme-btn" onClick={() => onGeciciIslem('Puan ekranı yakında.')}>
              Puan
            </button>
            <button
              type="button"
              className="ap-cari-kart-odeme-btn"
              onClick={() => onGeciciIslem('Ödeme fişi yazdırma yakında.')}
            >
              Ödeme Fişi Yazdır
            </button>
            <button
              type="button"
              className="ap-cari-kart-odeme-btn"
              onClick={() => onGeciciIslem('Müşteri kartı yazdırma yakında.')}
            >
              Müşteri Kartını Yazdır
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
