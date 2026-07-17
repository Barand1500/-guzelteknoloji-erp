import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { URUN_TIPLERI } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import type { StokGelismisFiltre } from './tipler';

interface StokGelismisAramaProps {
  acik: boolean;
  filtre: StokGelismisFiltre;
  onFiltreDegistir: (f: StokGelismisFiltre) => void;
  onUygula: () => void;
  onKapat: () => void;
  sonucSayisi: number;
}

const DURUM_SECENEKLERI = [
  { value: '', label: 'Tümü' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'pasif', label: 'Pasif' },
];

const BOS_FILTRE: StokGelismisFiltre = {
  urunTipi: '',
  urunKodu: '',
  sinifGrup: '',
  urunAdi: '',
  durum: '',
};

export function StokGelismisArama({
  acik,
  filtre,
  onFiltreDegistir,
  onUygula,
  onKapat,
  sonucSayisi,
}: StokGelismisAramaProps) {
  const klavyeIsle = useCallback(
    (e: KeyboardEvent) => {
      if (!acik) return;
      // Bir açılır liste (combobox) açıkken Esc/Enter'ı ona bırak
      const acilirListeVar = Boolean(document.querySelector('.ap-form-acilir-secim-liste'));
      if (e.key === 'Escape') {
        if (acilirListeVar) return;
        e.preventDefault();
        onKapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const hedef = e.target as HTMLElement | null;
        if (acilirListeVar || hedef?.closest('.ap-form-acilir-secim')) return;
        e.preventDefault();
        onUygula();
      }
    },
    [acik, onKapat, onUygula]
  );

  useEffect(() => {
    if (!acik) return;
    window.addEventListener('keydown', klavyeIsle);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', klavyeIsle);
      document.body.style.overflow = '';
    };
  }, [acik, klavyeIsle]);

  if (!acik) return null;

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <div
      className="stok-gelismis-arama"
      role="dialog"
      aria-modal="true"
      aria-label="Gelişmiş stok arama"
    >
      <div className="stok-gelismis-arama-perde" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--stok-arama">
        <div className="stok-gelismis-arama-kart">
          <header className="stok-gelismis-arama-kart-baslik">
            <span className="stok-gelismis-arama-ikon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M16.2 16.2 20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="stok-gelismis-arama-kart-baslik-metin">
              <h3 className="stok-gelismis-arama-kart-etiket">Gelişmiş Stok Arama</h3>
              <p className="stok-gelismis-arama-kart-alt">
                <strong>{sonucSayisi}</strong> sonuç eşleşiyor
              </p>
            </div>
            <button type="button" className="stok-gelismis-arama-temizle" onClick={onKapat}>
              Vazgeç
            </button>
          </header>

          <div className="stok-gelismis-arama-govde">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <label className="ap-tanimlar-secim-alan block">
                <span className="ap-tanim-girdi-etiket">Stok Tipi</span>
                <FormAcilirSecim
                  value={filtre.urunTipi}
                  onChange={(urunTipi) => onFiltreDegistir({ ...filtre, urunTipi })}
                  secenekler={[{ value: '', label: 'Tümü' }, ...URUN_TIPLERI.map((x) => ({ ...x }))]}
                />
              </label>
              <label className="ap-tanimlar-secim-alan block">
                <span className="ap-tanim-girdi-etiket">Durum</span>
                <FormAcilirSecim
                  value={filtre.durum}
                  onChange={(durum) => onFiltreDegistir({ ...filtre, durum })}
                  secenekler={DURUM_SECENEKLERI}
                />
              </label>
              <TanimGirdi
                etiket="Stok Kodu"
                deger={filtre.urunKodu}
                maxLength={30}
                onChange={(urunKodu) => onFiltreDegistir({ ...filtre, urunKodu })}
              />
              <TanimGirdi
                etiket="Sınıf Grup"
                deger={filtre.sinifGrup}
                maxLength={50}
                onChange={(sinifGrup) => onFiltreDegistir({ ...filtre, sinifGrup })}
              />
              <TanimGirdi
                etiket="Stok Adı"
                deger={filtre.urunAdi}
                maxLength={255}
                onChange={(urunAdi) => onFiltreDegistir({ ...filtre, urunAdi })}
                className="stok-gelismis-arama-tam"
              />
            </div>
          </div>

          <div className="stok-gelismis-arama-aksiyonlar">
            <button
              type="button"
              className="stok-gelismis-arama-tus stok-gelismis-arama-tus--iptal"
              onClick={() => onFiltreDegistir({ ...BOS_FILTRE })}
            >
              <ModalTusIcerik metin="Temizle" />
            </button>
            <button
              type="button"
              className="stok-gelismis-arama-tus stok-gelismis-arama-tus--onay"
              onClick={onUygula}
            >
              <ModalTusIcerik metin="Uygula" kisayol="Enter" />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
