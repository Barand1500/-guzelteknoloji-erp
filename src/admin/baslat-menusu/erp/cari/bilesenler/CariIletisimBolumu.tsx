import { useState } from 'react';
import type { CariIletisimKisi } from '../tipler';
import { bosIletisimKisi, iletisimKisiBosMu } from '../cariIletisimDeposu';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { CariOutlinedEposta } from './CariOutlinedEposta';
import { CariOutlinedGirdi } from './CariOutlinedGirdi';
import { CariOutlinedIl, CariOutlinedIlce } from './CariOutlinedIlArama';
import { CariOutlinedTelefon } from './CariOutlinedTelefon';

function kisiSilMetni(kisi: CariIletisimKisi): string {
  const baslik = kisi.adresBasligi.trim();
  return baslik || 'Adsız adres başlığı';
}

export function CariIletisimBolumu({
  kisiler,
  efaturaAlias,
  eirsaliyeAlias,
  varsayilanAdres,
  varsayilanIl,
  varsayilanIlce,
  disabled,
  onChange,
  onEfaturaAliasChange,
  onEirsaliyeAliasChange,
}: {
  kisiler: CariIletisimKisi[];
  efaturaAlias: string;
  eirsaliyeAlias: string;
  varsayilanAdres: string;
  varsayilanIl: string;
  varsayilanIlce: string;
  disabled?: boolean;
  onChange: (kisiler: CariIletisimKisi[]) => void;
  onEfaturaAliasChange: (alias: string) => void;
  onEirsaliyeAliasChange: (alias: string) => void;
}) {
  const [adresCekildi, setAdresCekildi] = useState<Record<string, true>>({});
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const bosFormVar = kisiler.some((k) => iletisimKisiBosMu(k));
  const ustAdres = varsayilanAdres.trim();
  const silinecek = silinecekId ? kisiler.find((k) => k.id === silinecekId) : undefined;

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

  const adresiCek = (id: string) => {
    if (!ustAdres) return;
    kisiGuncelle(id, { adres: ustAdres.slice(0, 500) });
    setAdresCekildi((onceki) => ({ ...onceki, [id]: true }));
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
            aria-label="İletişim kişisi ekle"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {kisiler.length > 0 ? (
        <div className="cari-iletisim-liste">
          {kisiler.map((kisi, index) => {
            const cekGoster = !disabled && !!ustAdres && !adresCekildi[kisi.id];

            return (
              <article key={kisi.id} className="cari-iletisim-kart">
                {!disabled ? (
                  <button
                    type="button"
                    className="cari-iletisim-kart-sil"
                    onClick={() => setSilinecekId(kisi.id)}
                    aria-label="İletişim kişisini sil"
                    title="Sil"
                  >
                    <DgIkon ad="sil" />
                  </button>
                ) : null}

                <div className="cari-iletisim-kart-grid">
                  <CariOutlinedGirdi
                    etiket="Adres Başlığı"
                    deger={kisi.adresBasligi}
                    className="cari-alan-tam"
                    maxLength={80}
                    odakPlaceholder="Merkez, Şube, Depo…"
                    disabled={disabled}
                    onChange={(adresBasligi) => kisiGuncelle(kisi.id, { adresBasligi })}
                  />
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
                  <CariOutlinedTelefon
                    deger={kisi.telefon}
                    disabled={disabled}
                    onChange={(telefon) => kisiGuncelle(kisi.id, { telefon })}
                  />
                  <CariOutlinedEposta
                    deger={kisi.eposta}
                    disabled={disabled}
                    onChange={(eposta) => kisiGuncelle(kisi.id, { eposta })}
                  />
                  <CariOutlinedGirdi
                    etiket="Adres"
                    deger={kisi.adres}
                    className="cari-alan-tam"
                    maxLength={500}
                    odakPlaceholder="Adres bilgisi"
                    disabled={disabled}
                    onChange={(adres) => kisiGuncelle(kisi.id, { adres })}
                    sonek={
                      cekGoster ? (
                        <button
                          type="button"
                          className="cari-adres-cek"
                          onClick={() => adresiCek(kisi.id)}
                          title="Üstteki cari adresini buraya aktar"
                        >
                          Çek
                        </button>
                      ) : null
                    }
                  />
                  <CariOutlinedIl
                    deger={kisi.il}
                    disabled={disabled}
                    onChange={(il) =>
                      kisiGuncelle(kisi.id, {
                        il,
                        ilce: il !== kisi.il ? '' : kisi.ilce,
                      })
                    }
                  />
                  <CariOutlinedIlce
                    deger={kisi.ilce}
                    il={kisi.il}
                    disabled={disabled}
                    onChange={(ilce) => kisiGuncelle(kisi.id, { ilce })}
                  />
                  {index === 0 ? (
                    <>
                      <CariOutlinedGirdi
                        etiket="E-Fatura Alias"
                        deger={efaturaAlias}
                        maxLength={200}
                        odakPlaceholder="Alias giriniz"
                        disabled={disabled}
                        onChange={onEfaturaAliasChange}
                      />
                      <CariOutlinedGirdi
                        etiket="E-İrsaliye Alias"
                        deger={eirsaliyeAlias}
                        maxLength={200}
                        odakPlaceholder="Alias giriniz"
                        disabled={disabled}
                        onChange={onEirsaliyeAliasChange}
                      />
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecekId(null)}
        onOnayla={() => {
          if (!silinecekId) return;
          kisiSil(silinecekId);
          setSilinecekId(null);
        }}
        baslik="Bu adres başlığına sahip kişiyi silmek istediğinize emin misiniz?"
        hedefMetin={silinecek ? kisiSilMetni(silinecek) : ''}
        ariaLabel="İletişim kişisi silme onayı"
      />
    </section>
  );
}
