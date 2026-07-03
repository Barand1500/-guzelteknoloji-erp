import { createPortal } from 'react-dom';
import { modulBul } from '@/admin/veri/adminMenuYapisi';
import type { AdminSekme } from '@/admin/ortak/tipler/admin';

interface SekmeHoverOnizlemeProps {
  sekme: AdminSekme | null;
  anchorRect: DOMRect | null;
  aktif: boolean;
  gorselUrl?: string | null;
  gorselYukleniyor?: boolean;
}

const ONIZLEME_GENISLIK = 300;

export function SekmeHoverOnizleme({
  sekme,
  anchorRect,
  aktif,
  gorselUrl,
  gorselYukleniyor,
}: SekmeHoverOnizlemeProps) {
  if (!sekme || !anchorRect || typeof document === 'undefined') return null;

  const modul = modulBul(sekme.modulId);
  const ikon = modul?.ikon ?? '📄';
  const modulBaslik = modul?.baslik ?? sekme.baslik;
  const kategori = modul?.kategori ?? 'Panel';
  const gorselVar = Boolean(gorselUrl);

  let left = anchorRect.left + anchorRect.width / 2 - ONIZLEME_GENISLIK / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - ONIZLEME_GENISLIK - 8));

  const ustSinir = 52;
  const altKonum = anchorRect.bottom + 10;
  const ustKonum = anchorRect.top - 10;
  const tahminiYukseklik = gorselVar ? 228 : 196;
  const alttaYer = altKonum + tahminiYukseklik < window.innerHeight - 8;
  const top = alttaYer ? altKonum : Math.max(ustSinir, ustKonum - tahminiYukseklik);

  return createPortal(
    <div
      className={`ap-sekme-hover-onizleme${alttaYer ? '' : ' ap-sekme-hover-onizleme-ust'}`}
      style={{ left, top, width: ONIZLEME_GENISLIK }}
      role="tooltip"
      aria-label={`${sekme.baslik} önizlemesi`}
    >
      <div className={`ap-sekme-hover-onizleme-pencere${aktif ? ' ap-sekme-hover-onizleme-pencere-aktif' : ''}`}>
        <div className="ap-sekme-hover-onizleme-baslik-cubugu">
          <span className="ap-sekme-hover-onizleme-noktalar" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="ap-sekme-hover-onizleme-pencere-baslik">{sekme.baslik}</span>
        </div>

        {gorselVar ? (
          <div className="ap-sekme-hover-onizleme-govde-gorsel">
            <img
              src={gorselUrl!}
              alt=""
              className="ap-sekme-hover-onizleme-gorsel"
              draggable={false}
            />
          </div>
        ) : (
          <div className={`ap-sekme-hover-onizleme-govde${gorselYukleniyor ? ' ap-sekme-hover-onizleme-govde-yukleniyor' : ''}`}>
            {gorselYukleniyor ? (
              <div className="ap-sekme-hover-onizleme-yukleniyor">
                <div className="ap-sekme-hover-onizleme-yukleniyor-cubuk" />
                <p>İçerik alınıyor...</p>
              </div>
            ) : (
              <>
                <span className="ap-sekme-hover-onizleme-buyuk-ikon" aria-hidden>
                  {ikon}
                </span>
                <p className="ap-sekme-hover-onizleme-modul-ad">{modulBaslik}</p>
                <p className="ap-sekme-hover-onizleme-kategori">{kategori}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="ap-sekme-hover-onizleme-alt">
        <span className="ap-sekme-hover-onizleme-alt-ikon" aria-hidden>
          {ikon}
        </span>
        <div className="ap-sekme-hover-onizleme-alt-metin">
          <p className="ap-sekme-hover-onizleme-alt-baslik">{sekme.baslik}</p>
          <p className="ap-sekme-hover-onizleme-alt-alt">
            {aktif ? 'Aktif sekme' : 'Geçmek için tıklayın'}
            {sekme.kaydedilmedi ? ' · Kaydedilmemiş değişiklik' : ''}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
