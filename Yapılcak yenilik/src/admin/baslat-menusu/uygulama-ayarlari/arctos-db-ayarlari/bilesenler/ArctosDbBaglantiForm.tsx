import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { ArctosDbKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/tipler';

interface ArctosDbBaglantiFormProps {
  kayit: ArctosDbKayit;
  onKayitDegistir: (kayit: ArctosDbKayit) => void;
}

export function ArctosDbBaglantiForm({ kayit, onKayitDegistir }: ArctosDbBaglantiFormProps) {
  const [parolaGoster, setParolaGoster] = useState(false);

  const alan = (alanAdi: keyof ArctosDbKayit, etiket: string, tip: 'text' | 'password' = 'text') => (
    <label className="ap-arctos-db-alan">
      <span className="ap-arctos-db-etiket">{etiket}</span>
      <input
        type={tip}
        className={formInputSinifi}
        value={kayit[alanAdi]}
        onChange={(e) => onKayitDegistir({ ...kayit, [alanAdi]: e.target.value })}
        autoComplete={tip === 'password' ? 'off' : 'on'}
      />
    </label>
  );

  return (
    <div className="ap-arctos-db-form">
      <header className="ap-arctos-db-baslik">
        <span className="ap-arctos-db-baslik-ikon" aria-hidden>
          🗄️
        </span>
        <div>
          <h2 className="ap-arctos-db-baslik-metin">Arctos Veritabanı Bağlantı Ayarları</h2>
          <p className="ap-arctos-db-baslik-alt">Sunucu ve kimlik bilgilerini girerek Arctos veritabanına bağlanın</p>
        </div>
      </header>

      <div className="ap-arctos-db-alanlar">
        <div className="ap-arctos-db-satir">
          {alan('sunucu', 'Sunucu')}
          {alan('veritabani', 'Veritabanı')}
        </div>
        <div className="ap-arctos-db-satir">
          {alan('kullaniciAdi', 'Kullanıcı Adı')}
          <label className="ap-arctos-db-alan">
            <span className="ap-arctos-db-etiket">Kullanıcı Parola</span>
            <div className="ap-arctos-db-parola-sarmal">
              <input
                type={parolaGoster ? 'text' : 'password'}
                className={formInputSinifi}
                value={kayit.kullaniciParola}
                onChange={(e) => onKayitDegistir({ ...kayit, kullaniciParola: e.target.value })}
                autoComplete="off"
              />
              <button
                type="button"
                className="ap-arctos-db-maymun-btn"
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
    </div>
  );
}
