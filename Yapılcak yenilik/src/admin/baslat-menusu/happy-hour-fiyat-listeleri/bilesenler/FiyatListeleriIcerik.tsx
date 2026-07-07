import { FiyatGuncellePanel } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/bilesenler/FiyatGuncellePanel';
import { FiyatSablonListePanel } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/bilesenler/FiyatSablonListePanel';
import type { FiyatGuncellemeTaslak, FiyatListeAltGorunum, FiyatListeKayit } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

interface FiyatListeleriIcerikProps {
  kayit: FiyatListeKayit;
  seciliId: number | null;
  altGorunum: FiyatListeAltGorunum;
  yeniEkleAcik: boolean;
  yeniSablonAd: string;
  guncelleTaslak: FiyatGuncellemeTaslak | null;
  onSatirSec: (id: number) => void;
  onYeniSablonAdDegistir: (ad: string) => void;
  onYeniSablonEkle: () => void;
  onAktifDegistir: (id: number, aktif: boolean) => void;
  onGuncelleTaslakDegistir: (taslak: FiyatGuncellemeTaslak) => void;
  onAltGeri: () => void;
}

export function FiyatListeleriIcerik({
  kayit,
  seciliId,
  altGorunum,
  yeniEkleAcik,
  yeniSablonAd,
  guncelleTaslak,
  onSatirSec,
  onYeniSablonAdDegistir,
  onYeniSablonEkle,
  onAktifDegistir,
  onGuncelleTaslakDegistir,
  onAltGeri,
}: FiyatListeleriIcerikProps) {
  const guncelleAcik = altGorunum === 'guncelle';

  return (
    <div className="ap-fiyat-liste-hesap-pusula">
      <div className="ap-tanimlar-yan-gecis">
        <div className={`ap-tanimlar-yan-gecis-izgara ${guncelleAcik ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
          <div className="ap-tanimlar-yan-gecis-panel">
            <FiyatSablonListePanel
              kayit={kayit}
              seciliId={seciliId}
              yeniEkleAcik={yeniEkleAcik}
              yeniSablonAd={yeniSablonAd}
              onSatirSec={onSatirSec}
              onYeniSablonAdDegistir={onYeniSablonAdDegistir}
              onYeniSablonEkle={onYeniSablonEkle}
              onAktifDegistir={onAktifDegistir}
            />
          </div>
          <div className="ap-tanimlar-yan-gecis-panel">
            {guncelleAcik && guncelleTaslak && (
              <FiyatGuncellePanel
                taslak={guncelleTaslak}
                onTaslakDegistir={onGuncelleTaslakDegistir}
                onGeri={onAltGeri}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
