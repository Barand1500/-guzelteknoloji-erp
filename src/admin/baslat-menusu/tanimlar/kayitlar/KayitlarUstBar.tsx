import type { AdminFirma } from '@/admin/baslat-menusu/tanimlar/tipler';
import { FirmaAramaSecici } from './FirmaAramaSecici';

interface KayitlarUstBarProps {
  firmalar: AdminFirma[];
  seciliFirmaId: string | null;
  onFirmaSec: (firmaId: string) => void;
  eklemeVar: boolean;
  duzenlemeVar: boolean;
  firmaPasif: boolean;
  onFirmaEkle: () => void;
  onFirmaDuzenle: () => void;
}

export function KayitlarUstBar({
  firmalar,
  seciliFirmaId,
  onFirmaSec,
  eklemeVar,
  duzenlemeVar,
  firmaPasif,
  onFirmaEkle,
  onFirmaDuzenle,
}: KayitlarUstBarProps) {
  return (
    <div className="ap-tanimlar-ust-bar">
      <div className="ap-tanimlar-ust-bar-satir">
        <div className="ap-tanimlar-firma-secici ap-tanimlar-firma-secici--genis">
          <FirmaAramaSecici
            firmalar={firmalar}
            seciliFirmaId={seciliFirmaId}
            onSec={onFirmaSec}
          />
        </div>

        <div className="ap-tanimlar-ekle-cubuk" role="toolbar" aria-label="Firma işlemleri">
          {eklemeVar ? (
            <button
              type="button"
              className="ap-tanimlar-ekle-tus ap-tanimlar-ekle-tus--birincil"
              onClick={onFirmaEkle}
              title="Yeni firma"
            >
              + Firma
            </button>
          ) : null}
          {duzenlemeVar && seciliFirmaId ? (
            <button
              type="button"
              className="ap-tanimlar-ekle-tus"
              onClick={onFirmaDuzenle}
              disabled={firmaPasif}
              title={firmaPasif ? 'Pasif firma' : 'Seçili firmayı düzenle'}
            >
              Firmayı düzenle
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
