import { useCallback, useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import {
  SMS_SABLON_DEGISKENLERI,
  type TanimlarSmsAyarlariForm,
} from '@/admin/baslat-menusu/tanimlar/sms-ayarlari/tipler';
import {
  tanimlarSmsAyarlariFormEsit,
  tanimlarSmsAyarlariKaydet,
  tanimlarSmsAyarlariOku,
} from '@/admin/baslat-menusu/tanimlar/sms-ayarlari/yardimci';

interface TanimlarSmsAyarlariSekmeProps {
  onKirliDegisti?: (kirli: boolean) => void;
}

export function TanimlarSmsAyarlariSekme({ onKirliDegisti }: TanimlarSmsAyarlariSekmeProps) {
  const [form, setForm] = useState<TanimlarSmsAyarlariForm>(() => tanimlarSmsAyarlariOku());
  const [sonKayitliForm, setSonKayitliForm] = useState<TanimlarSmsAyarlariForm>(() => tanimlarSmsAyarlariOku());
  const [kaydedildi, setKaydedildi] = useState(false);
  const [parolaGoster, setParolaGoster] = useState(false);

  const kirli = !tanimlarSmsAyarlariFormEsit(form, sonKayitliForm);
  const aktif = form.smsGonder;

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const onKaydet = useCallback(() => {
    tanimlarSmsAyarlariKaydet(form);
    setSonKayitliForm(form);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2500);
  }, [form]);

  useModulAksiyonlari(
    { kaydet: onKaydet },
    {
      kaydet: true,
      ekle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    }
  );

  const alanGuncelle = <K extends keyof TanimlarSmsAyarlariForm>(alan: K, deger: TanimlarSmsAyarlariForm[K]) => {
    setForm((f) => ({ ...f, [alan]: deger }));
  };

  return (
    <div className="ap-tanimlar-sms">
      {kaydedildi ? (
        <div className="ap-tanimlar-kayit-basarili" role="status">
          SMS ayarları kaydedildi.
        </div>
      ) : null}

      <label className="ap-tanimlar-sms-ana-checkbox">
        <input
          type="checkbox"
          checked={form.smsGonder}
          onChange={(e) => alanGuncelle('smsGonder', e.target.checked)}
        />
        <span>Sms Gönder</span>
      </label>

      <div className={`ap-tanimlar-sms-icerik${aktif ? '' : ' ap-tanimlar-sms-icerik-pasif'}`}>
        <div className="ap-tanimlar-sms-alanlar">
          <div className="ap-tanimlar-sms-alan">
            <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase" htmlFor="sms-mesaj-basligi">
              Mesaj Başlığı (Gönderen Kimliği)
            </label>
            <input
              id="sms-mesaj-basligi"
              type="text"
              className={formInputSinifi}
              value={form.mesajBasligi}
              onChange={(e) => alanGuncelle('mesajBasligi', e.target.value)}
              disabled={!aktif}
            />
          </div>

          <div className="ap-tanimlar-sms-alan">
            <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase" htmlFor="sms-kullanici-adi">
              Kullanıcı Adı
            </label>
            <input
              id="sms-kullanici-adi"
              type="text"
              className={formInputSinifi}
              value={form.kullaniciAdi}
              onChange={(e) => alanGuncelle('kullaniciAdi', e.target.value)}
              disabled={!aktif}
              autoComplete="off"
            />
          </div>

          <div className="ap-tanimlar-sms-alan">
            <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase" htmlFor="sms-parola">
              Parola
            </label>
            <div className="ap-tanimlar-sifre-sarmal">
              <input
                id="sms-parola"
                type={parolaGoster ? 'text' : 'password'}
                className={formInputSinifi}
                value={form.parola}
                onChange={(e) => alanGuncelle('parola', e.target.value)}
                disabled={!aktif}
                autoComplete="off"
              />
              <button
                type="button"
                className="ap-tanimlar-sifre-goz"
                onClick={() => setParolaGoster((g) => !g)}
                disabled={!aktif}
                aria-label={parolaGoster ? 'Parolayı gizle' : 'Parolayı göster'}
                aria-pressed={parolaGoster}
              >
                {parolaGoster ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-2.05 3.17M6.61 6.61A11.8 11.8 0 0 0 1 12.5C2.73 16.39 7 19.5 12 19.5a10.9 10.9 0 0 0 4.12-.79" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M2 12.5C3.73 8.61 8 5.5 12 5.5s8.27 3.11 10 7.5c-1.73 3.89-6 7-10 7S3.73 16.39 2 12.5z" />
                    <circle cx="12" cy="12.5" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="ap-tanimlar-sms-sablon-bolum">
            <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase" htmlFor="sms-sablonu">
              Sms Şablonu
            </label>
            <div className="ap-tanimlar-sms-sablon-izgara">
              <textarea
                id="sms-sablonu"
                className="ap-tanimlar-sms-sablon-textarea"
                rows={8}
                value={form.smsSablonu}
                onChange={(e) => alanGuncelle('smsSablonu', e.target.value)}
                disabled={!aktif}
                spellCheck={false}
              />

              <aside className="ap-tanimlar-sms-sablon-rehber" aria-label="Şablon değişkenleri">
                <ul className="ap-tanimlar-sms-degisken-liste">
                  {SMS_SABLON_DEGISKENLERI.map((d) => (
                    <li key={d.kod}>
                      <code>{d.kod}</code>
                      <span>{d.aciklama}</span>
                    </li>
                  ))}
                </ul>
                <p className="ap-tanimlar-sms-sablon-not">
                  Not: Kullanılmayacak alan var ise kaldırmak yeterlidir.
                </p>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
