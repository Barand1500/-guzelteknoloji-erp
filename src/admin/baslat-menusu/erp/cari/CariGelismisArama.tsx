import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalAramaIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';
import { CARI_TIPLERI } from './tipler';
import { bosCariGelismisFiltre, type CariGelismisFiltre } from './cariFiltre';

interface CariGelismisAramaProps {
  acik: boolean;
  filtre: CariGelismisFiltre;
  onFiltreDegistir: (f: CariGelismisFiltre) => void;
  onUygula: () => void;
  onKapat: () => void;
  sonucSayisi: number;
}

const DURUM_SECENEKLERI = [
  { value: '', label: 'Tümü' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'pasif', label: 'Pasif' },
];

const TIP_SECENEKLERI = [
  { value: '', label: 'Tümü' },
  ...CARI_TIPLERI.map((t) => ({ value: t.value, label: t.label })),
];

export function CariGelismisArama({
  acik,
  filtre,
  onFiltreDegistir,
  onUygula,
  onKapat,
  sonucSayisi,
}: CariGelismisAramaProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  const temizle = useCallback(() => {
    onFiltreDegistir(bosCariGelismisFiltre());
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
      aria-label="Gelişmiş cari arama"
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--stok-arama">
        <div className="ap-sil-onay-kart stok-gelismis-arama-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik
            baslik="Gelişmiş Cari Arama"
            ikon={<ModalAramaIkon />}
            onKapat={onKapat}
          />
          <p className="ap-sil-onay-metin stok-gelismis-arama-ozet">
            <strong>{sonucSayisi}</strong> sonuç eşleşiyor
          </p>

          <div className="stok-gelismis-arama-govde">
            <div className="stok-gelismis-arama-grid">
              <TanimGirdi
                etiket="Cari Kodu"
                deger={filtre.cariKodu}
                maxLength={40}
                onChange={(cariKodu) => onFiltreDegistir({ ...filtre, cariKodu })}
              />
              <TanimGirdi
                etiket="Cari Adı"
                deger={filtre.cariAdi}
                maxLength={120}
                onChange={(cariAdi) => onFiltreDegistir({ ...filtre, cariAdi })}
              />
              <TanimGirdi
                etiket="Unvan"
                deger={filtre.unvan}
                maxLength={160}
                onChange={(unvan) => onFiltreDegistir({ ...filtre, unvan })}
              />
              <TanimGirdi
                etiket="Vergi No"
                deger={filtre.vergiNo}
                maxLength={20}
                onChange={(vergiNo) => onFiltreDegistir({ ...filtre, vergiNo })}
              />
              <TanimGirdi
                etiket="Telefon"
                deger={filtre.telefon}
                maxLength={30}
                onChange={(telefon) => onFiltreDegistir({ ...filtre, telefon })}
              />
              <div className="ap-tanimlar-secim-alan stok-gelismis-arama-alan">
                <span className="ap-tanim-girdi-etiket">Cari Tipi</span>
                <FormAcilirSecim
                  value={filtre.cariTipi}
                  onChange={(cariTipi) => onFiltreDegistir({ ...filtre, cariTipi })}
                  secenekler={TIP_SECENEKLERI}
                  aria-label="Cari tipi"
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
