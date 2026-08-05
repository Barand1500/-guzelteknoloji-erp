import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalAramaIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariTipiEtiketi } from '@/admin/baslat-menusu/erp/cari/tipler';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface FaturaCariBulModalProps {
  acik: boolean;
  cariler: AdminCari[];
  onKapat: () => void;
  onSec: (cariId: string) => void;
}

export function FaturaCariBulModal({ acik, cariler, onKapat, onSec }: FaturaCariBulModalProps) {
  const [arama, setArama] = useState('');
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  useEffect(() => {
    if (!acik) return;
    setArama('');
  }, [acik]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, portalKok, onKapat]);

  const sonuclar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return cariler.slice(0, 50);
    return cariler
      .filter((c) => {
        const tip = cariTipiEtiketi(c.cariTipi);
        const metin = `${c.cariKodu} ${c.cariAdi} ${c.unvan} ${c.vergiNo} ${tip} ${c.cariTipi}`.toLocaleLowerCase(
          'tr'
        );
        return metin.includes(q);
      })
      .slice(0, 50);
  }, [arama, cariler]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div
      className="ap-sil-onay-modal fatura-cari-bul-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Cari Bul"
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--fatura-cari-bul">
        <div className="ap-sil-onay-kart ap-sil-onay-kart--sol-baslik fatura-cari-bul-kart">
          <ModalSolBaslik baslik="Cari Bul" ikon={<ModalAramaIkon />} onKapat={onKapat} />

          <div className="fatura-cari-bul">
            <input
              type="search"
              className="fatura-cari-bul-ara ap-input"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Cari kodu, unvan, vergi no…"
              autoFocus
            />
            <div className="fatura-cari-bul-liste">
              {sonuclar.length === 0 ? (
                <p className="fatura-bos fatura-cari-bul-bos">Eşleşen cari bulunamadı.</p>
              ) : (
                <ul>
                  {sonuclar.map((c) => {
                    const tipEtiket = cariTipiEtiketi(c.cariTipi) || c.cariTipi || '';
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="fatura-cari-bul-oge"
                          onClick={() => {
                            onSec(c.id);
                            setArama('');
                            onKapat();
                          }}
                        >
                          <span className="fatura-cari-bul-kod">{c.cariKodu}</span>
                          <span className="fatura-cari-bul-unvan">{c.cariAdi || c.unvan || '—'}</span>
                          {tipEtiket ? <span className="fatura-cari-bul-vkn">{tipEtiket}</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
