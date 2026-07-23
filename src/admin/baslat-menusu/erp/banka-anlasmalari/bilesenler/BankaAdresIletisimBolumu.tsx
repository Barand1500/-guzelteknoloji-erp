import { useState } from 'react';
import type { CariIletisimKisi } from '@/admin/baslat-menusu/erp/cari/tipler';
import { bosIletisimKisi, iletisimKisiBosMu } from '@/admin/baslat-menusu/erp/cari/cariIletisimDeposu';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { CariOutlinedEposta } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedEposta';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import {
  CariOutlinedIl,
  CariOutlinedIlce,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedIlArama';
import { CariOutlinedTelefon } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedTelefon';

function kisiSilMetni(kisi: CariIletisimKisi): string {
  return kisi.adresBasligi.trim() || 'Adsız adres başlığı';
}

export function BankaAdresIletisimBolumu({
  kisiler,
  disabled,
  onChange,
  onBolumKaldir,
}: {
  kisiler: CariIletisimKisi[];
  disabled?: boolean;
  onChange: (kisiler: CariIletisimKisi[]) => void;
  onBolumKaldir?: () => void;
}) {
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [acik, setAcik] = useState(true);
  const bosFormVar = kisiler.some((k) => iletisimKisiBosMu(k));
  const silinecek = silinecekId ? kisiler.find((k) => k.id === silinecekId) : undefined;
  const panelAcik = acik && kisiler.length > 0;

  const kisiGuncelle = (id: string, parca: Partial<CariIletisimKisi>) => {
    onChange(kisiler.map((k) => (k.id === id ? { ...k, ...parca } : k)));
  };

  const kisiEkle = () => {
    if (bosFormVar) return;
    onChange([bosIletisimKisi('', ''), ...kisiler]);
    setAcik(true);
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
        {kisiler.length > 0 ? (
          <button
            type="button"
            className="cari-bolum-kucult"
            onClick={() => setAcik((v) => !v)}
            title={acik ? 'Küçült' : 'Aç'}
            aria-expanded={acik}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
              <path
                d={acik ? 'M4.2 9.8 8 6.2l3.8 3.6' : 'M4.2 6.2 8 9.8l3.8-3.6'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
        {!disabled && onBolumKaldir ? (
          <button
            type="button"
            className="ba-bolum-kaldir"
            onClick={onBolumKaldir}
            title="Kısmı kaldır"
            aria-label="Adres / İletişim kısmını kaldır"
          >
            <DgIkon ad="sil" />
          </button>
        ) : null}
      </div>

      {panelAcik ? (
        <div className="cari-iletisim-liste">
          {kisiler.map((kisi) => (
            <article key={kisi.id} className="cari-iletisim-kart">
              <label className="cari-iletisim-kart-baslik" title="Adres başlığı">
                <input
                  type="text"
                  className="cari-iletisim-kart-baslik-input"
                  value={kisi.adresBasligi}
                  maxLength={80}
                  placeholder="Merkez, Şube…"
                  disabled={disabled}
                  aria-label="Adres başlığı"
                  onChange={(e) => kisiGuncelle(kisi.id, { adresBasligi: e.target.value })}
                />
              </label>
              {!disabled ? (
                <button
                  type="button"
                  className="cari-iletisim-kart-sil"
                  title="Sil"
                  aria-label="Kişiyi sil"
                  onClick={() => setSilinecekId(kisi.id)}
                >
                  <DgIkon ad="sil" />
                </button>
              ) : null}
              <div className="cari-iletisim-kart-grid">
                <CariOutlinedGirdi
                  etiket="Ad Soyad"
                  deger={kisi.adSoyad}
                  maxLength={120}
                  disabled={disabled}
                  onChange={(adSoyad) => kisiGuncelle(kisi.id, { adSoyad })}
                />
                <CariOutlinedGirdi
                  etiket="Görevi"
                  deger={kisi.gorevi}
                  maxLength={80}
                  disabled={disabled}
                  onChange={(gorevi) => kisiGuncelle(kisi.id, { gorevi })}
                />
                <CariOutlinedEposta
                  deger={kisi.eposta}
                  disabled={disabled}
                  onChange={(eposta) => kisiGuncelle(kisi.id, { eposta })}
                />
                <CariOutlinedTelefon
                  etiket="Telefon"
                  deger={kisi.telefon}
                  disabled={disabled}
                  onChange={(telefon) => kisiGuncelle(kisi.id, { telefon })}
                />
                <CariOutlinedTelefon
                  etiket="GSM"
                  deger={kisi.gsm}
                  gsmMi
                  disabled={disabled}
                  onChange={(gsm) => kisiGuncelle(kisi.id, { gsm })}
                />
                <CariOutlinedGirdi
                  etiket="Web"
                  deger={kisi.web}
                  maxLength={120}
                  disabled={disabled}
                  onChange={(web) => kisiGuncelle(kisi.id, { web })}
                />
                <CariOutlinedIl
                  deger={kisi.il}
                  disabled={disabled}
                  onChange={(il) => kisiGuncelle(kisi.id, { il, ilce: '' })}
                />
                <CariOutlinedIlce
                  il={kisi.il}
                  deger={kisi.ilce}
                  disabled={disabled}
                  onChange={(ilce) => kisiGuncelle(kisi.id, { ilce })}
                />
                <CariOutlinedGirdi
                  className="cari-alan-tam"
                  etiket="Adres"
                  deger={kisi.adres}
                  maxLength={500}
                  disabled={disabled}
                  onChange={(adres) => kisiGuncelle(kisi.id, { adres })}
                />
              </div>
            </article>
          ))}
        </div>
      ) : kisiler.length === 0 ? (
        <p className="ba-kisim-bos-ipucu">+ ile adres / iletişim kartı ekleyebilirsiniz.</p>
      ) : null}

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecekId(null)}
        onOnayla={() => {
          if (!silinecekId) return;
          onChange(kisiler.filter((k) => k.id !== silinecekId));
          setSilinecekId(null);
        }}
        baslik="Bu iletişim kaydını silmek istiyor musunuz?"
        hedefMetin={silinecek ? `«${kisiSilMetni(silinecek)}»` : ''}
        ariaLabel="İletişim silme onayı"
      />
    </section>
  );
}
