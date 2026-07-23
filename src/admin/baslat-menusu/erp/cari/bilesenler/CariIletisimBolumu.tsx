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

function AdresBaslikPinIkon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden>
      <path
        d="M8 1.6c-2.4 0-4.4 1.9-4.4 4.3 0 3.2 4.4 8.5 4.4 8.5s4.4-5.3 4.4-8.5C12.4 3.5 10.4 1.6 8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="5.9" r="1.45" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function CariIletisimBolumu({
  kisiler,
  efatura = false,
  earsiv = false,
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
  efatura?: boolean;
  earsiv?: boolean;
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
  const [baslikOdakId, setBaslikOdakId] = useState<string | null>(null);
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
            const baslikVar = !!kisi.adresBasligi.trim();
            const baslikOdakta = baslikOdakId === kisi.id;

            return (
              <article key={kisi.id} className="cari-iletisim-kart">
                <label
                  className={`cari-iletisim-kart-baslik${baslikOdakta ? ' cari-iletisim-kart-baslik--odak' : ''}${baslikVar ? '' : ' cari-iletisim-kart-baslik--bos'}${disabled ? ' cari-iletisim-kart-baslik--pasif' : ''}`}
                  title="Adres başlığı"
                >
                  <span className="cari-iletisim-kart-baslik-ikon" aria-hidden>
                    <AdresBaslikPinIkon />
                  </span>
                  <input
                    type="text"
                    className="cari-iletisim-kart-baslik-input"
                    value={kisi.adresBasligi}
                    maxLength={80}
                    placeholder="Merkez, Şube…"
                    size={Math.max(1, kisi.adresBasligi.length || 1)}
                    disabled={disabled}
                    aria-label="Adres başlığı"
                    onFocus={() => setBaslikOdakId(kisi.id)}
                    onBlur={() => setBaslikOdakId((id) => (id === kisi.id ? null : id))}
                    onChange={(e) => kisiGuncelle(kisi.id, { adresBasligi: e.target.value })}
                  />
                </label>

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
                  <CariOutlinedGirdi
                    etiket="Adres"
                    deger={kisi.adres}
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
                  <div className="cari-il-ilce-cift">
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
                  </div>
                  <div className="cari-telefon-gsm-cift">
                    <CariOutlinedTelefon
                      deger={kisi.telefon}
                      disabled={disabled}
                      onChange={(telefon) => kisiGuncelle(kisi.id, { telefon })}
                    />
                    <CariOutlinedTelefon
                      etiket="GSM"
                      deger={kisi.gsm}
                      disabled={disabled}
                      dogrulaAktif
                      gsmMi
                      onChange={(gsm) => kisiGuncelle(kisi.id, { gsm })}
                    />
                  </div>
                  <div className="cari-eposta-web-cift">
                    <CariOutlinedEposta
                      deger={kisi.eposta}
                      disabled={disabled}
                      dogrulaAktif
                      onChange={(eposta) => kisiGuncelle(kisi.id, { eposta })}
                    />
                    <CariOutlinedGirdi
                      etiket="Web"
                      deger={kisi.web}
                      maxLength={120}
                      odakPlaceholder="www.ornek.com"
                      disabled={disabled}
                      onChange={(web) => kisiGuncelle(kisi.id, { web })}
                    />
                  </div>
                  {index === 0 && (efatura || earsiv) ? (
                    <>
                      {efatura ? (
                        <CariOutlinedGirdi
                          etiket="E-Fatura Alias"
                          deger={efaturaAlias}
                          maxLength={200}
                          odakPlaceholder="Alias giriniz"
                          disabled={disabled}
                          onChange={onEfaturaAliasChange}
                        />
                      ) : null}
                      {earsiv ? (
                        <CariOutlinedGirdi
                          etiket="E-İrsaliye Alias"
                          deger={eirsaliyeAlias}
                          maxLength={200}
                          odakPlaceholder="Alias giriniz"
                          disabled={disabled}
                          onChange={onEirsaliyeAliasChange}
                        />
                      ) : null}
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
