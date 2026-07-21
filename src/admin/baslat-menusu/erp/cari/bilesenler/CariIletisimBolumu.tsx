import type { CariIletisimKisi } from '../tipler';
import { bosIletisimKisi, iletisimKisiBosMu } from '../cariIletisimDeposu';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { CariOutlinedEposta } from './CariOutlinedEposta';
import { CariOutlinedGirdi } from './CariOutlinedGirdi';
import { CariOutlinedTelefon } from './CariOutlinedTelefon';

export function CariIletisimBolumu({
  kisiler,
  varsayilanIl,
  varsayilanIlce,
  disabled,
  onChange,
}: {
  kisiler: CariIletisimKisi[];
  varsayilanIl: string;
  varsayilanIlce: string;
  disabled?: boolean;
  onChange: (kisiler: CariIletisimKisi[]) => void;
}) {
  const bosFormVar = kisiler.some((k) => iletisimKisiBosMu(k));

  const kisiGuncelle = (id: string, parca: Partial<CariIletisimKisi>) => {
    onChange(kisiler.map((k) => (k.id === id ? { ...k, ...parca } : k)));
  };

  const kisiSil = (id: string) => {
    onChange(kisiler.filter((k) => k.id !== id));
  };

  const kisiEkle = () => {
    if (bosFormVar) return;
    onChange([bosIletisimKisi(varsayilanIl, varsayilanIlce), ...kisiler]);
  };

  return (
    <section className="cari-iletisim-bolumu">
      <div className="cari-iletisim-baslik-satir">
        <h3 className="cari-iletisim-baslik">Adres / İletişim</h3>
        {!disabled ? (
          <button
            type="button"
            className="cari-iletisim-ekle"
            onClick={kisiEkle}
            disabled={bosFormVar}
            title={bosFormVar ? 'Önce boş formu doldurun' : 'Kişi ekle'}
          >
            +
          </button>
        ) : null}
      </div>

      {kisiler.length === 0 ? (
        <p className="cari-iletisim-bos-metin">
          İletişim kişisi eklemek için + butonuna tıklayın.
        </p>
      ) : (
        <div className="cari-iletisim-liste">
          {kisiler.map((kisi, index) => (
            <article key={kisi.id} className="cari-iletisim-kart">
              {!disabled || kisiler.length > 1 ? (
                <div className="cari-iletisim-kart-ust">
                  <span className="cari-iletisim-kart-etiket">
                    {kisiler.length > 1 ? `İletişim ${kisiler.length - index}` : 'İletişim Kişisi'}
                  </span>
                  {!disabled ? (
                    <button
                      type="button"
                      className="cari-iletisim-kart-sil"
                      onClick={() => kisiSil(kisi.id)}
                      aria-label="İletişim kişisini sil"
                      title="Sil"
                    >
                      <DgIkon ad="sil" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="cari-iletisim-kart-grid">
                <CariOutlinedGirdi
                  etiket="Ad Soyad"
                  deger={kisi.adSoyad}
                  maxLength={120}
                  odakPlaceholder="Ad ve soyad"
                  disabled={disabled}
                  onChange={(adSoyad) => kisiGuncelle(kisi.id, { adSoyad })}
                />
                <CariOutlinedGirdi
                  etiket="Görevi"
                  deger={kisi.gorevi}
                  maxLength={80}
                  odakPlaceholder="Görevi"
                  disabled={disabled}
                  onChange={(gorevi) => kisiGuncelle(kisi.id, { gorevi })}
                />
                <CariOutlinedEposta
                  deger={kisi.eposta}
                  disabled={disabled}
                  onChange={(eposta) => kisiGuncelle(kisi.id, { eposta })}
                />
                <CariOutlinedTelefon
                  deger={kisi.telefon}
                  disabled={disabled}
                  onChange={(telefon) => kisiGuncelle(kisi.id, { telefon })}
                />
                <CariOutlinedGirdi
                  etiket="İl"
                  deger={kisi.il}
                  maxLength={40}
                  odakPlaceholder="İl yazınız"
                  disabled={disabled}
                  onChange={(il) => kisiGuncelle(kisi.id, { il })}
                />
                <CariOutlinedGirdi
                  etiket="İlçe"
                  deger={kisi.ilce}
                  maxLength={40}
                  odakPlaceholder="İlçe yazınız"
                  disabled={disabled}
                  onChange={(ilce) => kisiGuncelle(kisi.id, { ilce })}
                />
                <CariOutlinedGirdi
                  etiket="Adres"
                  deger={kisi.adres}
                  className="cari-alan-tam"
                  maxLength={500}
                  odakPlaceholder="Adres bilgisi"
                  disabled={disabled}
                  onChange={(adres) => kisiGuncelle(kisi.id, { adres })}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
