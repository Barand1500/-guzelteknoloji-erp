import { type KeyboardEvent } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { FiyatListeKayit, FiyatSablonu } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

interface FiyatSablonListePanelProps {
  kayit: FiyatListeKayit;
  seciliId: number | null;
  yeniEkleAcik: boolean;
  yeniSablonAd: string;
  onSatirSec: (id: number) => void;
  onYeniSablonAdDegistir: (ad: string) => void;
  onYeniSablonEkle: () => void;
  onAktifDegistir: (id: number, aktif: boolean) => void;
}

export function FiyatSablonListePanel({
  kayit,
  seciliId,
  yeniEkleAcik,
  yeniSablonAd,
  onSatirSec,
  onYeniSablonAdDegistir,
  onYeniSablonEkle,
  onAktifDegistir,
}: FiyatSablonListePanelProps) {
  const secili = seciliId != null ? kayit.sablonlar.find((s) => s.id === seciliId) ?? null : null;
  const baslikAd = secili?.ad ?? '—';

  const enterBas = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onYeniSablonEkle();
    }
  };

  return (
    <div className="ap-fiyat-sablon-liste">
      <div className="ap-fiyat-sablon-aktif-satir">
        <p className="ap-fiyat-sablon-aktif-etiket">
          Aktif Şablon: <strong>{baslikAd}</strong>
        </p>
        {secili && (
          <div className="ap-switch ap-fiyat-sablon-aktif-switch">
            <span className="ap-switch-etiket">{secili.aktif ? 'Aktif' : 'Pasif'}</span>
            <button
              type="button"
              role="switch"
              aria-checked={secili.aktif}
              aria-label={`${secili.ad} aktif durumu`}
              className={`ap-switch-track ${secili.aktif ? 'ap-switch-acik' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onAktifDegistir(secili.id, !secili.aktif);
              }}
            >
              <span className="ap-switch-thumb" />
            </button>
          </div>
        )}
      </div>

      {yeniEkleAcik && (
        <div className="ap-fiyat-yeni-sablon-satir">
          <label className="ap-fiyat-yeni-sablon-alan">
            <span className="ap-fiyat-alt-panel-etiket">Şablon ismi:</span>
            <input
              type="text"
              className={formInputSinifi}
              value={yeniSablonAd}
              onChange={(e) => onYeniSablonAdDegistir(e.target.value)}
              onKeyDown={enterBas}
              placeholder="Yeni şablon adı"
              autoFocus
            />
          </label>
          <p className="ap-fiyat-yeni-sablon-ipucu">Eklemek için Enter tuşuna basın.</p>
        </div>
      )}

      <div className="ap-fiyat-sablon-liste-kutu" role="listbox" aria-label="Fiyat listeleri">
        {kayit.sablonlar.map((sablon: FiyatSablonu) => (
          <button
            key={sablon.id}
            type="button"
            role="option"
            aria-selected={seciliId === sablon.id}
            className={`ap-fiyat-sablon-satir${seciliId === sablon.id ? ' ap-fiyat-sablon-satir-secili' : ''}${!sablon.aktif ? ' ap-fiyat-sablon-satir-pasif' : ''}`}
            onClick={() => onSatirSec(sablon.id)}
          >
            <span>{sablon.ad}</span>
            {!sablon.aktif && <span className="ap-fiyat-sablon-pasif-etiket">Pasif</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
