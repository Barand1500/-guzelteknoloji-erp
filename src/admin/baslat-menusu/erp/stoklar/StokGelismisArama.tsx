import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { stokTipleriGetir } from './stokTipleri';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';
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
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  const temizle = useCallback(() => {
    onFiltreDegistir({ ...BOS_FILTRE });
  }, [onFiltreDegistir]);

  const klavyeIsle = useCallback(
    (e: KeyboardEvent) => {
      if (!acik || sekmePortaliGizliMi(portalKok)) return;
      const hedef = e.target as HTMLElement | null;
      const girdiMi =
        hedef?.tagName === 'INPUT' ||
        hedef?.tagName === 'TEXTAREA' ||
        hedef?.isContentEditable;
      const acilirListeVar = Boolean(document.querySelector('.ap-form-acilir-secim-liste'));

      if (e.key === 'Escape') {
        if (acilirListeVar) return;
        e.preventDefault();
        onKapat();
        return;
      }

      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (girdiMi || acilirListeVar || hedef?.closest('.ap-form-acilir-secim')) return;
        e.preventDefault();
        temizle();
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (acilirListeVar || hedef?.closest('.ap-form-acilir-secim')) return;
        e.preventDefault();
        onUygula();
      }
    },
    [acik, onKapat, onUygula, temizle, portalKok]
  );

  useEffect(() => {
    if (!acik) return;
    document.addEventListener('keydown', klavyeIsle);
    return () => document.removeEventListener('keydown', klavyeIsle);
  }, [acik, klavyeIsle]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div
      className="ap-sil-onay-modal stok-gelismis-arama"
      role="dialog"
      aria-modal="true"
      aria-label="Gelişmiş stok arama"
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--stok-arama">
        <div className="ap-sil-onay-kart stok-gelismis-arama-kart">
          <button type="button" className="stok-gelismis-arama-vazgec" onClick={onKapat}>
            <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
          </button>

          <div className="ap-sil-onay-ikon stok-gelismis-arama-ikon" aria-hidden>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.25" />
              <path
                d="M16.2 16.2 20 20"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="ap-sil-onay-baslik">Gelişmiş Stok Arama</h3>
          <p className="ap-sil-onay-metin stok-gelismis-arama-ozet">
            <strong>{sonucSayisi}</strong> sonuç eşleşiyor
          </p>

          <div className="stok-gelismis-arama-govde">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <div className="ap-tanimlar-secim-alan stok-gelismis-arama-alan">
                <span className="ap-tanim-girdi-etiket">Stok Tipi</span>
                <FormAcilirSecim
                  value={filtre.urunTipi}
                  onChange={(urunTipi) => onFiltreDegistir({ ...filtre, urunTipi })}
                  secenekler={[{ value: '', label: 'Tümü' }, ...stokTipleriGetir().map((x) => ({ ...x }))]}
                  aria-label="Stok Tipi"
                />
              </div>
              <div className="ap-tanimlar-secim-alan stok-gelismis-arama-alan">
                <span className="ap-tanim-girdi-etiket">Durum</span>
                <FormAcilirSecim
                  value={filtre.durum}
                  onChange={(durum) => onFiltreDegistir({ ...filtre, durum })}
                  secenekler={DURUM_SECENEKLERI}
                  aria-label="Durum"
                />
              </div>
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

          <div className="ap-sil-onay-aksiyonlar stok-gelismis-arama-aksiyonlar">
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={temizle}>
              <ModalTusIcerik metin="Temizle" kisayol="T" />
            </button>
            <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={onUygula}>
              <ModalTusIcerik metin="Uygula" kisayol="Enter" />
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
